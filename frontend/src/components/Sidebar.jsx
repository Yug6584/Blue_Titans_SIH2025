import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
  Typography,
} from '@mui/material';
import { blueCarbon } from '../theme/colors';

const DRAWER_WIDTH = 280;

const Sidebar = ({ open, onClose, menuItems, panelType, darkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
    if (onClose) onClose(); // Close drawer on mobile
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getPanelTitle = (type) => {
    const titles = {
      user: 'User Panel',
      company: 'Company Panel',
      government: 'Government Panel',
      admin: 'Admin Panel',
    };
    return titles[type] || 'Panel';
  };

  const getPanelDescription = (type) => {
    const descriptions = {
      user: 'Citizens & Environmental Enthusiasts',
      company: 'Carbon Credit Project Management',
      government: 'Regulatory & Verification Authority',
      admin: 'System Administration',
    };
    return descriptions[type] || '';
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: { xs: 0, sm: DRAWER_WIDTH },
        flexShrink: 0,
        display: { xs: 'none', sm: 'block' },
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          maxWidth: DRAWER_WIDTH,
          minWidth: 0,
          boxSizing: 'border-box',
          background: darkMode
            ? `linear-gradient(180deg, ${blueCarbon.alpha.deepOcean[20]} 0%, ${blueCarbon.alpha.oceanBlue[15]} 50%, ${blueCarbon.alpha.aqua[10]} 100%)`
            : `linear-gradient(180deg, ${blueCarbon.alpha.deepOcean[5]} 0%, ${blueCarbon.alpha.oceanBlue[8]} 50%, ${blueCarbon.alpha.aqua[5]} 100%)`,
          backdropFilter: 'blur(10px)',
          borderRight: `1px solid ${darkMode ? blueCarbon.alpha.aqua[30] : blueCarbon.alpha.oceanBlue[20]}`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: darkMode
              ? `radial-gradient(circle at 50% 20%, ${blueCarbon.alpha.aqua[20]} 0%, transparent 70%)`
              : `radial-gradient(circle at 50% 20%, ${blueCarbon.alpha.aqua[10]} 0%, transparent 70%)`,
            pointerEvents: 'none',
          }
        },
      }}
      open={open}
    >
      <Toolbar />
      
      {/* Panel Header */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" fontWeight="bold" color="primary">
          {getPanelTitle(panelType)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {getPanelDescription(panelType)}
        </Typography>
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <List sx={{ px: 1 }}>
        {menuItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: 2,
                mx: 1,
                position: 'relative',
                zIndex: 1,
                background: isActive(item.path) 
                  ? (darkMode ? blueCarbon.gradients.dark.cardOcean : blueCarbon.gradients.lightOcean)
                  : 'transparent',
                color: isActive(item.path) 
                  ? (darkMode ? blueCarbon.aqua : blueCarbon.deepOcean)
                  : 'text.primary',
                border: isActive(item.path) 
                  ? `1px solid ${darkMode ? blueCarbon.alpha.aqua[40] : blueCarbon.alpha.oceanBlue[30]}`
                  : '1px solid transparent',
                '&:hover': {
                  background: darkMode ? blueCarbon.gradients.dark.hoverOcean : blueCarbon.gradients.hoverOcean,
                  transform: 'translateX(4px)',
                  transition: 'all 0.3s ease',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive(item.path) 
                    ? 'primary.main' 
                    : 'text.secondary',
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: isActive(item.path) ? 600 : 400,
                }}
              />
              {item.badge && (
                <Box
                  sx={{
                    backgroundColor: 'error.main',
                    color: 'white',
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                  }}
                >
                  {item.badge}
                </Box>
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      {/* Footer */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          BlueCarbon Ledger v1.0.0
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;