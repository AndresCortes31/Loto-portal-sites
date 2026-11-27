import { Router } from 'express';
import { db } from '../data/store.js';
import { paginate } from '../utils/helpers.js';

const r = Router();

function filter(query) {
  const { from, to, user, action, app } = query;
  const fromT = from ? new Date(`${from}T00:00:00-06:00`).getTime() : -Infinity;
  const toT = to ? new Date(`${to}T23:59:59-06:00`).getTime() : Infinity;
  return db.audit
    .filter((e) => {
      const t = new Date(e.at).getTime();
      return t >= fromT && t <= toT && (!user || e.user === user) && (!action || e.action === action) && (!app || e.appCode === app);
    })
    .sort((a, b) => new Date(b.at) - new Date(a.at));
}

r.get('/', (req, res) => {
  res.json({
    ...paginate(filter(req.query), req.query.page, req.query.pageSize),
    users: [...new Set(db.audit.map((e) => e.user))],
    actions: [...new Set(db.audit.map((e) => e.action))],
  });
});

r.get('/export', (req, res) => {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = [['Fecha', 'Usuario', 'Acción', 'Entidad', 'Detalle', 'IP'], ...filter(req.query).map((e) => [e.at, e.user, e.action, e.entity, e.detail, e.ip])];
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="auditoria.csv"');
  res.send('\uFEFF' + rows.map((r) => r.map(esc).join(',')).join('\r\n'));
});

export default r;
