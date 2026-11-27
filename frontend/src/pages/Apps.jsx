import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useApi } from '../hooks/useApi.js';
import { useToast } from '../context/ToastContext.jsx';
import { useAppContext } from '../context/AppContext.jsx';
import { Icon } from '../components/Icons.jsx';
import { PageHead, EnvTag, StatusBadge, AppIcon, Loading, ErrorBox } from '../components/Common.jsx';
import { AppDetailDrawer, NewAppDrawer } from '../components/AppDrawers.jsx';
import { timeAgo } from '../utils/format.js';

export default function Apps() {
  const { code } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { refreshMeta } = useAppContext();
  const [searchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [env, setEnv] = useState('');
  const [status, setStatus] = useState('');
  const [creating, setCreating] = useState(false);
  const { data, loading, error, reload } = useApi(() => api.apps({ q, env, status }), [q, env, status]);

  return (
    <>
      <PageHead crumbs="Inicio / Sistemas" title="Sistemas" sub="Catálogo de sistemas registrados en el portal">
        <button className="btn primary" onClick={() => setCreating(true)}><Icon.plus />Nuevo sistema</button>
      </PageHead>

      <div className="card">
        <div className="toolbar">
          <input className="input" placeholder="Buscar por nombre o código…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="select" value={env} onChange={(e) => setEnv(e.target.value)}>
            <option value="">Todos los ambientes</option><option>PROD</option><option>QA</option><option>DEV</option>
          </select>
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todos los estados</option><option value="ok">Operativa</option><option value="warn">Degradada</option><option value="err">Caída</option>
          </select>
          <span className="muted" style={{ marginInlineStart: 'auto' }}>{data && `${data.total} sistemas`}</span>
        </div>

        {loading && !data ? <Loading /> : error ? <ErrorBox error={error} onRetry={reload} /> : (
          <table>
            <thead><tr><th>Sistema</th><th>Ambiente</th><th>Versión</th><th>Responsable</th><th>Usuarios</th><th>Estado</th><th>Último despliegue</th><th /></tr></thead>
            <tbody>
              {data.items.length === 0 && <tr><td colSpan={8} className="muted">Sin resultados.</td></tr>}
              {data.items.map((a) => (
                <tr key={a.code} className="clickable" onClick={() => navigate(`/sistemas/${a.code}`)} style={a.active ? undefined : { opacity: 0.55 }}>
                  <td><div className="app-cell"><AppIcon app={a} /><div><b>{a.name}</b><div className="muted">{a.code}</div></div></div></td>
                  <td><EnvTag env={a.env} /></td>
                  <td>v{a.version}</td>
                  <td>{a.owner}</td>
                  <td>{a.users}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td className="muted">{timeAgo(a.lastDeploy)}</td>
                  <td style={{ color: 'var(--muted)' }}>⋯</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AppDetailDrawer code={code} toast={toast} onClose={() => navigate('/sistemas')} onChanged={reload} />
      <NewAppDrawer open={creating} toast={toast} onClose={() => setCreating(false)} onCreated={() => { reload(); refreshMeta(); }} />
    </>
  );
}
