import { useState } from 'react';
import { api } from '../api/client.js';
import { useApi } from '../hooks/useApi.js';
import { useToast } from '../context/ToastContext.jsx';
import { useAppContext } from '../context/AppContext.jsx';
import { PageHead, Tabs, Loading, ErrorBox } from '../components/Common.jsx';
import { timeAgo } from '../utils/format.js';

const BADGE = { pending: ['b-warn', 'Pendiente'], approved: ['b-ok', 'Aprobada'], rejected: ['b-err', 'Rechazada'] };

export default function Approvals() {
  const toast = useToast();
  const { refreshMeta } = useAppContext();
  const [status, setStatus] = useState('pending');
  const { data, loading, error, reload } = useApi(() => api.approvals(status), [status]);
  const [busy, setBusy] = useState(null);

  const decide = async (a, approve) => {
    setBusy(a.id);
    try {
      await (approve ? api.approve(a.id) : api.reject(a.id));
      toast(approve ? 'Cambio aprobado y aplicado' : 'Solicitud rechazada');
      reload();
      refreshMeta();
    } catch (e) { toast(e.message, 'error'); }
    finally { setBusy(null); }
  };

  const c = data?.counts || {};
  return (
    <>
      <PageHead crumbs="Inicio / Aprobaciones" title="Aprobaciones" sub="Solicitudes de cambio que requieren un segundo aprobador" />
      <Tabs value={status} onChange={setStatus} tabs={[
        { value: 'pending', label: `Pendientes (${c.pending ?? '…'})` },
        { value: 'approved', label: `Aprobadas (${c.approved ?? '…'})` },
        { value: 'rejected', label: `Rechazadas (${c.rejected ?? '…'})` },
      ]} />

      {loading && !data ? <Loading /> : error ? <ErrorBox error={error} onRetry={reload} /> : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))' }}>
          {data.items.length === 0 && <div className="card state-box">No hay solicitudes en esta bandeja.</div>}
          {data.items.map((a) => (
            <div className="card" key={a.id}>
              <div className="card-head">
                <div><h3>{a.title}</h3><div className="muted">{a.appName} · {a.env}</div></div>
                <span className={`badge ${BADGE[a.status][0]}`}>{BADGE[a.status][1]}</span>
              </div>
              <div className="card-pad">
                <div className="muted" style={{ marginBlockEnd: 8 }}>
                  Solicitado por <b style={{ color: 'var(--text)' }}>{a.requestedBy}</b> · {timeAgo(a.requestedAt)}
                  {a.approver && <> · Aprobador: {a.approver}</>}
                </div>
                <div className="diff"><div className="m">- {a.before}</div><div className="p">+ {a.after}</div></div>
                <p style={{ margin: '12px 0 0' }}>{a.reason}</p>
                {a.decidedBy && <p className="muted" style={{ margin: '8px 0 0' }}>Resuelta por {a.decidedBy} · {timeAgo(a.decidedAt)}</p>}
              </div>
              {a.status === 'pending' && (
                <div className="drawer-foot">
                  <button className="btn danger" disabled={busy === a.id} onClick={() => decide(a, false)}>Rechazar</button>
                  <button className="btn primary" disabled={busy === a.id} onClick={() => decide(a, true)}>Aprobar</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
