import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Switch,
  FormControlLabel,
  Divider,
  Chip,
  Button,
} from '@mui/material';
import {
  AccountCircle,
  Logout,
  Settings,
  Brightness4,
  Brightness7,
  AccountBalanceWallet,
  Login,
} from '@mui/icons-material';
import { useAuth } from '../utils/auth';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import UserSettings from './UserSettings';
import { blueCarbon } from '../theme/colors';

const Navbar = ({ darkMode, setDarkMode, title = 'Dashboard' }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleMenuClose();
  };

  const handleSettings = () => {
    setSettingsOpen(true);
    handleMenuClose();
  };

  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
  };

  const getRoleColor = (role) => {
    const colors = {
      user: 'primary',
      company: 'secondary',
      government: 'warning',
      admin: 'error',
    };
    return colors[role] || 'default';
  };

  const getRoleLabel = (role) => {
    const labels = {
      user: 'User',
      company: 'Company',
      government: 'Government',
      admin: 'Admin',
    };
    return labels[role] || role;
  };

  return (
    <>
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        width: '100%',
        maxWidth: '100vw',
        minWidth: 0,
        overflow: 'hidden',
        background: darkMode 
          ? blueCarbon.gradients.dark.oceanDepth
          : blueCarbon.gradients.oceanDepth,
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${darkMode ? blueCarbon.alpha.aqua[30] : blueCarbon.alpha.aqua[20]}`,
        boxShadow: `0 4px 20px ${darkMode ? blueCarbon.alpha.deepOcean[50] : blueCarbon.alpha.deepOcean[30]}`,
      }}
    >
      <Toolbar sx={{ 
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        px: { xs: 1, sm: 2, md: 3 }
      }}>
        <Box display="flex" alignItems="center" sx={{ mr: { xs: 1, md: 2 }, minWidth: 0 }}>
          <Logo size="medium" showText={true} color="white" />
        </Box>

        <Box sx={{ flexGrow: 1, minWidth: 0 }} />

        {/* Theme Toggle for non-authenticated users */}
        {!user && (
          <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
        )}

        {user ? (
          <>
            {/* Role Badge */}
            <Chip
              label={getRoleLabel(user?.role)}
              color={getRoleColor(user?.role)}
              size="small"
              sx={{ 
                mr: { xs: 1, md: 2 }, 
                fontWeight: 'bold',
                display: { xs: 'none', sm: 'flex' }
              }}
            />

            {/* Wallet Connection Status */}
            <IconButton 
              color="inherit" 
              sx={{ 
                mr: { xs: 0.5, md: 1 },
                display: { xs: 'none', md: 'flex' }
              }}
            >
              <AccountBalanceWallet />
            </IconButton>

            {/* Profile Menu */}
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="primary-search-account-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.2)' }}>
                {user?.name?.charAt(0).toUpperCase() || <AccountCircle />}
              </Avatar>
            </IconButton>
          </>
        ) : (
          /* Login Button for non-authenticated users */
          <Button
            color="inherit"
            startIcon={<Login />}
            onClick={handleLogin}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              backgroundColor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)',
              },
            }}
          >
            Login
          </Button>
        )}

        {user && (
          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 250,
              },
            }}
          >
            {/* User Info */}
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {user?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
              <Chip
                label={getRoleLabel(user?.role)}
                color={getRoleColor(user?.role)}
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>

            <Divider />

            {/* Theme Toggle */}
            <MenuItem sx={{ justifyContent: 'center', py: 2 }}>
              <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} variant="switch" />
            </MenuItem>

            <Divider />

            {/* Menu Items */}
            <MenuItem onClick={handleSettings}>
              <Settings sx={{ mr: 1 }} />
              Settings
            </MenuItem>

            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        )}
      </Toolbar>
    </AppBar>
    
    {/* User Settings Dialog */}
    <UserSettings
      open={settingsOpen}
      onClose={handleSettingsClose}
      user={user}
      onLogout={handleLogout}
    />
  </>
  );
};

export default Navbar;