import { useState } from 'react';
import { api } from '../api/client.js';
import { useApi } from '../hooks/useApi.js';
import { Icon } from '../components/Icons.jsx';
import { PageHead, Pager, Loading, ErrorBox } from '../components/Common.jsx';
import { formatDateTime } from '../utils/format.js';

const ACTION_BADGE = { UPDATE: 'b-info', ALERT: 'b-err', APPROVE: 'b-ok', REJECT: 'b-err', ASSIGN: 'b-warn', LOGIN: 'b-info', SYNC: 'b-ok', CREATE: 'b-ok', DELETE: 'b-err' };

const isoDay = (d) => d.toISOString().slice(0, 10);

export default function Audit() {
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 9 * 86400000);
  const [filters, setFilters] = useState({ from: isoDay(weekAgo), to: isoDay(today), user: '', action: '', app: '' });
  const [page, setPage] = useState(1);
  const apps = useApi(() => api.apps({}));
  const { data, loading, error, reload } = useApi(() => api.audit({ ...filters, page, pageSize: 8 }), [filters, page]);

  const set = (k) => (e) => { setFilters((f) => ({ ...f, [k]: e.target.value })); setPage(1); };

  return (
    <>
      <PageHead crumbs="Inicio / Auditoría" title="Auditoría" sub="Registro inmutable de acciones · retención de 5 años">
        <a className="btn" href={api.auditExportUrl(filters)}><Icon.download />Exportar a Excel (CSV)</a>
      </PageHead>
      <div className="card">
        <div className="toolbar">
          <input className="input" type="date" value={filters.from} onChange={set('from')} style={{ minWidth: 0 }} />
          <span className="muted">a</span>
          <input className="input" type="date" value={filters.to} onChange={set('to')} style={{ minWidth: 0 }} />
          <select className="select" value={filters.user} onChange={set('user')}>
            <option value="">Todos los usuarios</option>
            {data?.users.map((u) => <option key={u}>{u}</option>)}
          </select>
          <select className="select" value={filters.action} onChange={set('action')}>
            <option value="">Todas las acciones</option>
            {data?.actions.map((a) => <option key={a}>{a}</option>)}
          </select>
          <select className="select" value={filters.app} onChange={set('app')}>
            <option value="">Todos los sistemas</option>
            {(apps.data?.items || []).map((a) => <option key={a.code} value={a.code}>{a.name}</option>)}
          </select>
        </div>
        {loading && !data ? <Loading /> : error ? <ErrorBox error={error} onRetry={reload} /> : (
          <>
            <table>
              <thead><tr><th>Fecha / hora</th><th>Usuario</th><th>Acción</th><th>Entidad</th><th>Detalle</th><th>IP</th></tr></thead>
              <tbody>
                {data.items.length === 0 && <tr><td colSpan={6} className="muted">Sin registros para los filtros seleccionados.</td></tr>}
                {data.items.map((r) => (
                  <tr key={r.id}>
                    <td className="muted">{formatDateTime(r.at)}</td>
                    <td><b>{r.user}</b></td>
                    <td><span className={`badge ${ACTION_BADGE[r.action] || 'b-info'}`}>{r.action}</span></td>
                    <td>{r.entity}</td>
                    <td>{r.detail}</td>
                    <td className="muted"><code>{r.ip}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pager {...data} onChange={setPage} />
          </>
        )}
      </div>
    </>
  );
}
