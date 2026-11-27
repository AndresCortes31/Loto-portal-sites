import { STATUS, initials } from '../utils/format.js';

export const StatusBadge = ({ status }) => {
  const s = STATUS[status] || STATUS.ok;
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
};

export const EnvTag = ({ env }) => <span className={`tag ${env?.toLowerCase()}`}>{env}</span>;

export const AppIcon = ({ app, size }) => (
  <div className="app-ic" style={{ background: app.color, ...(size ? { width: size, height: size, fontSize: 11 } : {}) }}>
    {initials(app.name)}
  </div>
);

export const Uptime = ({ history = [] }) => (
  <div className="uptime">
    {history.map((c, d) => <i key={d} className={c} title={`Día ${d + 1}`} />)}
  </div>
);

export const Loading = () => (
  <div className="state-box"><div className="spinner" />Cargando…</div>
);

export const ErrorBox = ({ error, onRetry }) => (
  <div className="state-box error">
    No se pudo cargar la información: {error?.message}
    {onRetry && <div style={{ marginTop: 10 }}><button className="btn" onClick={onRetry}>Reintentar</button></div>}
  </div>
);

export const PageHead = ({ crumbs, title, sub, children }) => (
  <>
    <div className="crumbs">{crumbs}</div>
    <div className="page-head">
      <div><h1>{title}</h1>{sub && <div className="sub">{sub}</div>}</div>
      {children && <div style={{ display: 'flex', gap: 8 }}>{children}</div>}
    </div>
  </>
);

export function Pager({ page, totalPages, total, pageSize, onChange }) {
  const from = total ? (page - 1) * pageSize + 1 : 0;
  const to = Math.min(page * pageSize, total);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );
  return (
    <div className="pager">
      <span>Mostrando {from}–{to} de {total}</span>
      <div className="pgs">
        <button disabled={page <= 1} onClick={() => onChange(page - 1)}>‹</button>
        {pages.map((p, i) => (
          <span key={p} style={{ display: 'contents' }}>
            {i > 0 && p - pages[i - 1] > 1 && <button disabled>…</button>}
            <button className={p === page ? 'on' : ''} onClick={() => onChange(p)}>{p}</button>
          </span>
        ))}
        <button disabled={page >= totalPages} onClick={() => onChange(page + 1)}>›</button>
      </div>
    </div>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="tabs">
      {tabs.map((t) => (
        <button key={t.value} className={t.value === value ? 'on' : ''} onClick={() => onChange?.(t.value)}>{t.label}</button>
      ))}
    </div>
  );
}
