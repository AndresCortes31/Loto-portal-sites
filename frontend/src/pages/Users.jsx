import { useState } from 'react';
import { api } from '../api/client.js';
import { useApi } from '../hooks/useApi.js';
import { useToast } from '../context/ToastContext.jsx';
import { useAppContext } from '../context/AppContext.jsx';
import { Icon } from '../components/Icons.jsx';
import { PageHead, Pager, Loading, ErrorBox } from '../components/Common.jsx';
import Modal from '../components/Modal.jsx';
import { personInitials, timeAgo } from '../utils/format.js';

const COLORS = ['#16a34a', '#ea580c', '#db2777', '#4f46e5', '#0d9488', '#ca8a04', '#9333ea', '#dc2626'];

export default function Users() {
  const toast = useToast();
  const { refreshMeta } = useAppContext();
  const [q, setQ] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [inviting, setInviting] = useState(false);
  const { data, loading, error, reload } = useApi(() => api.users({ q, department, status, page, pageSize: 8 }), [q, department, status, page]);

  const sync = async () => {
    try { await api.syncUsers(); toast('Sincronización con Entra ID completada'); reload(); }
    catch (e) { toast(e.message, 'error'); }
  };

  const toggleStatus = async (u) => {
    try {
      await api.setUserStatus(u.id, u.status === 'Activo' ? 'Bloqueado' : 'Activo');
      toast('Estado actualizado');
      reload();
    } catch (e) { toast(e.message, 'error'); }
  };

  const filter = (setter) => (e) => { setter(e.target.value); setPage(1); };

  return (
    <>
      <PageHead crumbs="Inicio / Usuarios" title="Usuarios" sub="Sincronizados con Microsoft Entra ID">
        <button className="btn" onClick={sync}><Icon.refresh />Sincronizar</button>
        <button className="btn primary" onClick={() => setInviting(true)}><Icon.plus />Invitar usuario</button>
      </PageHead>

      <div className="card">
        <div className="toolbar">
          <input className="input" placeholder="Buscar por nombre o correo…" value={q} onChange={filter(setQ)} />
          <select className="select" value={department} onChange={filter(setDepartment)}>
            <option value="">Todos los departamentos</option>
            {data?.departments.map((d) => <option key={d}>{d}</option>)}
          </select>
          <select className="select" value={status} onChange={filter(setStatus)}>
            <option value="">Todos los estados</option><option>Activo</option><option>Bloqueado</option>
          </select>
        </div>
        {loading && !data ? <Loading /> : error ? <ErrorBox error={error} onRetry={reload} /> : (
          <>
            <table>
              <thead><tr><th><input type="checkbox" className="chk" /></th><th>Usuario</th><th>Departamento</th><th>Roles</th><th>Sistemas</th><th>MFA</th><th>Último acceso</th><th>Estado</th></tr></thead>
              <tbody>
                {data.items.length === 0 && <tr><td colSpan={8} className="muted">Sin resultados.</td></tr>}
                {data.items.map((u, i) => (
                  <tr key={u.id}>
                    <td><input type="checkbox" className="chk" /></td>
                    <td><div className="app-cell"><div className="avatar" style={{ background: COLORS[i % COLORS.length] }}>{personInitials(u.name)}</div><div><b>{u.name}</b><div className="muted">{u.email}</div></div></div></td>
                    <td>{u.department}</td>
                    <td><span className="tag">{u.role}</span></td>
                    <td>{u.systems}</td>
                    <td>{u.mfa ? <span className="badge b-ok">Sí</span> : <span className="badge b-err">No</span>}</td>
                    <td className="muted">{u.lastAccess ? timeAgo(u.lastAccess) : 'Nunca'}</td>
                    <td>
                      <button className="link-btn" title="Cambiar estado" onClick={() => toggleStatus(u)}>
                        <span className={`badge ${u.status === 'Activo' ? 'b-ok' : 'b-err'}`}>{u.status}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pager {...data} onChange={setPage} />
          </>
        )}
      </div>

      <InviteModal open={inviting} onClose={() => setInviting(false)} onDone={() => { reload(); refreshMeta(); toast('Invitación enviada'); }} />
    </>
  );
}

function InviteModal({ open, onClose, onDone }) {
  const [form, setForm] = useState({ name: '', email: '', department: 'Sistemas', role: 'Solo lectura' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    try {
      await api.inviteUser(form);
      setForm({ name: '', email: '', department: 'Sistemas', role: 'Solo lectura' });
      setError('');
      onClose();
      onDone();
    } catch (e) { setError(e.message); }
  };

  return (
    <Modal open={open}>
      <h3 style={{ marginBlockStart: 0 }}>Invitar usuario</h3>
      {error && <div className="form-error">{error}</div>}
      <div className="field"><label>Nombre *</label><input className="input" value={form.name} onChange={set('name')} /></div>
      <div className="field"><label>Correo *</label><input className="input" type="email" value={form.email} onChange={set('email')} placeholder="usuario@loto.hn" /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="field"><label>Departamento</label><select className="select" value={form.department} onChange={set('department')}><option>Desarrollo</option><option>Sistemas</option><option>Operaciones</option><option>Finanzas</option></select></div>
        <div className="field"><label>Rol</label><select className="select" value={form.role} onChange={set('role')}><option>Admin App</option><option>Supervisor</option><option>Operador</option><option>Auditor</option><option>Solo lectura</option></select></div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button className="btn primary" onClick={submit}>Enviar invitación</button>
      </div>
    </Modal>
  );
}
