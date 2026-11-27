import { Router } from 'express';
import { db, findApp } from '../data/store.js';
import { createApproval, decideApproval } from '../services/approvals.service.js';
import { HttpError } from '../middleware/errors.js';
import { required } from '../utils/helpers.js';

const r = Router();
const withApp = (a) => ({ ...a, appName: findApp(a.appCode)?.name || a.appCode });

r.get('/', (req, res) => {
  const status = req.query.status || 'pending';
  const items = db.approvals.filter((a) => status === 'all' || a.status === status).map(withApp);
  const counts = ['pending', 'approved', 'rejected'].reduce((o, s) => ({ ...o, [s]: db.approvals.filter((a) => a.status === s).length }), {});
  res.json({ items, counts });
});

/** Solicitud genérica (p. ej., despliegue o alta de rol). */
r.post('/', (req, res) => {
  required(req.body, ['type', 'title', 'appCode', 'reason']);
  if (!findApp(req.body.appCode)) throw new HttpError(404, 'Sistema no encontrado');
  const approval = createApproval({ ...req.body, env: req.body.env || 'PROD', requestedBy: req.user.name });
  res.status(201).json(withApp(approval));
});

r.post('/:id/approve', (req, res) => res.json(withApp(decideApproval(req.params.id, 'approve', req.user, req.clientIp))));
r.post('/:id/reject', (req, res) => res.json(withApp(decideApproval(req.params.id, 'reject', req.user, req.clientIp))));

export default r;
