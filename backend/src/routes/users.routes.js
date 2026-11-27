import { Router } from 'express';
import { db, addAudit } from '../data/store.js';
import { HttpError } from '../middleware/errors.js';
import { paginate, includesText, required } from '../utils/helpers.js';

const r = Router();

r.get('/', (req, res) => {
  const { q, department, status, page, pageSize } = req.query;
  const list = db.users.filter(
    (u) => includesText(`${u.name} ${u.email}`, q) && (!department || u.department === department) && (!status || u.status === status),
  );
  res.json({ ...paginate(list, page, pageSize), departments: [...new Set(db.users.map((u) => u.department))] });
});

r.post('/sync', (req, res) => {
  // Punto de integración con Microsoft Graph / Entra ID.
  addAudit({ user: req.user.name, action: 'SYNC', entity: 'Usuarios · Entra ID', detail: 'Sincronización manual', ip: req.clientIp });
  res.json({ syncedAt: new Date().toISOString(), added: 0, removed: 0 });
});

r.post('/invite', (req, res) => {
  required(req.body, ['name', 'email']);
  const { name, email, department = 'Sistemas', role = 'Solo lectura' } = req.body;
  if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) throw new HttpError(409, 'El usuario ya existe');
  const user = { id: email.split('@')[0], name, email, department, role, systems: 0, mfa: false, lastAccess: null, status: 'Activo' };
  db.users.push(user);
  addAudit({ user: req.user.name, action: 'CREATE', entity: `Usuario · ${user.id}`, detail: `Invitación con rol ${role}`, ip: req.clientIp });
  res.status(201).json(user);
});

r.patch('/:id/status', (req, res) => {
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) throw new HttpError(404, 'Usuario no encontrado');
  if (!['Activo', 'Bloqueado'].includes(req.body.status)) throw new HttpError(400, 'Estado inválido');
  user.status = req.body.status;
  addAudit({ user: req.user.name, action: 'UPDATE', entity: `Usuario · ${user.id}`, detail: `Estado → ${user.status}`, ip: req.clientIp });
  res.json(user);
});

export default r;
