import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from './Icons.jsx';
import { useAppContext } from '../context/AppContext.jsx';
import { personInitials } from '../utils/format.js';

export default function Header({ onToggleSidebar }) {
  const { me } = useAppContext();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const inputRef = useRef();

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); inputRef.current?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toggleTheme = () => {
    const r = document.documentElement;
    const dark = r.dataset.theme ? r.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    r.dataset.theme = dark ? 'light' : 'dark';
    localStorage.setItem('theme', r.dataset.theme);
  };

  const search = (e) => {
    e.preventDefault();
    if (q.trim()) navigate(`/sistemas?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header>
      <button className="icon-btn" onClick={onToggleSidebar} aria-label="Menú"><Icon.menu /></button>
      <form className="search" onSubmit={search}>
        <Icon.search />
        <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar sistemas, usuarios, configuraciones…" />
        <kbd>Ctrl K</kbd>
      </form>
      <div className="head-right">
        <button className="icon-btn" onClick={toggleTheme} aria-label="Tema"><Icon.moon /></button>
        <button className="icon-btn" aria-label="Notificaciones" onClick={() => navigate('/aprobaciones')}><Icon.bell /><i className="dot" /></button>
        <div className="user">
          <div className="avatar">{personInitials(me?.name || '')}</div>
          <div><b>{me?.name || '…'}</b><small>{me?.role}</small></div>
        </div>
      </div>
    </header>
  );
}
