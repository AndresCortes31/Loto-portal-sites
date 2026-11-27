import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useApi } from '../hooks/useApi.js';
import { useToast } from '../context/ToastContext.jsx';
import { useAppContext } from '../context/AppContext.jsx';
import { PageHead, Loading, ErrorBox } from '../components/Common.jsx';
import ChangeRequestModal from '../components/ChangeRequestModal.jsx';
import Modal from '../components/Modal.jsx';

export default function Config() {
  const toast = useToast();
  const { me, refreshMeta } = useAppContext();
  const apps = useApi(() => api.apps({}));
  const [appCode, setAppCode] = useState('pagos-premios');
  const [env, setEnv] = useState('PROD');
  const { data, loading, error, reload } = useApi(() => api.config(appCode, env), [appCode, env]);
  const [values, setValues] = useState({});
  const [pending, setPending] = useState(null); // { kind: 'param'|'flag', ... }
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (data) setValues(Object.fromEntries(data.params.map((p) => [p.key, p.value])));
  }, [data]);

  const handleResult = (res, okMsg) => {
    if (res.pendingApproval) { toast('Solicitud enviada para aprobación'); refreshMeta(); }
    else toast(okMsg);
    reload();
  };

  const requestParam = async (p, extra = {}) => {
    const body = { env, key: p.key, value: values[p.key] ?? p.value, description: p.description, ...extra };
    if (data.requiresApproval && !extra.reason) return setPending({ kind: 'param', body, summary: `${p.key}: ${p.value} → ${body.value}` });
    handleResult(await api.changeParam(appCode, body), 'Parámetro actualizado');
  };

  const toggleFlag = async (f, extra = {}) => {
    const body = { env, enabled: !f.enabled, ...extra };
    if (data.requiresApproval && !extra.reason) return setPending({ kind: 'flag', flag: f, body, summary: `${f.key}: ${f.enabled} → ${!f.enabled}` });
    handleResult(await api.toggleFlag(appCode, f.key, body), 'Feature flag actualizado');
  };

  const submitPending = async ({ reason, approver }) => {
    const res = pending.kind === 'param'
      ? await api.changeParam(appCode, { ...pending.body, reason, approver })
      : await api.toggleFlag(appCode, pending.flag.key, { ...pending.body, reason, approver });
    setPending(null);
    handleResult(res, 'Cambio aplicado');
  };

  const safe = (fn) => (...args) => fn(...args).catch((e) => toast(e.message, 'error'));

  return (
    <>
      <PageHead crumbs="Inicio / Configuración" title="Configuración" sub="Parámetros y feature flags por sistema y ambiente">
        <select className="select" value={appCode} onChange={(e) => setAppCode(e.target.value)}>
          {(apps.data?.items || []).map((a) => <option key={a.code} value={a.code}>{a.name}</option>)}
        </select>
        <select className="select" value={env} onChange={(e) => setEnv(e.target.value)}>
          <option>PROD</option><option>QA</option><option>DEV</option>
        </select>
      </PageHead>

      {env === 'PROD' && <div className="note">⚠️ Los cambios en PROD requieren aprobación de un segundo administrador (maker-checker) antes de aplicarse.</div>}

      {loading && !data ? <Loading /> : error ? <ErrorBox error={error} onRetry={reload} /> : (
        <div className="grid row3" style={{ margin: 0 }}>
          <div className="card">
            <div className="card-head"><h3>Parámetros</h3><button className="btn" style={{ height: 30 }} onClick={() => setAdding(true)}>+ Agregar</button></div>
            <table>
              <thead><tr><th>Clave</th><th>Valor</th><th>Versión</th><th /></tr></thead>
              <tbody>
                {data.params.map((p) => (
                  <tr key={p.key}>
                    <td><code>{p.key}</code><div className="muted">{p.description}</div></td>
                    <td><input className="input" style={{ minWidth: 0, width: 120 }} value={values[p.key] ?? ''} onChange={(e) => setValues((v) => ({ ...v, [p.key]: e.target.value }))} /></td>
                    <td className="muted">v{p.version}</td>
                    <td>
                      <button className="btn" style={{ height: 30 }} disabled={values[p.key] === p.value} onClick={() => safe(requestParam)(p)}>
                        {data.requiresApproval ? 'Solicitar cambio' : 'Aplicar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card">
            <div className="card-head"><h3>Feature flags</h3><span className="muted">{data.flags.length} flags</span></div>
            <table><tbody>
              {data.flags.map((f) => (
                <tr key={f.key}>
                  <td><b>{f.name}</b><div className="muted">{f.key}{f.description && ` · ${f.description}`}</div></td>
                  <td style={{ textAlign: 'end' }}>
                    <label className="switch"><input type="checkbox" checked={f.enabled} onChange={() => safe(toggleFlag)(f)} /><span /></label>
                  </td>
                </tr>
              ))}
            </tbody></table>
          </div>
        </div>
      )}

      <ChangeRequestModal
        open={Boolean(pending)}
        summary={pending?.summary}
        currentUser={me?.name}
        onCancel={() => setPending(null)}
        onSubmit={submitPending}
      />
      <AddParamModal open={adding} onClose={() => setAdding(false)}
        onSubmit={(p) => { setAdding(false); safe(requestParam)({ key: p.key, description: p.description, value: '—' }, { value: p.value }); }} />
    </>
  );
}

function AddParamModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({ key: '', value: '', description: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: k === 'key' ? e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_') : e.target.value }));
  return (
    <Modal open={open}>
      <h3 style={{ marginBlockStart: 0 }}>Agregar parámetro</h3>
      <div className="field"><label>Clave *</label><input className="input" value={form.key} onChange={set('key')} placeholder="NUEVO_PARAMETRO" /></div>
      <div className="field"><label>Valor *</label><input className="input" value={form.value} onChange={set('value')} /></div>
      <div className="field"><label>Descripción</label><input className="input" value={form.description} onChange={set('description')} /></div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button className="btn primary" disabled={!form.key || !form.value} onClick={() => { onSubmit(form); setForm({ key: '', value: '', description: '' }); }}>Continuar</button>
      </div>
    </Modal>
  );
}
