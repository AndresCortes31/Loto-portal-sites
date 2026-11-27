import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useApi } from '../hooks/useApi.js';
import { useToast } from '../context/ToastContext.jsx';
import { PageHead, Tabs, Loading, ErrorBox } from '../components/Common.jsx';

export default function Roles() {
  const toast = useToast();
  const apps = useApi(() => api.apps({}));
  const [appCode, setAppCode] = useState('ventas-pos');
  const [tab, setTab] = useState('matrix');
  const { data, loading, error, reload } = useApi(() => api.matrix(appCode), [appCode]);
  const [draft, setDraft] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (data) setDraft(structuredClone(data.permissions)); }, [data]);

  const toggle = (key, role) =>
    setDraft((d) => d.map((p) => (p.key === key ? { ...p, values: { ...p.values, [role]: !p.values[role] } } : p)));

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.saveMatrix(appCode, draft);
      toast(`Permisos actualizados (${res.changes} cambios) · registrado en auditoría`);
      reload();
    } catch (e) { toast(e.message, 'error'); }
    finally { setSaving(false); }
  };

  return (
    <>
      <PageHead crumbs="Inicio / Roles y permisos" title="Roles y permisos" sub="Matriz de permisos por rol · sistema seleccionado">
        <select className="select" value={appCode} onChange={(e) => setAppCode(e.target.value)}>
          {(apps.data?.items || []).map((a) => <option key={a.code} value={a.code}>{a.name}</option>)}
        </select>
        <button className="btn primary" onClick={save} disabled={saving || !data}>{saving ? 'Guardando…' : 'Guardar cambios'}</button>
      </PageHead>

      <Tabs value={tab} onChange={setTab} tabs={[
        { value: 'matrix', label: 'Matriz de permisos' },
        { value: 'roles', label: `Roles (${data?.roles.length ?? '…'})` },
        { value: 'assign', label: 'Asignaciones' },
      ]} />

      <div className="card">
        {loading && !data ? <Loading /> : error ? <ErrorBox error={error} onRetry={reload} /> : tab === 'roles' ? (
          <table><thead><tr><th>Rol</th><th>Permisos en {data.app.name}</th></tr></thead><tbody>
            {data.roles.map((r) => (
              <tr key={r}><td><b>{r}</b></td><td className="muted">{draft.filter((p) => p.values[r]).length} de {draft.length}</td></tr>
            ))}
          </tbody></table>
        ) : tab === 'assign' ? (
          <div className="state-box">Las asignaciones de usuarios por rol se gestionan desde la sección Usuarios.</div>
        ) : (
          <table className="matrix">
            <thead><tr><th>Permiso</th>{data.roles.map((r) => <th key={r}>{r}</th>)}</tr></thead>
            <tbody>
              {draft.map((p) => (
                <tr key={p.key}>
                  <td><b>{p.label}</b><div className="muted"><code>{p.key}</code></div></td>
                  {data.roles.map((r, j) => (
                    <td key={r}>
                      <input type="checkbox" className="chk" checked={Boolean(p.values[r])} disabled={j === 0} onChange={() => toggle(p.key, r)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
