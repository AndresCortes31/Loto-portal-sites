import { useEffect } from 'react';

export default function Drawer({ open, onClose, icon, iconColor, title, subtitle, children, footer }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      <div className={`drawer-bg ${open ? 'open' : ''}`} onClick={onClose} />
      <div className={`drawer ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="drawer-head">
          <div className="app-ic" style={{ background: iconColor }}>{icon}</div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0 }}>{title}</h3>
            <div className="muted">{subtitle}</div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
        <div className="drawer-body">{open && children}</div>
        {footer && <div className="drawer-foot">{footer}</div>}
      </div>
    </>
  );
}
