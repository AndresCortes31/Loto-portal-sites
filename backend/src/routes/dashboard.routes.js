import { Router } from 'express';
import { db, uptimePct, findApp } from '../data/store.js';

const r = Router();

r.get('/', (_req, res) => {
  const errors24h = db.hourlyMetrics.errors.reduce((s, v) => s + v, 0);
  const activeApps = db.apps.filter((a) => a.active);
  const availability = activeApps.reduce((s, a) => s + uptimePct(a.status), 0) / (activeApps.length || 1);

  res.json({
    kpis: {
      activeSystems: activeApps.length,
      activeUsers: db.users.filter((u) => u.status === 'Activo').length,
      errors24h,
      availability: Number(availability.toFixed(2)),
      slaTarget: 99.9,
    },
    hourly: db.hourlyMetrics,
    activity: db.activity.slice(0, 5),
    health: db.apps.slice(0, 6).map((a, i) => ({
      code: a.code, name: a.name, color: a.color, status: a.status,
      uptime: Number((uptimePct(a.status) - i * 0.01).toFixed(2)),
    })),
    pendingApprovals: db.approvals
      .filter((a) => a.status === 'pending')
      .slice(0, 3)
      .map((a) => ({ ...a, appName: findApp(a.appCode)?.name || a.appCode })),
  });
});

export default r;
