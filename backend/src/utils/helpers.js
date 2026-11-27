import { HttpError } from '../middleware/errors.js';

export const minutesAgo = (m) => new Date(Date.now() - m * 60_000).toISOString();

export function paginate(list, page = 1, pageSize = 8) {
  const p = Math.max(1, Number(page) || 1);
  const size = Math.min(100, Math.max(1, Number(pageSize) || 8));
  const total = list.length;
  return {
    items: list.slice((p - 1) * size, p * size),
    page: p,
    pageSize: size,
    total,
    totalPages: Math.max(1, Math.ceil(total / size)),
  };
}

export function required(body, fields) {
  const missing = fields.filter((f) => body[f] === undefined || body[f] === null || String(body[f]).trim() === '');
  if (missing.length) throw new HttpError(400, `Campos obligatorios: ${missing.join(', ')}`, { missing });
}

export const includesText = (text, q) => !q || String(text).toLowerCase().includes(String(q).toLowerCase());

export const ENVS = ['PROD', 'QA', 'DEV'];
