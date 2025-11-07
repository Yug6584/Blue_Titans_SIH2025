import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  Dashboard,
  Info,
  AccountBalance,
  Forum,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import DashboardPage from './Dashboard';
import CommunityForum from './CommunityForum';
import InformationCenter from './InformationCenter';
import GovernmentSchemes from './GovernmentSchemes';

const UserPanel = ({ darkMode, setDarkMode }) => {
  const menuItems = [
    { text: 'Home', icon: <Dashboard />, path: '/' },
    { text: 'Information Center', icon: <Info />, path: '/information' },
    { text: 'Government Schemes', icon: <AccountBalance />, path: '/schemes' },
    { text: 'Community Forum', icon: <Forum />, path: '/community' },
  ];

  return (
    <Layout 
      menuItems={menuItems} 
      panelType="user"
      darkMode={darkMode}
      setDarkMode={setDarkMode}
    >
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/information" element={<InformationCenter />} />
        <Route path="/schemes" element={<GovernmentSchemes />} />
        <Route path="/community" element={<CommunityForum />} />
        <Route path="community" element={<CommunityForum />} />
      </Routes>
    </Layout>
  );
};

export default UserPanel;