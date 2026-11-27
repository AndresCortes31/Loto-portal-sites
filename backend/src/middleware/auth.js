import { db } from '../data/store.js';

/**
 * Autenticación simulada. Toma el usuario del encabezado `x-user-email`
 * o de DEFAULT_USER_EMAIL. Reemplazar por validación de token de Entra ID (OIDC).
 */
export function currentUser(req, _res, next) {
  const email = (req.header('x-user-email') || process.env.DEFAULT_USER_EMAIL || 'icastillo@loto.hn').toLowerCase();
  req.user = db.users.find((u) => u.email.toLowerCase() === email) || db.users[0];
  req.clientIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '—').toString().replace('::ffff:', '');
  next();
}
