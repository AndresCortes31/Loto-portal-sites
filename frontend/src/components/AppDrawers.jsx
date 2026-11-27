import { useEffect, useState } from 'react';
import Drawer from './Drawer.jsx';
import { EnvTag, StatusBadge, Uptime, Loading, Tabs } from './Common.jsx';
import { api } from '../api/client.js';
import { initials, timeAgo } from '../utils/format.js';

/** Ficha de un sistema (panel lateral). */
export function AppDetailDrawer({ code, onClose, onChanged, toast }) {
  const [app, setApp] = useState(null);
  const [tab, setTab] = useState('general');

  useEffect(() => {
    setApp(null);
    if (code) api.app(code).then(setApp).catch((e) => { toast(e.message, 'error'); onClose(); });
  }, [code]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleActive = async () => {
    try {
      const updated = await api.updateApp(app.code, { active: !app.active });
      setApp((a) => ({ ...a, ...updated }));
      toast(updated.active ? 'Sistema activado' : 'Sistema desactivado');
      onChanged?.();
    } catch (e) { toast(e.message, 'error'); }
  };

  return (
    <Drawer
      open={Boolean(code)}
      onClose={onClose}
      icon={app ? initials(app.name) : '…'}
      iconColor={app?.color || '#64748b'}
      title={app?.name || 'Cargando…'}
      subtitle={app && <>{app.code} · <EnvTag env={app.env} /> <StatusBadge status={app.status} /></>}
      footer={app && (
        <>
          <button className="btn danger" onClick={toggleActive}>{app.active ? 'Desactivar' : 'Activar'}</button>
          <button className="btn">Ver logs</button>
          <button className="btn primary">Editar sistema</button>
        </>
      )}
    >
      {!app ? <Loading /> : (
        <>
          <Tabs value={tab} onChange={setTab} tabs={[
            { value: 'general', label: 'General' }, { value: 'roles', label: 'Roles' },
            { value: 'config', label: 'Config' }, { value: 'salud', label: 'Salud' }, { value: 'auditoria', label: 'Auditoría' },
          ]} />
          <dl className="kv">
            <dt>Código</dt><dd><code>{app.code}</code></dd>
            <dt>URL base</dt><dd>{app.baseUrl}</dd>
            <dt>Health check</dt><dd>{app.healthEndpoint} · cada 60 s</dd>
            <dt>Versión</dt><dd>v{app.version}</dd>
            <dt>Responsable</dt><dd>{app.owner}</dd>
            <dt>Usuarios asignados</dt><dd>{app.users}</dd>
            <dt>Último despliegue</dt><dd>{timeAgo(app.lastDeploy)}</dd>
            <dt>Autenticación</dt><dd>{app.auth}</dd>
            <dt>Estado</dt><dd>{app.active ? 'Activo' : 'Desactivado'}</dd>
          </dl>
          <h4 style={{ margin: '22px 0 8px' }}>Disponibilidad (30 días) · {app.uptime}%</h4>
          <Uptime history={app.uptimeHistory} />
          <h4 style={{ margin: '22px 0 8px' }}>Roles del sistema</h4>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Object.entries(app.roleCounts).map(([r, n]) => <span key={r} className="tag">{r} · {n}</span>)}
          </div>
        </>
      )}
    </Drawer>
  );
}

const EMPTY = { name: '', code: '', baseUrl: '', healthEndpoint: '/api/health', env: 'DEV', owner: 'Ingrid Castillo', description: '', template: 'standard' };

/** Formulario para registrar un sistema. */
export function NewAppDrawer({ open, onClose, onCreated, toast }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => { if (open) { setForm(EMPTY); setError(''); } }, [open]);

  const onName = (e) => {
    const name = e.target.value;
    const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    setForm((f) => ({ ...f, name, code: slug, baseUrl: slug ? `https://${slug}.loto.hn` : '' }));
  };

  const save = async () => {
    setBusy(true);
    try {
      const app = await api.createApp(form);
      toast('Sistema registrado correctamente');
      onCreated?.(app);
      onClose();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  return (
    <Drawer open={open} onClose={onClose} icon="+" iconColor="#64748b" title="Nuevo sistema" subtitle="Registrar un sistema en el portal"
      footer={<><button className="btn" onClick={onClose}>Cancelar</button><button className="btn primary" onClick={save} disabled={busy}>{busy ? 'Guardando…' : 'Registrar sistema'}</button></>}>
      {error && <div className="form-error">{error}</div>}
      <div className="field"><label>Nombre *</label><input className="input" value={form.name} onChange={onName} placeholder="Ej. Control de Premios" /></div>
      <div className="field"><label>Código (slug) *</label><input className="input" value={form.code} onChange={set('code')} placeholder="control-premios" /></div>
      <div className="field"><label>URL base *</label><input className="input" value={form.baseUrl} onChange={set('baseUrl')} placeholder="https://control-premios.loto.hn" /></div>
      <div className="field"><label>Endpoint de health check</label><input className="input" value={form.healthEndpoint} onChange={set('healthEndpoint')} /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="field"><label>Ambiente</label><select className="select" value={form.env} onChange={set('env')}><option>DEV</option><option>QA</option><option>PROD</option></select></div>
        <div className="field"><label>Responsable</label><select className="select" value={form.owner} onChange={set('owner')}><option>Ingrid Castillo</option><option>Hathziri Carbajal</option></select></div>
      </div>
      <div className="field"><label>Descripción</label><textarea className="input" style={{ width: '100%', height: 80, padding: 8 }} value={form.description} onChange={set('description')} /></div>
      <div className="field"><label>Plantilla de roles</label><select className="select" value={form.template} onChange={set('template')}><option value="standard">Estándar (Admin, Supervisor, Operador, Auditor, Lectura)</option><option value="empty">Vacía</option></select></div>
    </Drawer>
  );
}
