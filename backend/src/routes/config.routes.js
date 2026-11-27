import { Router } from 'express';
import { findApp, getConfig, addAudit } from '../data/store.js';
import { createApproval } from '../services/approvals.service.js';
import { HttpError } from '../middleware/errors.js';
import { required } from '../utils/helpers.js';

const r = Router();

function load(req) {
  const app = findApp(req.params.appCode);
  if (!app) throw new HttpError(404, 'Sistema no encontrado');
  const env = (req.query.env || req.body?.env || 'PROD').toUpperCase();
  return { app, env, cfg: getConfig(app.code, env) };
}

r.get('/:appCode', (req, res) => {
  const { app, env, cfg } = load(req);
  res.json({ app: { code: app.code, name: app.name }, env, requiresApproval: env === 'PROD', ...cfg });
});

/** Cambio de parámetro: en PROD genera solicitud de aprobación; en QA/DEV se aplica directo. */
r.post('/:appCode/params', (req, res) => {
  required(req.body, ['key', 'value']);
  const { app, env, cfg } = load(req);
  const { key, value, description = '', reason = '', approver } = req.body;
  const existing = cfg.params.find((p) => p.key === key);

  if (env === 'PROD') {
    const approval = createApproval({
      type: 'CONFIG_PARAM', title: existing ? 'Cambio de parámetro' : 'Alta de parámetro', appCode: app.code, env,
      requestedBy: req.user.name, approver, reason,
      before: existing ? `${key}: ${existing.value}` : '—', after: `${key}: ${value}`,
      payload: { key, value: String(value), description },
    });
    return res.status(202).json({ pendingApproval: true, approval });
  }

  if (existing) { existing.value = String(value); existing.version += 1; }
  else cfg.params.push({ key, value: String(value), description, version: 1 });
  addAudit({ user: req.user.name, action: 'UPDATE', entity: `Config · ${app.name}`, detail: `${key} → ${value} (${env})`, ip: req.clientIp, appCode: app.code });
  res.json({ pendingApproval: false, params: cfg.params });
});

r.patch('/:appCode/flags/:flagKey', (req, res) => {
  const { app, env, cfg } = load(req);
  const flag = cfg.flags.find((f) => f.key === req.params.flagKey);
  if (!flag) throw new HttpError(404, 'Feature flag no encontrado');
  const enabled = Boolean(req.body.enabled);

  if (env === 'PROD') {
    const approval = createApproval({
      type: 'CONFIG_FLAG', title: 'Cambio de feature flag', appCode: app.code, env,
      requestedBy: req.user.name, approver: req.body.approver, reason: req.body.reason || `Cambio de ${flag.name}`,
      before: `${flag.key}: ${flag.enabled}`, after: `${flag.key}: ${enabled}`, payload: { key: flag.key, enabled },
    });
    return res.status(202).json({ pendingApproval: true, approval });
  }

  flag.enabled = enabled;
  addAudit({ user: req.user.name, action: 'UPDATE', entity: `Flag · ${app.name}`, detail: `${flag.key} → ${enabled} (${env})`, ip: req.clientIp, appCode: app.code });
  res.json({ pendingApproval: false, flag });
});

export default r;
