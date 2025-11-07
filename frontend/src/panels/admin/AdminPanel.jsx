import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  Dashboard,
  SupervisorAccount,
  Settings,
  History,
  Monitor,
  Backup
} from '@mui/icons-material';
import Layout from '../components/Layout';
import DashboardPage from './Dashboard';
import UserManagement from './UserManagement';
import SystemSettings from './SystemSettings';
import AuditLogs from './AuditLogs';
import SystemMonitoring from './SystemMonitoring';
import BackupRestore from './BackupRestore';

const AdminPanel = ({ darkMode, setDarkMode }) => {
  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
    { text: 'User Management', icon: <SupervisorAccount />, path: '/admin/users' },
    { text: 'System Settings', icon: <Settings />, path: '/admin/settings' },
    { text: 'Audit Logs', icon: <History />, path: '/admin/audit' },
    { text: 'System Monitoring', icon: <Monitor />, path: '/admin/monitoring' },
    { text: 'Backup & Restore', icon: <Backup />, path: '/admin/backup' },
  ];

  return (
    <Layout 
      menuItems={menuItems} 
      panelType="admin"
      darkMode={darkMode}
      setDarkMode={setDarkMode}
    >
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/settings" element={<SystemSettings />} />
        <Route path="/audit" element={<AuditLogs />} />
        <Route path="/monitoring" element={<SystemMonitoring />} />
        <Route path="/backup" element={<BackupRestore />} />
      </Routes>
    </Layout>
  );
};

export default AdminPanel;