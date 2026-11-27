export const initials = (name = '') =>
  name.split(' ').filter((w) => w.length > 2).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || name.slice(0, 2).toUpperCase();

export const personInitials = (name = '') => name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

const pad = (n) => String(n).padStart(2, '0');

export function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** "Ahora", "Hace 8 min", "Hace 3 h", "Ayer 16:40", "Hace 14 días" o fecha. */
export function timeAgo(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const min = Math.round((Date.now() - d.getTime()) / 60000);
  if (min < 1) return 'Ahora';
  if (min < 60) return `Hace ${min} min`;
  const h = Math.round(min / 60);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return h < 6 ? `Hace ${h} h` : `Hoy ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return `Ayer ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const days = Math.round(min / 1440);
  if (days <= 14) return `Hace ${days} días`;
  return formatDate(iso);
}

export const number = (n) => new Intl.NumberFormat('es-HN').format(n);

export const STATUS = {
  ok: { cls: 'b-ok', label: 'Operativa' },
  warn: { cls: 'b-warn', label: 'Degradada' },
  err: { cls: 'b-err', label: 'Caída' },
};
