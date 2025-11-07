import React from 'react';
import { Box } from '@mui/material';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { blueCarbon } from '../../theme/colors';

const Layout = ({ children, menuItems, panelType, darkMode, setDarkMode }) => {
  return (
    <Box sx={{ 
      display: 'flex',
      width: '100%',
      maxWidth: '100vw',
      minWidth: 0,
      overflow: 'hidden'
    }}>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <Sidebar 
        open={true} 
        menuItems={menuItems} 
        panelType={panelType}
        darkMode={darkMode}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          p: { xs: 1, sm: 2, md: 3 },
          mt: 8, // Account for navbar height
          minHeight: '100vh',
          overflow: 'hidden',
          background: darkMode 
            ? blueCarbon.gradients.dark.background
            : `linear-gradient(135deg, ${blueCarbon.alpha.deepOcean[10]} 0%, ${blueCarbon.alpha.aqua[5]} 50%, ${blueCarbon.alpha.seafoam[8]} 100%)`,
          position: 'relative',
          boxSizing: 'border-box',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: darkMode
              ? `radial-gradient(circle at 20% 80%, ${blueCarbon.alpha.oceanBlue[15]} 0%, transparent 50%), 
                 radial-gradient(circle at 80% 20%, ${blueCarbon.alpha.forest[12]} 0%, transparent 50%)`
              : `radial-gradient(circle at 20% 80%, ${blueCarbon.alpha.oceanBlue[8]} 0%, transparent 50%), 
                 radial-gradient(circle at 80% 20%, ${blueCarbon.alpha.forest[6]} 0%, transparent 50%)`,
            pointerEvents: 'none',
            zIndex: 0,
          },
          '& > *': {
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: '100%',
            minWidth: 0,
            overflow: 'hidden'
          }
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;