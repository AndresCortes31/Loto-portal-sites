import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useApi } from '../hooks/useApi.js';
import { PageHead, EnvTag, StatusBadge, Loading, ErrorBox } from '../components/Common.jsx';

const tint = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},.10)`;
};

export default function BusinessAreas() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [env, setEnv] = useState('');
  const [expanded, setExpanded] = useState({});
  const { data, loading, error, reload } = useApi(() => api.areas({ q, env }), [q, env]);

  return (
    <>
      <PageHead crumbs="Inicio / Aplicaciones" title="Aplicaciones por área" sub="Encuentra cada app por función y abre su ficha con un clic.">
        <Link className="btn" to="/sistemas">Ver catálogo completo →</Link>
      </PageHead>

      <div className="area-overview">
        <div><b>{data?.totalApps ?? '…'} aplicaciones</b><span> organizadas en </span><b>{data?.totalAreas ?? '…'} áreas</b></div>
        <span className="muted">Selecciona “Ver todas las apps” para desplegar el área completa.</span>
      </div>

      <div className="toolbar area-toolbar">
        <input className="input" placeholder="Buscar app, código o área…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="select" value={env} onChange={(e) => setEnv(e.target.value)}>
          <option value="">Todos los ambientes</option><option>PROD</option><option>QA</option><option>DEV</option>
        </select>
        <span className="muted" id="businessResultCount">{data && `${data.totalApps} apps en ${data.totalAreas} áreas`}</span>
      </div>

      {loading && !data ? <Loading /> : error ? <ErrorBox error={error} onRetry={reload} /> : (
        <div className="grid business-grid">
          {data.items.length === 0 && <div className="card area-empty">No encontramos apps con esos filtros.</div>}
          {data.items.map((area) => {
            const open = expanded[area.id] || Boolean(q);
            const visible = open ? area.apps : area.apps.slice(0, 1);
            return (
              <article key={area.id} className="card area-card" style={{ '--area-accent': area.color, '--area-tint': tint(area.color) }}>
                <div className="area-head">
                  <div className="area-icon">{area.short}</div>
                  <div><h3>{area.name}</h3><div className="muted">{area.desc}</div></div>
                  <span className="module-count">{area.apps.length}</span>
                </div>
                <div className="module-list">
                  {visible.map((a) => (
                    <button key={a.code} className="module-link" onClick={() => navigate(`/sistemas/${a.code}`)}>
                      <span><b>{a.name}</b><small>{a.code}</small></span>
                      <span className="module-meta"><EnvTag env={a.env} /><StatusBadge status={a.status} /><span className="module-arrow">›</span></span>
                    </button>
                  ))}
                </div>
                {area.apps.length > 1 && !q && (
                  <button className="area-toggle" aria-expanded={open} onClick={() => setExpanded((s) => ({ ...s, [area.id]: !s[area.id] }))}>
                    <span>{open ? 'Ver menos' : 'Ver todas las apps'}</span>
                    <span>{open ? '⌃' : `${area.apps.length} apps ↓`}</span>
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
