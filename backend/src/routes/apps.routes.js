import { Router } from 'express';
import { db, findApp, addAudit, addActivity, initials, uptimeHistory, uptimePct } from '../data/store.js';
import { HttpError } from '../middleware/errors.js';
import { required, includesText, ENVS } from '../utils/helpers.js';

const r = Router();
const COLORS = ['#2563eb', '#7c3aed', '#0891b2', '#16a34a', '#ea580c', '#db2777', '#4f46e5', '#0d9488'];

r.get('/', (req, res) => {
  const { q, env, status } = req.query;
  const items = db.apps.filter(
    (a) => includesText(`${a.name} ${a.code}`, q) && (!env || a.env === env) && (!status || a.status === status),
  );
  res.json({ items, total: items.length });
});

r.get('/:code', (req, res) => {
  const app = findApp(req.params.code);
  if (!app) throw new HttpError(404, 'Sistema no encontrado');
  res.json({
    ...app,
    uptimeHistory: uptimeHistory(app.status),
    uptime: uptimePct(app.status),
    roleCounts: { 'Admin App': 3, Supervisor: 12, Operador: Math.max(app.users - 20, 1), Auditor: 2, 'Solo lectura': 3 },
  });
});

r.post('/', (req, res) => {
  required(req.body, ['name', 'code', 'baseUrl']);
  const { name, code, baseUrl, healthEndpoint = '/api/health', env = 'DEV', owner = req.user.name, description = '' } = req.body;
  if (!/^[a-z0-9-]+$/.test(code)) throw new HttpError(400, 'El código solo admite minúsculas, números y guiones');
  if (findApp(code)) throw new HttpError(409, `Ya existe un sistema con el código "${code}"`);
  if (!ENVS.includes(env)) throw new HttpError(400, 'Ambiente inválido');

  const app = {
    id: code, name, code, env, version: '0.1.0', owner, users: 0, status: 'ok',
    lastDeploy: new Date().toISOString(), color: COLORS[db.apps.length % COLORS.length],
    baseUrl, healthEndpoint, description, auth: 'Entra ID (OIDC) · client credentials', active: true, latencyP95: null,
  };
  db.apps.push(app);
  addAudit({ user: req.user.name, action: 'CREATE', entity: `App · ${name}`, detail: `Registro en ${env}`, ip: req.clientIp, appCode: code });
  addActivity({ initials: initials(req.user.name), tone: 'ok', html: `<b>${req.user.name}</b> registró el sistema <b>${name}</b>`, meta: env });
  res.status(201).json(app);
});

r.patch('/:code', (req, res) => {
  const app = findApp(req.params.code);
  if (!app) throw new HttpError(404, 'Sistema no encontrado');
  const editable = ['name', 'baseUrl', 'healthEndpoint', 'owner', 'description', 'env', 'active'];
  const changes = Object.fromEntries(Object.entries(req.body).filter(([k]) => editable.includes(k)));
  Object.assign(app, changes);
  addAudit({
    user: req.user.name, action: 'UPDATE', entity: `App · ${app.name}`,
    detail: Object.keys(changes).join(', ') || 'sin cambios', ip: req.clientIp, appCode: app.code,
  });
  res.json(app);
});

export default r;
