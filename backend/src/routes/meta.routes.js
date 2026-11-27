import { Router } from 'express';
import { db } from '../data/store.js';

const r = Router();

r.get('/me', (req, res) => res.json(req.user));

r.get('/meta', (_req, res) => {
  res.json({
    env: process.env.APP_ENV || 'PROD',
    version: process.env.APP_VERSION || '1.4.0',
    build: process.env.APP_BUILD || '2611',
    counts: {
      apps: db.apps.length,
      users: db.users.length,
      pendingApprovals: db.approvals.filter((a) => a.status === 'pending').length,
    },
  });
});

export default r;
