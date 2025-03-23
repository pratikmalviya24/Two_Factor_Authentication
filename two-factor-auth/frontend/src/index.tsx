import React from 'react';
import ReactDOM from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import App from './App';

// Create a custom theme
const theme = createTheme({
  // Note on gradient text: We use a combination of background-clip, -webkit-background-clip, 
  // and color: transparent for cross-browser compatibility with gradient text.
  // When using gradient text, include these properties:
  // backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  // MozBackgroundClip: 'text', MozTextFillColor: 'transparent', color: 'transparent'
  palette: {
    primary: {
      main: '#3a7bd5',
      light: '#5e96e3',
      dark: '#2861b7',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00c6aa',
      light: '#4dfadc',
      dark: '#00957f',
      contrastText: '#ffffff',
    },
    error: {
      main: '#f44336',
      light: '#ff7961',
      dark: '#ba000d',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#0d47a1',
    },
    success: {
      main: '#4caf50',
      light: '#80e27e',
      dark: '#087f23',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#2c3e50',
      secondary: '#546e7a',
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '10px',
          padding: '8px 16px',
          boxShadow: 'none',
          fontWeight: 600,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(90deg, #3a7bd5 0%, #2861b7 100%)',
          '&:hover': {
            background: 'linear-gradient(90deg, #2861b7 0%, #3a7bd5 100%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(90deg, #00c6aa 0%, #00957f 100%)',
          '&:hover': {
            background: 'linear-gradient(90deg, #00957f 0%, #00c6aa 100%)',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '10px',
            transition: 'all 0.3s ease',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#3a7bd5',
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: '2px',
                borderColor: '#3a7bd5',
              },
            },
          },
          '& .MuiInputLabel-outlined': {
            '&.Mui-focused': {
              color: '#3a7bd5',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
        },
        elevation1: {
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.05)',
        },
        elevation2: {
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
        },
        elevation3: {
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          overflow: 'hidden',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '16px',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          height: '8px',
        },
      },
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      fontWeight: 600,
    },
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.5px',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.5px',
    },
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.5px',
    },
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.25px',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.25px',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.25px',
    },
    subtitle1: {
      fontWeight: 500,
    },
    subtitle2: {
      fontWeight: 500,
    },
  },
  shadows: [
    'none',
    '0px 2px 1px -1px rgba(0,0,0,0.05),0px 1px 1px 0px rgba(0,0,0,0.03),0px 1px 3px 0px rgba(0,0,0,0.05)',
    '0px 3px 1px -2px rgba(0,0,0,0.06),0px 2px 2px 0px rgba(0,0,0,0.04),0px 1px 5px 0px rgba(0,0,0,0.06)',
    '0px 3px 3px -2px rgba(0,0,0,0.07),0px 3px 4px 0px rgba(0,0,0,0.05),0px 1px 8px 0px rgba(0,0,0,0.07)',
    '0px 2px 4px -1px rgba(0,0,0,0.08),0px 4px 5px 0px rgba(0,0,0,0.06),0px 1px 10px 0px rgba(0,0,0,0.08)',
    '0px 3px 5px -1px rgba(0,0,0,0.09),0px 5px 8px 0px rgba(0,0,0,0.07),0px 1px 14px 0px rgba(0,0,0,0.09)',
    '0px 3px 5px -1px rgba(0,0,0,0.1),0px 6px 10px 0px rgba(0,0,0,0.08),0px 1px 18px 0px rgba(0,0,0,0.1)',
    '0px 4px 5px -2px rgba(0,0,0,0.11),0px 7px 10px 1px rgba(0,0,0,0.09),0px 2px 16px 1px rgba(0,0,0,0.11)',
    '0px 5px 5px -3px rgba(0,0,0,0.12),0px 8px 10px 1px rgba(0,0,0,0.1),0px 3px 14px 2px rgba(0,0,0,0.12)',
    '0px 5px 6px -3px rgba(0,0,0,0.13),0px 9px 12px 1px rgba(0,0,0,0.11),0px 3px 16px 2px rgba(0,0,0,0.13)',
    '0px 6px 6px -3px rgba(0,0,0,0.14),0px 10px 14px 1px rgba(0,0,0,0.12),0px 4px 18px 3px rgba(0,0,0,0.14)',
    '0px 6px 7px -4px rgba(0,0,0,0.15),0px 11px 15px 1px rgba(0,0,0,0.13),0px 4px 20px 3px rgba(0,0,0,0.15)',
    '0px 7px 8px -4px rgba(0,0,0,0.16),0px 12px 17px 2px rgba(0,0,0,0.14),0px 5px 22px 4px rgba(0,0,0,0.16)',
    '0px 7px 8px -4px rgba(0,0,0,0.17),0px 13px 19px 2px rgba(0,0,0,0.15),0px 5px 24px 4px rgba(0,0,0,0.17)',
    '0px 7px 9px -4px rgba(0,0,0,0.18),0px 14px 21px 2px rgba(0,0,0,0.16),0px 5px 26px 4px rgba(0,0,0,0.18)',
    '0px 8px 9px -5px rgba(0,0,0,0.19),0px 15px 22px 2px rgba(0,0,0,0.17),0px 6px 28px 5px rgba(0,0,0,0.19)',
    '0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.18),0px 6px 30px 5px rgba(0,0,0,0.2)',
    '0px 8px 11px -5px rgba(0,0,0,0.21),0px 17px 26px 2px rgba(0,0,0,0.19),0px 6px 32px 5px rgba(0,0,0,0.21)',
    '0px 9px 11px -5px rgba(0,0,0,0.22),0px 18px 28px 2px rgba(0,0,0,0.2),0px 7px 34px 6px rgba(0,0,0,0.22)',
    '0px 9px 12px -6px rgba(0,0,0,0.23),0px 19px 29px 2px rgba(0,0,0,0.21),0px 7px 36px 6px rgba(0,0,0,0.23)',
    '0px 10px 13px -6px rgba(0,0,0,0.24),0px 20px 31px 3px rgba(0,0,0,0.22),0px 8px 38px 7px rgba(0,0,0,0.24)',
    '0px 10px 13px -6px rgba(0,0,0,0.25),0px 21px 33px 3px rgba(0,0,0,0.23),0px 8px 40px 7px rgba(0,0,0,0.25)',
    '0px 10px 14px -6px rgba(0,0,0,0.26),0px 22px 35px 3px rgba(0,0,0,0.24),0px 8px 42px 7px rgba(0,0,0,0.26)',
    '0px 11px 14px -7px rgba(0,0,0,0.27),0px 23px 36px 3px rgba(0,0,0,0.25),0px 9px 44px 8px rgba(0,0,0,0.27)',
    '0px 11px 15px -7px rgba(0,0,0,0.28),0px 24px 38px 3px rgba(0,0,0,0.26),0px 9px 46px 8px rgba(0,0,0,0.28)',
  ],
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
