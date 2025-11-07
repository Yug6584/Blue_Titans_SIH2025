import React, { useState, useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { createBlueCarbonTheme } from './theme/theme';
import './theme/globalStyles.css';

// Pages
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Panels
import UserPanel from './panels/user/UserPanel';
import CompanyPanel from './panels/company/CompanyPanel';
import GovernmentPanel from './panels/government/GovernmentPanel';
import AdminPanel from './panels/admin/AdminPanel';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './utils/auth';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  // Create dynamic theme based on dark mode
  const theme = useMemo(() => createBlueCarbonTheme(darkMode), [darkMode]);

  // Update body data attribute for CSS targeting
  React.useEffect(() => {
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<UserPanel darkMode={darkMode} setDarkMode={setDarkMode} />} />
            
            {/* Protected Panel Routes */}
            <Route 
              path="/company/*" 
              element={
                <ProtectedRoute role="company">
                  <CompanyPanel darkMode={darkMode} setDarkMode={setDarkMode} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/government/*" 
              element={
                <ProtectedRoute role="government">
                  <GovernmentPanel darkMode={darkMode} setDarkMode={setDarkMode} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute role="admin">
                  <AdminPanel darkMode={darkMode} setDarkMode={setDarkMode} />
                </ProtectedRoute>
              } 
            />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Box>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;