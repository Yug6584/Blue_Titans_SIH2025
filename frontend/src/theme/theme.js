import { createTheme } from '@mui/material/styles';
import { blueCarbon } from './colors';

export const createBlueCarbonTheme = (darkMode = false) => createTheme({
  palette: {
    mode: darkMode ? 'dark' : 'light',
    primary: {
      main: blueCarbon.oceanBlue,
      light: blueCarbon.aqua,
      dark: blueCarbon.deepOcean,
      contrastText: '#ffffff',
    },
    secondary: {
      main: blueCarbon.forest,
      light: blueCarbon.seafoam,
      dark: darkMode ? blueCarbon.secondary[800] : '#1b5e20',
      contrastText: '#ffffff',
    },
    background: {
      default: darkMode ? '#0a1929' : '#fafafa',
      paper: darkMode ? '#132f4c' : '#ffffff',
    },
    text: {
      primary: darkMode ? '#ffffff' : blueCarbon.deepOcean,
      secondary: darkMode ? blueCarbon.aqua : blueCarbon.primary[700],
    },
    divider: darkMode ? blueCarbon.alpha.aqua[30] : blueCarbon.alpha.oceanBlue[20],
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      background: blueCarbon.gradients.primary,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    h2: {
      fontWeight: 600,
      color: blueCarbon.deepOcean,
    },
    h3: {
      fontWeight: 600,
      color: blueCarbon.oceanBlue,
    },
    h4: {
      fontWeight: 500,
      color: blueCarbon.primary[700],
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: darkMode 
            ? `linear-gradient(135deg, ${blueCarbon.alpha.deepOcean[20]} 0%, ${blueCarbon.alpha.oceanBlue[15]} 100%)`
            : blueCarbon.gradients.cardOcean,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${darkMode ? blueCarbon.alpha.aqua[30] : blueCarbon.alpha.oceanBlue[20]}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            background: darkMode
              ? `linear-gradient(135deg, ${blueCarbon.alpha.deepOcean[30]} 0%, ${blueCarbon.alpha.oceanBlue[25]} 100%)`
              : blueCarbon.gradients.hoverOcean,
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 25px ${darkMode ? blueCarbon.alpha.aqua[40] : blueCarbon.alpha.oceanBlue[30]}`,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
        },
        contained: {
          background: darkMode 
            ? `linear-gradient(135deg, ${blueCarbon.deepOcean} 0%, ${blueCarbon.oceanBlue} 100%)`
            : blueCarbon.gradients.oceanDepth,
          color: 'white',
          '&:hover': {
            background: darkMode
              ? `linear-gradient(135deg, ${blueCarbon.oceanBlue} 0%, ${blueCarbon.aqua} 100%)`
              : blueCarbon.gradients.shallowWater,
            transform: 'translateY(-1px)',
            boxShadow: `0 4px 15px ${darkMode ? blueCarbon.alpha.aqua[50] : blueCarbon.alpha.oceanBlue[40]}`,
          },
        },
        outlined: {
          borderColor: darkMode ? blueCarbon.aqua : blueCarbon.oceanBlue,
          color: darkMode ? blueCarbon.aqua : blueCarbon.oceanBlue,
          '&:hover': {
            background: darkMode ? blueCarbon.alpha.aqua[15] : blueCarbon.alpha.oceanBlue[10],
            borderColor: darkMode ? blueCarbon.seafoam : blueCarbon.aqua,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
        colorPrimary: {
          background: blueCarbon.gradients.lightOcean,
          color: blueCarbon.deepOcean,
          border: `1px solid ${blueCarbon.alpha.oceanBlue[30]}`,
        },
        colorSecondary: {
          background: blueCarbon.gradients.lightForest,
          color: blueCarbon.forest,
          border: `1px solid ${blueCarbon.alpha.forest[30]}`,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          background: darkMode 
            ? `linear-gradient(135deg, ${blueCarbon.alpha.deepOcean[20]} 0%, ${blueCarbon.alpha.oceanBlue[15]} 100%)`
            : blueCarbon.gradients.lightOcean,
          borderRadius: 12,
          padding: 4,
        },
        indicator: {
          background: darkMode
            ? `linear-gradient(135deg, ${blueCarbon.aqua} 0%, ${blueCarbon.seafoam} 100%)`
            : blueCarbon.gradients.oceanDepth,
          height: 3,
          borderRadius: 2,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          color: blueCarbon.primary[700],
          '&.Mui-selected': {
            color: blueCarbon.deepOcean,
            fontWeight: 600,
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        standardInfo: {
          background: darkMode
            ? `linear-gradient(135deg, ${blueCarbon.alpha.oceanBlue[20]} 0%, ${blueCarbon.alpha.aqua[15]} 100%)`
            : blueCarbon.gradients.lightOcean,
          color: darkMode ? blueCarbon.aqua : blueCarbon.deepOcean,
          border: `1px solid ${darkMode ? blueCarbon.alpha.aqua[40] : blueCarbon.alpha.oceanBlue[30]}`,
        },
        standardSuccess: {
          background: darkMode
            ? `linear-gradient(135deg, ${blueCarbon.alpha.forest[20]} 0%, ${blueCarbon.alpha.seafoam[15]} 100%)`
            : blueCarbon.gradients.lightForest,
          color: darkMode ? blueCarbon.seafoam : blueCarbon.forest,
          border: `1px solid ${darkMode ? blueCarbon.alpha.seafoam[40] : blueCarbon.alpha.forest[30]}`,
        },
      },
    },
  },
});

export default createBlueCarbonTheme;