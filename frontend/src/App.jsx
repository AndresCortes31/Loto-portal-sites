import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import BusinessAreas from './pages/BusinessAreas.jsx';
import Apps from './pages/Apps.jsx';
import Monitor from './pages/Monitor.jsx';
import Users from './pages/Users.jsx';
import Roles from './pages/Roles.jsx';
import Config from './pages/Config.jsx';
import Approvals from './pages/Approvals.jsx';
import Audit from './pages/Audit.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="areas" element={<BusinessAreas />} />
        <Route path="sistemas" element={<Apps />} />
        <Route path="sistemas/:code" element={<Apps />} />
        <Route path="monitoreo" element={<Monitor />} />
        <Route path="usuarios" element={<Users />} />
        <Route path="roles" element={<Roles />} />
        <Route path="configuracion" element={<Config />} />
        <Route path="aprobaciones" element={<Approvals />} />
        <Route path="auditoria" element={<Audit />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
