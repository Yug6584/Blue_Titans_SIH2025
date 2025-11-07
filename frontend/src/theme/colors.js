// Blue Carbon Theme - Ocean to Forest Color Palette
// Based on the beautiful gradient from deep ocean blues to forest greens

export const blueCarbon = {
  // Primary Colors from the palette
  deepOcean: '#02456f',    // Deep navy blue
  oceanBlue: '#0b5faf',    // Ocean blue  
  aqua: '#3cc4cb',         // Aqua/cyan
  seafoam: '#6bef07',      // Light seafoam green
  forest: '#00a85c',       // Forest green

  // Extended palette with variations
  primary: {
    50: '#e3f2fd',
    100: '#bbdefb', 
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#0b5faf',  // Main ocean blue
    600: '#1e88e5',
    700: '#1976d2',
    800: '#1565c0',
    900: '#02456f'   // Deep ocean
  },

  secondary: {
    50: '#e8f5e8',
    100: '#c8e6c8',
    200: '#a5d6a7',
    300: '#81c784',
    400: '#66bb6a',
    500: '#00a85c',  // Forest green
    600: '#43a047',
    700: '#388e3c',
    800: '#2e7d32',
    900: '#1b5e20'
  },

  accent: {
    aqua: '#3cc4cb',
    seafoam: '#6bef07',
    lightAqua: '#80deea',
    darkTeal: '#00695c'
  },

  // Gradient combinations
  gradients: {
    // Main brand gradient - ocean to forest
    primary: 'linear-gradient(135deg, #02456f 0%, #0b5faf 25%, #3cc4cb 50%, #6bef07 75%, #00a85c 100%)',
    
    // Ocean depths
    oceanDepth: 'linear-gradient(135deg, #02456f 0%, #0b5faf 50%, #3cc4cb 100%)',
    
    // Shallow waters
    shallowWater: 'linear-gradient(135deg, #3cc4cb 0%, #6bef07 50%, #00a85c 100%)',
    
    // Subtle backgrounds
    lightOcean: 'linear-gradient(135deg, rgba(11, 95, 175, 0.1) 0%, rgba(60, 196, 203, 0.1) 100%)',
    lightForest: 'linear-gradient(135deg, rgba(107, 239, 7, 0.1) 0%, rgba(0, 168, 92, 0.1) 100%)',
    
    // Card backgrounds
    cardOcean: 'linear-gradient(135deg, rgba(2, 69, 111, 0.05) 0%, rgba(11, 95, 175, 0.1) 100%)',
    cardForest: 'linear-gradient(135deg, rgba(107, 239, 7, 0.05) 0%, rgba(0, 168, 92, 0.1) 100%)',
    
    // Hover effects
    hoverOcean: 'linear-gradient(135deg, rgba(2, 69, 111, 0.15) 0%, rgba(11, 95, 175, 0.2) 100%)',
    hoverForest: 'linear-gradient(135deg, rgba(107, 239, 7, 0.15) 0%, rgba(0, 168, 92, 0.2) 100%)',

    // Dark mode specific gradients
    dark: {
      // Dark ocean depths
      oceanDepth: 'linear-gradient(135deg, #001122 0%, #02456f 50%, #0b5faf 100%)',
      
      // Dark shallow waters
      shallowWater: 'linear-gradient(135deg, #0b5faf 0%, #3cc4cb 50%, #6bef07 100%)',
      
      // Dark backgrounds
      background: 'linear-gradient(135deg, #0a1929 0%, #132f4c 50%, #1e3a5f 100%)',
      
      // Dark card backgrounds
      cardOcean: 'linear-gradient(135deg, rgba(2, 69, 111, 0.3) 0%, rgba(11, 95, 175, 0.2) 100%)',
      cardForest: 'linear-gradient(135deg, rgba(107, 239, 7, 0.2) 0%, rgba(0, 168, 92, 0.3) 100%)',
      
      // Dark hover effects
      hoverOcean: 'linear-gradient(135deg, rgba(2, 69, 111, 0.4) 0%, rgba(11, 95, 175, 0.3) 100%)',
      hoverForest: 'linear-gradient(135deg, rgba(107, 239, 7, 0.3) 0%, rgba(0, 168, 92, 0.4) 100%)',
    }
  },

  // Transparency variations
  alpha: {
    deepOcean: {
      10: 'rgba(2, 69, 111, 0.1)',
      20: 'rgba(2, 69, 111, 0.2)',
      30: 'rgba(2, 69, 111, 0.3)',
      50: 'rgba(2, 69, 111, 0.5)',
      70: 'rgba(2, 69, 111, 0.7)',
      90: 'rgba(2, 69, 111, 0.9)'
    },
    oceanBlue: {
      10: 'rgba(11, 95, 175, 0.1)',
      20: 'rgba(11, 95, 175, 0.2)',
      30: 'rgba(11, 95, 175, 0.3)',
      50: 'rgba(11, 95, 175, 0.5)',
      70: 'rgba(11, 95, 175, 0.7)',
      90: 'rgba(11, 95, 175, 0.9)'
    },
    aqua: {
      10: 'rgba(60, 196, 203, 0.1)',
      20: 'rgba(60, 196, 203, 0.2)',
      30: 'rgba(60, 196, 203, 0.3)',
      50: 'rgba(60, 196, 203, 0.5)',
      70: 'rgba(60, 196, 203, 0.7)',
      90: 'rgba(60, 196, 203, 0.9)'
    },
    seafoam: {
      10: 'rgba(107, 239, 7, 0.1)',
      20: 'rgba(107, 239, 7, 0.2)',
      30: 'rgba(107, 239, 7, 0.3)',
      50: 'rgba(107, 239, 7, 0.5)',
      70: 'rgba(107, 239, 7, 0.7)',
      90: 'rgba(107, 239, 7, 0.9)'
    },
    forest: {
      10: 'rgba(0, 168, 92, 0.1)',
      20: 'rgba(0, 168, 92, 0.2)',
      30: 'rgba(0, 168, 92, 0.3)',
      50: 'rgba(0, 168, 92, 0.5)',
      70: 'rgba(0, 168, 92, 0.7)',
      90: 'rgba(0, 168, 92, 0.9)'
    }
  }
};

export default blueCarbon;