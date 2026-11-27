import * as seed from './seed.js';
import { ENVS } from '../utils/helpers.js';

/** Almacenamiento en memoria. Los datos se reinician al reiniciar el servidor. */
export const db = {
  apps: structuredClone(seed.apps),
  areas: structuredClone(seed.areas),
  users: structuredClone(seed.users),
  roles: [...seed.roles],
  approvals: structuredClone(seed.approvals),
  audit: structuredClone(seed.audit),
  activity: structuredClone(seed.activity),
  hourlyMetrics: structuredClone(seed.hourlyMetrics),
  permissions: {}, // { [appCode]: [{ key, label, values: { [rol]: bool } }] }
  config: {}, // { [appCode]: { [env]: { params, flags } } }
};

let seq = 2000;
export const nextId = (prefix) => `${prefix}-${++seq}`;

export function findApp(code) {
  return db.apps.find((a) => a.code === code || a.id === code);
}

export function getPermissions(appCode) {
  if (!db.permissions[appCode]) {
    const prefix = appCode.split('-')[0];
    db.permissions[appCode] = seed.permissionTemplate.map(([action, label, vals]) => ({
      key: `${prefix}:${action}`,
      label,
      values: Object.fromEntries(db.roles.map((r, i) => [r, Boolean(vals[i])])),
    }));
  }
  return db.permissions[appCode];
}

export function getConfig(appCode, env) {
  if (!ENVS.includes(env)) env = 'PROD';
  db.config[appCode] ??= {};
  db.config[appCode][env] ??= structuredClone(seed.configTemplate);
  return db.config[appCode][env];
}

export function addAudit({ user, action, entity, detail, ip = '—', appCode = null }) {
  const entry = { id: nextId('aud'), at: new Date().toISOString(), user, action, entity, detail, ip, appCode };
  db.audit.unshift(entry);
  return entry;
}

export function addActivity({ initials, tone = 'info', html, meta = '' }) {
  db.activity.unshift({ id: nextId('act'), initials, tone, html, at: new Date().toISOString(), meta });
  db.activity = db.activity.slice(0, 20);
}

export const initials = (name) =>
  name.split(' ').filter((w) => w.length > 2).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

/** Historial de disponibilidad de 30 días ('' = ok, 'w' = degradado, 'e' = caída). */
export function uptimeHistory(status) {
  return Array.from({ length: 30 }, (_, d) => {
    if (status === 'warn' && (d === 22 || d === 27)) return 'w';
    if (status === 'err' && d >= 28) return 'e';
    if (status === 'err' && d === 15) return 'w';
    return '';
  });
}

export const uptimePct = (status) => ({ ok: 99.98, warn: 99.71, err: 97.85 })[status] ?? 100;
