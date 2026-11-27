import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useApi } from '../hooks/useApi.js';
import { useAppContext } from '../context/AppContext.jsx';
import { Icon } from '../components/Icons.jsx';
import { PageHead, Loading, ErrorBox } from '../components/Common.jsx';
import RequestsChart from '../components/RequestsChart.jsx';
import { initials, timeAgo, number } from '../utils/format.js';

const TONE = { info: ['var(--info-bg)', 'var(--primary)'], ok: ['var(--ok-bg)', 'var(--ok)'], warn: ['var(--warn-bg)', 'var(--warn)'], err: ['var(--err-bg)', 'var(--err)'] };
const STATUS_COLOR = { ok: 'var(--ok)', warn: 'var(--warn)', err: 'var(--err)' };

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
}

export default function Dashboard() {
  const { me } = useAppContext();
  const { data, loading, error, reload } = useApi(api.dashboard);

  return (
    <>
      <PageHead crumbs="Inicio / Dashboard" title={`${greeting()}, ${me?.name?.split(' ')[0] || ''} 👋`} sub="Resumen del estado de los sistemas">
        <select className="select"><option>Últimas 24 horas</option><option>Últimos 7 días</option><option>Últimos 30 días</option></select>
        <button className="btn" onClick={reload}><Icon.refresh />Actualizar</button>
      </PageHead>

      {loading && !data ? <Loading /> : error ? <ErrorBox error={error} onRetry={reload} /> : (
        <>
          <div className="grid kpis">
            <Kpi label="Sistemas activos" icon={Icon.layers} tone="info" value={data.kpis.activeSystems} trend="Registrados en el portal" />
            <Kpi label="Usuarios activos" icon={Icon.user} tone="ok" value={number(data.kpis.activeUsers)} trend="Sincronizados con Entra ID" />
            <Kpi label="Errores (24 h)" icon={Icon.alert} tone="err" value={data.kpis.errors24h} trend="Total de las últimas 24 horas" down />
            <Kpi label="Disponibilidad" icon={Icon.pulse} tone="warn" value={`${data.kpis.availability}%`} trend={`SLA objetivo ${data.kpis.slaTarget}%`} />
          </div>

          <div className="grid row2">
            <div className="card">
              <div className="card-head">
                <h3>Solicitudes y errores por hora</h3>
                <div className="legend"><span><i style={{ background: '#3b82f6' }} />Solicitudes</span><span><i style={{ background: '#ef4444' }} />Errores</span></div>
              </div>
              <div className="card-pad"><RequestsChart {...data.hourly} /></div>
            </div>
            <div className="card activity">
              <div className="card-head"><h3>Actividad reciente</h3><Link className="muted" to="/auditoria">Ver todo →</Link></div>
              <ul>
                {data.activity.map((a) => (
                  <li key={a.id}>
                    <div className="a-ic" style={{ background: TONE[a.tone][0], color: TONE[a.tone][1] }}>{a.initials}</div>
                    <div>
                      {/* El HTML proviene del backend propio (texto controlado) */}
                      <span dangerouslySetInnerHTML={{ __html: a.html }} />
                      <div className="muted">{timeAgo(a.at)}{a.meta && ` · ${a.meta}`}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid row3">
            <div className="card">
              <div className="card-head"><h3>Salud de sistemas</h3><span className="muted">Últimos 30 días</span></div>
              <div style={{ padding: '6px 0' }}>
                {data.health.map((h) => (
                  <div className="health-row" key={h.code}>
                    <div className="app-ic" style={{ background: h.color, width: 28, height: 28, fontSize: 11 }}>{initials(h.name)}</div>
                    <div style={{ width: 150 }}><b>{h.name}</b></div>
                    <div className="bar"><i style={{ width: `${h.uptime}%`, background: STATUS_COLOR[h.status] }} /></div>
                    <b style={{ width: 60, textAlign: 'end' }}>{h.uptime.toFixed(2)}%</b>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-head"><h3>Pendientes de aprobación</h3><Link className="muted" to="/aprobaciones">Ver todo →</Link></div>
              <table><tbody>
                {data.pendingApprovals.length === 0 && <tr><td className="muted">No hay solicitudes pendientes.</td></tr>}
                {data.pendingApprovals.map((a) => (
                  <tr key={a.id}>
                    <td><b>{a.title}</b><div className="muted">{a.appName} · {a.after}</div></td>
                    <td><span className="badge b-warn">Pendiente</span></td>
                    <td className="muted">{timeAgo(a.requestedAt)}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function Kpi({ label, icon: I, tone, value, trend, down }) {
  return (
    <div className="card card-pad kpi">
      <div className="label">{label}<div className="ic" style={{ background: TONE[tone][0], color: TONE[tone][1] }}><I /></div></div>
      <div className="value">{value}</div>
      <div className={`trend ${down ? 'down' : 'up'}`}>{trend}</div>
    </div>
  );
}
