import { Router } from 'express';
import { db, uptimeHistory, uptimePct } from '../data/store.js';

const r = Router();

r.get('/', (_req, res) => {
  res.json({
    checkedAt: new Date().toISOString(),
    intervalSeconds: 60,
    items: db.apps.map((a) => ({
      code: a.code, name: a.name, color: a.color, status: a.status,
      endpoint: `${a.code}.loto.hn${a.healthEndpoint}`,
      latencyP95: a.latencyP95,
      uptime: uptimePct(a.status),
      history: uptimeHistory(a.status),
    })),
  });
});

export default r;
