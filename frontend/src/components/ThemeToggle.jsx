import React from 'react';
import { IconButton, Tooltip, Box } from '@mui/material';
import { Brightness4, Brightness7, WbSunny, NightsStay } from '@mui/icons-material';
import { blueCarbon } from '../theme/colors';

const ThemeToggle = ({ darkMode, setDarkMode, variant = 'icon' }) => {
  const handleToggle = () => {
    setDarkMode(!darkMode);
  };

  if (variant === 'switch') {
    return (
      <Box
        onClick={handleToggle}
        sx={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          padding: 1,
          borderRadius: 3,
          background: darkMode 
            ? `linear-gradient(135deg, ${blueCarbon.alpha.deepOcean[20]} 0%, ${blueCarbon.alpha.oceanBlue[15]} 100%)`
            : `linear-gradient(135deg, ${blueCarbon.alpha.oceanBlue[10]} 0%, ${blueCarbon.alpha.aqua[15]} 100%)`,
          border: `1px solid ${darkMode ? blueCarbon.alpha.aqua[30] : blueCarbon.alpha.oceanBlue[20]}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
            background: darkMode
              ? `linear-gradient(135deg, ${blueCarbon.alpha.deepOcean[30]} 0%, ${blueCarbon.alpha.oceanBlue[25]} 100%)`
              : `linear-gradient(135deg, ${blueCarbon.alpha.oceanBlue[15]} 0%, ${blueCarbon.alpha.aqua[20]} 100%)`,
          }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: darkMode 
              ? `linear-gradient(135deg, ${blueCarbon.aqua} 0%, ${blueCarbon.seafoam} 100%)`
              : `linear-gradient(135deg, ${blueCarbon.oceanBlue} 0%, ${blueCarbon.aqua} 100%)`,
            color: 'white',
            marginRight: darkMode ? 0 : 4,
            marginLeft: darkMode ? 4 : 0,
            transition: 'all 0.3s ease',
            transform: darkMode ? 'translateX(24px)' : 'translateX(0)',
          }}
        >
          {darkMode ? <NightsStay fontSize="small" /> : <WbSunny fontSize="small" />}
        </Box>
        <Box
          sx={{
            position: 'absolute',
            left: darkMode ? 8 : 40,
            fontSize: '0.75rem',
            fontWeight: 500,
            color: darkMode ? blueCarbon.aqua : blueCarbon.deepOcean,
            transition: 'all 0.3s ease',
          }}
        >
          {darkMode ? 'Dark' : 'Light'}
        </Box>
      </Box>
    );
  }

  return (
    <Tooltip title={`Switch to ${darkMode ? 'light' : 'dark'} mode`} arrow>
      <IconButton 
        color="inherit" 
        onClick={handleToggle}
        sx={{
          background: darkMode 
            ? `linear-gradient(135deg, ${blueCarbon.alpha.aqua[20]} 0%, ${blueCarbon.alpha.seafoam[15]} 100%)`
            : `linear-gradient(135deg, ${blueCarbon.alpha.oceanBlue[15]} 0%, ${blueCarbon.alpha.aqua[10]} 100%)`,
          border: `1px solid ${darkMode ? blueCarbon.alpha.aqua[30] : blueCarbon.alpha.oceanBlue[20]}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            background: darkMode
              ? `linear-gradient(135deg, ${blueCarbon.alpha.aqua[30]} 0%, ${blueCarbon.alpha.seafoam[25]} 100%)`
              : `linear-gradient(135deg, ${blueCarbon.alpha.oceanBlue[25]} 0%, ${blueCarbon.alpha.aqua[20]} 100%)`,
            transform: 'scale(1.1) rotate(15deg)',
          }
        }}
      >
        {darkMode ? (
          <Brightness7 sx={{ color: blueCarbon.seafoam }} />
        ) : (
          <Brightness4 sx={{ color: blueCarbon.oceanBlue }} />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;