import { NavLink } from 'react-router-dom';
import { Icon } from './Icons.jsx';
import { useAppContext } from '../context/AppContext.jsx';

const Item = ({ to, icon: I, label, count, danger }) => (
  <NavLink to={to} end={to === '/'}>
    <I /><span>{label}</span>
    {count != null && <em className="count" style={danger ? { background: '#dc2626' } : undefined}>{count}</em>}
  </NavLink>
);

export default function Sidebar() {
  const { meta } = useAppContext();
  const c = meta?.counts || {};
  return (
    <aside>
      <div className="brand">
        <div className="logo">LE</div>
        <div className="brand-text">Portal Admin<small>Loterías Electrónicas HN</small></div>
      </div>
      <nav className="nav">
        <div className="nav-label">General</div>
        <Item to="/" icon={Icon.dashboard} label="Dashboard" />
        <Item to="/sistemas" icon={Icon.layers} label="Sistemas" count={c.apps} />
        <Item to="/monitoreo" icon={Icon.pulse} label="Monitoreo" />
        <div className="nav-label">Áreas del negocio</div>
        <Item to="/areas" icon={Icon.grid} label="Apps por área" count={c.apps} />
        <div className="nav-label">Accesos</div>
        <Item to="/usuarios" icon={Icon.users} label="Usuarios" count={c.users} />
        <Item to="/roles" icon={Icon.shield} label="Roles y permisos" />
        <div className="nav-label">Operación</div>
        <Item to="/configuracion" icon={Icon.gear} label="Configuración" />
        <Item to="/aprobaciones" icon={Icon.check} label="Aprobaciones" count={c.pendingApprovals || undefined} danger />
        <Item to="/auditoria" icon={Icon.file} label="Auditoría" />
      </nav>
      <div className="side-foot">
        <span className="env">{meta?.env || 'PROD'}</span>
        <span className="txt">v{meta?.version || '—'} · build {meta?.build || '—'}</span>
      </div>
    </aside>
  );
}
