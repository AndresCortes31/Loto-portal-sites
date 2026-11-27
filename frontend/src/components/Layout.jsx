import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) document.documentElement.dataset.theme = saved;
  }, []);

  return (
    <div className={`layout ${collapsed ? 'collapsed' : ''}`}>
      <Sidebar />
      <main>
        <Header onToggleSidebar={() => setCollapsed((c) => !c)} />
        <div className="content"><Outlet /></div>
      </main>
    </div>
  );
}
