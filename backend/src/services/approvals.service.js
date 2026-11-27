import { db, nextId, findApp, getConfig, getPermissions, addAudit, addActivity, initials } from '../data/store.js';
import { HttpError } from '../middleware/errors.js';

/** Crea una solicitud de cambio (maker-checker). */
export function createApproval({ type, title, appCode, env, requestedBy, approver, before, after, reason, payload }) {
  if (!reason || !reason.trim()) throw new HttpError(400, 'El motivo del cambio es obligatorio');
  const approval = {
    id: nextId('apr'), type, title, appCode, env, requestedBy, approver: approver || null,
    requestedAt: new Date().toISOString(), before, after, reason, payload, status: 'pending',
  };
  db.approvals.unshift(approval);
  return approval;
}

/** Aplica el cambio aprobado sobre los datos. */
function applyApproval(a) {
  const app = findApp(a.appCode);
  switch (a.type) {
    case 'CONFIG_PARAM': {
      const cfg = getConfig(a.appCode, a.env);
      const p = cfg.params.find((x) => x.key === a.payload.key);
      if (p) { p.value = String(a.payload.value); p.version += 1; }
      else cfg.params.push({ key: a.payload.key, value: String(a.payload.value), description: a.payload.description || '', version: 1 });
      break;
    }
    case 'CONFIG_FLAG': {
      const f = getConfig(a.appCode, a.env).flags.find((x) => x.key === a.payload.key);
      if (f) f.enabled = Boolean(a.payload.enabled);
      break;
    }
    case 'ROLE': {
      if (!db.roles.includes(a.payload.role)) db.roles.push(a.payload.role);
      getPermissions(a.appCode).forEach((p) => {
        const action = p.key.split(':').slice(1).join(':');
        p.values[a.payload.role] = a.payload.permissions.includes(action);
      });
      break;
    }
    case 'DEPLOY': {
      if (app) { app.version = a.payload.version; app.lastDeploy = new Date().toISOString(); }
      break;
    }
    default:
      break;
  }
}

export function decideApproval(id, decision, user, ip) {
  const a = db.approvals.find((x) => x.id === id);
  if (!a) throw new HttpError(404, 'Solicitud no encontrada');
  if (a.status !== 'pending') throw new HttpError(409, 'La solicitud ya fue resuelta');
  if (a.requestedBy === user.name) throw new HttpError(403, 'Un cambio debe ser aprobado por un administrador distinto al solicitante');

  a.status = decision === 'approve' ? 'approved' : 'rejected';
  a.decidedBy = user.name;
  a.decidedAt = new Date().toISOString();
  if (a.status === 'approved') applyApproval(a);

  const appName = findApp(a.appCode)?.name || a.appCode;
  addAudit({
    user: user.name, action: a.status === 'approved' ? 'APPROVE' : 'REJECT',
    entity: `${a.title} · ${appName}`, detail: `${a.before} → ${a.after}`, ip, appCode: a.appCode,
  });
  addActivity({
    initials: initials(user.name), tone: a.status === 'approved' ? 'ok' : 'err',
    html: `<b>${user.name}</b> ${a.status === 'approved' ? 'aprobó' : 'rechazó'} «${a.title}» de <b>${appName}</b>`,
  });
  return a;
}
