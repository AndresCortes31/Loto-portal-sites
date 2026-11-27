import { useEffect } from 'react';
import { api } from '../api/client.js';
import { useApi } from '../hooks/useApi.js';
import { PageHead, AppIcon, StatusBadge, Uptime, Loading, ErrorBox } from '../components/Common.jsx';
import { number } from '../utils/format.js';

export default function Monitor() {
  const { data, loading, error, reload } = useApi(api.monitor);

  // Auto-refresh cada 60 s
  useEffect(() => {
    const t = setInterval(reload, 60_000);
    return () => clearInterval(t);
  }, [reload]);

  return (
    <>
      <PageHead crumbs="Inicio / Monitoreo" title="Monitoreo" sub="Health checks cada 60 s · Tiempo de respuesta y disponibilidad">
        <span className="badge b-ok">Auto-refresh activo</span>
      </PageHead>
      <div className="card">
        {loading && !data ? <Loading /> : error ? <ErrorBox error={error} onRetry={reload} /> : (
          <table>
            <thead><tr><th>Sistema</th><th>Endpoint</th><th>Latencia p95</th><th>Uptime 30 días</th><th>Historial (30 días)</th><th>Estado</th></tr></thead>
            <tbody>
              {data.items.map((a) => (
                <tr key={a.code}>
                  <td><div className="app-cell"><AppIcon app={a} /><b>{a.name}</b></div></td>
                  <td className="muted"><code>{a.endpoint}</code></td>
                  <td>
                    {a.latencyP95 == null ? '—'
                      : a.status === 'warn' ? <b style={{ color: 'var(--warn)' }}>{number(a.latencyP95)} ms</b>
                      : `${number(a.latencyP95)} ms`}
                  </td>
                  <td>{a.uptime}%</td>
                  <td><Uptime history={a.history} /></td>
                  <td><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
