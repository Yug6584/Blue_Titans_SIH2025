import React from 'react';
import { Box, Tooltip, useTheme } from '@mui/material';
import { blueCarbon } from '../theme/colors';

const EcosystemImage = ({ type, width = 200, height = 150 }) => {
  const theme = useTheme();
  const darkMode = theme.palette.mode === 'dark';
  const getTooltipText = () => {
    switch (type) {
      case 'mangrove':
        return 'Mangrove forests: Salt-tolerant trees with aerial roots that create complex ecosystems in tidal zones. They store massive amounts of carbon in their sediments.';
      case 'seagrass':
        return 'Seagrass meadows: Underwater flowering plants that form dense carpets on the seafloor. They are among the most efficient carbon-capturing ecosystems on Earth.';
      case 'saltmarsh':
        return 'Salt marshes: Coastal wetlands with salt-tolerant grasses that are regularly flooded by tides. They provide crucial coastal protection and carbon storage.';
      default:
        return 'Blue carbon ecosystem';
    }
  };
  const getEcosystemStyle = () => {
    switch (type) {
      case 'mangrove':
        return {
          background: darkMode
            ? `linear-gradient(135deg, ${blueCarbon.secondary[700]} 0%, ${blueCarbon.forest} 30%, ${blueCarbon.seafoam} 60%, ${blueCarbon.secondary[400]} 100%)`
            : `linear-gradient(135deg, ${blueCarbon.forest} 0%, ${blueCarbon.seafoam} 30%, ${blueCarbon.secondary[300]} 60%, ${blueCarbon.secondary[200]} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '40%',
            background: darkMode
              ? `linear-gradient(180deg, ${blueCarbon.alpha.oceanBlue[50]} 0%, ${blueCarbon.alpha.deepOcean[90]} 100%)`
              : `linear-gradient(180deg, ${blueCarbon.alpha.oceanBlue[30]} 0%, ${blueCarbon.alpha.oceanBlue[80]} 100%)`,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '20%',
            left: '10%',
            width: '15px',
            height: '60%',
            background: darkMode ? blueCarbon.secondary[800] : blueCarbon.secondary[900],
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            boxShadow: darkMode
              ? `25px 0 0 ${blueCarbon.secondary[800]}, 50px 0 0 ${blueCarbon.secondary[700]}, 75px 0 0 ${blueCarbon.secondary[800]}, 100px 0 0 ${blueCarbon.secondary[700]}`
              : `25px 0 0 ${blueCarbon.secondary[900]}, 50px 0 0 ${blueCarbon.secondary[800]}, 75px 0 0 ${blueCarbon.secondary[900]}, 100px 0 0 ${blueCarbon.secondary[800]}`,
          }
        };
      
      case 'seagrass':
        return {
          background: `linear-gradient(135deg, ${blueCarbon.deepOcean} 0%, ${blueCarbon.oceanBlue} 30%, ${blueCarbon.aqua} 60%, ${blueCarbon.primary[200]} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '30%',
            background: `linear-gradient(180deg, ${blueCarbon.alpha.seafoam[40]} 0%, ${blueCarbon.alpha.forest[80]} 100%)`,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '20%',
            left: '15%',
            width: '3px',
            height: '40%',
            background: blueCarbon.secondary[700],
            borderRadius: '50% 50% 0 0',
            boxShadow: `8px 0 0 ${blueCarbon.forest}, 16px 0 0 ${blueCarbon.secondary[400]}, 24px 0 0 ${blueCarbon.secondary[700]}, 32px 0 0 ${blueCarbon.forest}, 40px 0 0 ${blueCarbon.secondary[400]}, 48px 0 0 ${blueCarbon.secondary[700]}, 56px 0 0 ${blueCarbon.forest}, 64px 0 0 ${blueCarbon.secondary[400]}`,
            transform: 'rotate(-5deg)',
          }
        };
      
      case 'saltmarsh':
        return {
          background: `linear-gradient(135deg, ${blueCarbon.aqua} 0%, ${blueCarbon.seafoam} 30%, ${blueCarbon.secondary[300]} 60%, ${blueCarbon.secondary[200]} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '25%',
            background: `linear-gradient(180deg, ${blueCarbon.alpha.deepOcean[30]} 0%, ${blueCarbon.alpha.deepOcean[80]} 100%)`,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '20%',
            left: '20%',
            width: '2px',
            height: '35%',
            background: blueCarbon.secondary[600],
            borderRadius: '50% 50% 0 0',
            boxShadow: `6px 0 0 ${blueCarbon.secondary[500]}, 12px 0 0 ${blueCarbon.seafoam}, 18px 0 0 ${blueCarbon.secondary[600]}, 24px 0 0 ${blueCarbon.secondary[500]}, 30px 0 0 ${blueCarbon.seafoam}, 36px 0 0 ${blueCarbon.secondary[600]}, 42px 0 0 ${blueCarbon.secondary[500]}, 48px 0 0 ${blueCarbon.seafoam}, 54px 0 0 ${blueCarbon.secondary[600]}`,
            transform: 'rotate(2deg)',
          }
        };
      
      default:
        return {
          background: '#e0e0e0'
        };
    }
  };

  return (
    <Tooltip title={getTooltipText()} arrow placement="top">
      <Box
        sx={{
          width: width,
          height: height,
          borderRadius: 2,
          ...getEcosystemStyle(),
          mb: 2,
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
          }
        }}
      />
    </Tooltip>
  );
};

export default EcosystemImage;