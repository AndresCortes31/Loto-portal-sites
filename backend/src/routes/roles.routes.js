import { Router } from 'express';
import { db, findApp, getPermissions, addAudit } from '../data/store.js';
import { HttpError } from '../middleware/errors.js';

const r = Router();

r.get('/', (_req, res) => res.json({ items: db.roles }));

r.get('/matrix/:appCode', (req, res) => {
  const app = findApp(req.params.appCode);
  if (!app) throw new HttpError(404, 'Sistema no encontrado');
  res.json({ app: { code: app.code, name: app.name }, roles: db.roles, permissions: getPermissions(app.code) });
});

r.put('/matrix/:appCode', (req, res) => {
  const app = findApp(req.params.appCode);
  if (!app) throw new HttpError(404, 'Sistema no encontrado');
  const incoming = req.body.permissions;
  if (!Array.isArray(incoming)) throw new HttpError(400, 'Formato inválido: se espera { permissions: [...] }');

  const current = getPermissions(app.code);
  let changes = 0;
  for (const p of incoming) {
    const target = current.find((c) => c.key === p.key);
    if (!target) continue;
    for (const role of db.roles) {
      if (role === 'Super Admin') continue; // Super Admin siempre conserva todos los permisos
      if (typeof p.values?.[role] === 'boolean' && p.values[role] !== target.values[role]) {
        target.values[role] = p.values[role];
        changes++;
      }
    }
  }
  addAudit({ user: req.user.name, action: 'UPDATE', entity: `Permisos · ${app.name}`, detail: `${changes} cambios en la matriz`, ip: req.clientIp, appCode: app.code });
  res.json({ changes, permissions: current });
});

export default r;
