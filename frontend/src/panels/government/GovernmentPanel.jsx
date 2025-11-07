import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  Dashboard,
  Gavel,
  Policy,
  Security,
  AccountBalance,
  Assessment
} from '@mui/icons-material';
import Layout from '../components/Layout';
import DashboardPage from './Dashboard';
import ProjectVerification from './ProjectVerification';
import PolicyManagement from './PolicyManagement';

const GovernmentPanel = ({ darkMode, setDarkMode }) => {
  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/government/dashboard' },
    { text: 'Project Verification', icon: <Gavel />, path: '/government/verification' },
    { text: 'Policy Management', icon: <Policy />, path: '/government/policy' },
    { text: 'Compliance Monitoring', icon: <Security />, path: '/government/compliance' },
    { text: 'Registry Management', icon: <AccountBalance />, path: '/government/registry' },
    { text: 'Reports & Analytics', icon: <Assessment />, path: '/government/reports' },
  ];

  return (
    <Layout 
      menuItems={menuItems} 
      panelType="government"
      darkMode={darkMode}
      setDarkMode={setDarkMode}
    >
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/verification" element={<ProjectVerification />} />
        <Route path="/policy" element={<PolicyManagement />} />
        <Route path="/compliance" element={<div>Compliance Monitoring - Coming Soon</div>} />
        <Route path="/registry" element={<div>Registry Management - Coming Soon</div>} />
        <Route path="/reports" element={<div>Reports & Analytics - Coming Soon</div>} />
      </Routes>
    </Layout>
  );
};

export default GovernmentPanel;