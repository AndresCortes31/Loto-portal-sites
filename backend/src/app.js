import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { currentUser } from './middleware/auth.js';
import { notFound, errorHandler } from './middleware/errors.js';
import metaRoutes from './routes/meta.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import appsRoutes from './routes/apps.routes.js';
import areasRoutes from './routes/areas.routes.js';
import monitorRoutes from './routes/monitor.routes.js';
import usersRoutes from './routes/users.routes.js';
import rolesRoutes from './routes/roles.routes.js';
import configRoutes from './routes/config.routes.js';
import approvalsRoutes from './routes/approvals.routes.js';
import auditRoutes from './routes/audit.routes.js';

export function createApp() {
  const app = express();
  app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

  app.use('/api', currentUser);
  app.use('/api', metaRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/apps', appsRoutes);
  app.use('/api/areas', areasRoutes);
  app.use('/api/monitor', monitorRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/roles', rolesRoutes);
  app.use('/api/config', configRoutes);
  app.use('/api/approvals', approvalsRoutes);
  app.use('/api/audit', auditRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
