import { createTheme } from '@mui/material/styles';

/**
 * Minecraft-inspired MUI theme configuration
 * Provides dark palette with stone gray and grass green colors,
 * Minecraft font typography, and custom button styling
 */
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8B8B8B',      // Stone gray
      light: '#A0A0A0',
      dark: '#6B6B6B',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#7CBD3B',      // Grass green
      light: '#8FD14F',
      dark: '#5FA02C',
      contrastText: '#FFFFFF',
    },
    background: {
      default: 'rgba(0, 0, 0, 0.85)',
      paper: 'rgba(60, 60, 60, 0.95)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#CCCCCC',
    },
  },
  typography: {
    fontFamily: '"Minecraft", "Press Start 2P", "Courier New", monospace',
    button: {
      textTransform: 'uppercase',
      fontWeight: 'bold',
      letterSpacing: '0.05em',
    },
    h1: {
      fontFamily: '"Minecraft", "Press Start 2P", "Courier New", monospace',
      fontSize: '3rem',
      fontWeight: 'bold',
      textRendering: 'optimizeLegibility',
    },
    h2: {
      fontFamily: '"Minecraft", "Press Start 2P", "Courier New", monospace',
      fontSize: '2.5rem',
      fontWeight: 'bold',
      textRendering: 'optimizeLegibility',
    },
    h3: {
      fontFamily: '"Minecraft", "Press Start 2P", "Courier New", monospace',
      fontSize: '2rem',
      fontWeight: 'bold',
      textRendering: 'optimizeLegibility',
    },
    h4: {
      fontFamily: '"Minecraft", "Press Start 2P", "Courier New", monospace',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      textRendering: 'optimizeLegibility',
    },
    body1: {
      fontFamily: '"Minecraft", "Press Start 2P", "Courier New", monospace',
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontFamily: '"Minecraft", "Press Start 2P", "Courier New", monospace',
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,           // Square corners for Minecraft aesthetic
          border: '2px solid #000',  // Black border
          boxShadow: '4px 4px 0 rgba(0, 0, 0, 0.5)',  // Minecraft-style shadow
          padding: '12px 24px',
          fontSize: '1.2rem',
          transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform, box-shadow',
          '&:hover': {
            boxShadow: '6px 6px 0 rgba(0, 0, 0, 0.6)',
            transform: 'translate(-1px, -1px)',
          },
          '&:active': {
            boxShadow: '2px 2px 0 rgba(0, 0, 0, 0.4)',
            transform: 'translate(2px, 2px)',
            transition: 'all 0.05s ease',
          },
        },
        contained: {
          backgroundColor: '#8B8B8B',
          '&:hover': {
            backgroundColor: '#A0A0A0',
          },
        },
        outlined: {
          borderColor: '#8B8B8B',
          color: '#FFFFFF',
          '&:hover': {
            borderColor: '#A0A0A0',
            backgroundColor: 'rgba(139, 139, 139, 0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 0,
            transition: 'all 0.2s ease',
            '& fieldset': {
              borderColor: '#8B8B8B',
              borderWidth: '2px',
              transition: 'border-color 0.2s ease',
            },
            '&:hover fieldset': {
              borderColor: '#A0A0A0',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#7CBD3B',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: '2px solid #000',
          boxShadow: '4px 4px 0 rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          '& .MuiSlider-thumb': {
            borderRadius: 0,
            width: 16,
            height: 16,
            border: '2px solid #000',
            boxShadow: '2px 2px 0 rgba(0, 0, 0, 0.5)',
            transition: 'box-shadow 0.15s ease, transform 0.15s ease',
            '&:hover': {
              boxShadow: '3px 3px 0 rgba(0, 0, 0, 0.6)',
            },
            '&:active': {
              transform: 'scale(1.1)',
            },
          },
          '& .MuiSlider-track': {
            border: '1px solid #000',
            transition: 'background-color 0.2s ease',
          },
          '& .MuiSlider-rail': {
            border: '1px solid #000',
            opacity: 0.5,
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .MuiSwitch-thumb': {
            borderRadius: 0,
            border: '1px solid #000',
            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          '& .MuiSwitch-track': {
            borderRadius: 0,
            border: '1px solid #000',
            transition: 'background-color 0.2s ease',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.15s ease',
          '&:hover': {
            transform: 'scale(1.05)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.15s ease',
        },
      },
    },
  },
  shape: {
    borderRadius: 0,  // Global square corners
  },
  shadows: [
    'none',
    '2px 2px 0 rgba(0, 0, 0, 0.3)',
    '3px 3px 0 rgba(0, 0, 0, 0.4)',
    '4px 4px 0 rgba(0, 0, 0, 0.5)',
    '5px 5px 0 rgba(0, 0, 0, 0.6)',
    '6px 6px 0 rgba(0, 0, 0, 0.7)',
    '7px 7px 0 rgba(0, 0, 0, 0.7)',
    '8px 8px 0 rgba(0, 0, 0, 0.8)',
    '9px 9px 0 rgba(0, 0, 0, 0.8)',
    '10px 10px 0 rgba(0, 0, 0, 0.9)',
    '11px 11px 0 rgba(0, 0, 0, 0.9)',
    '12px 12px 0 rgba(0, 0, 0, 0.9)',
    '13px 13px 0 rgba(0, 0, 0, 0.9)',
    '14px 14px 0 rgba(0, 0, 0, 0.9)',
    '15px 15px 0 rgba(0, 0, 0, 0.9)',
    '16px 16px 0 rgba(0, 0, 0, 0.9)',
    '17px 17px 0 rgba(0, 0, 0, 0.9)',
    '18px 18px 0 rgba(0, 0, 0, 0.9)',
    '19px 19px 0 rgba(0, 0, 0, 0.9)',
    '20px 20px 0 rgba(0, 0, 0, 0.9)',
    '21px 21px 0 rgba(0, 0, 0, 0.9)',
    '22px 22px 0 rgba(0, 0, 0, 0.9)',
    '23px 23px 0 rgba(0, 0, 0, 0.9)',
    '24px 24px 0 rgba(0, 0, 0, 0.9)',
  ],
});

export default theme;
