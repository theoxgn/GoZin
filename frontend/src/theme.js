import { createTheme } from '@mui/material/styles';

// Tema utama aplikasi dengan desain yang lebih modern
const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb', // Biru yang lebih modern
      light: '#93c5fd',
      dark: '#1e40af',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f43f5e', // Merah muda yang lebih modern
      light: '#fda4af',
      dark: '#be123c',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    error: {
      main: '#ef4444',
    },
    warning: {
      main: '#f59e0b',
    },
    info: {
      main: '#3b82f6',
    },
    success: {
      main: '#10b981',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
      disabled: '#94a3b8',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 2px 1px -1px rgba(0,0,0,0.05),0px 1px 1px 0px rgba(0,0,0,0.03),0px 1px 3px 0px rgba(0,0,0,0.05)',
    '0px 3px 3px -2px rgba(0,0,0,0.06),0px 3px 4px 0px rgba(0,0,0,0.04),0px 1px 8px 0px rgba(0,0,0,0.06)',
    '0px 3px 5px -1px rgba(0,0,0,0.06),0px 5px 8px 0px rgba(0,0,0,0.04),0px 1px 14px 0px rgba(0,0,0,0.08)',
    '0px 4px 5px -2px rgba(0,0,0,0.06),0px 7px 10px 1px rgba(0,0,0,0.04),0px 2px 16px 1px rgba(0,0,0,0.08)',
    '0px 6px 10px -3px rgba(0,0,0,0.07),0px 10px 14px 1px rgba(0,0,0,0.05),0px 4px 18px 3px rgba(0,0,0,0.1)',
    '0px 7px 10px -4px rgba(0,0,0,0.07),0px 12px 17px 2px rgba(0,0,0,0.05),0px 5px 22px 4px rgba(0,0,0,0.1)',
    '0px 8px 11px -5px rgba(0,0,0,0.07),0px 14px 19px 2px rgba(0,0,0,0.05),0px 5px 24px 4px rgba(0,0,0,0.1)',
    '0px 9px 12px -6px rgba(0,0,0,0.07),0px 16px 20px 2px rgba(0,0,0,0.05),0px 6px 26px 5px rgba(0,0,0,0.1)',
    '0px 10px 13px -6px rgba(0,0,0,0.07),0px 18px 22px 3px rgba(0,0,0,0.05),0px 7px 28px 5px rgba(0,0,0,0.1)',
    '0px 11px 14px -7px rgba(0,0,0,0.07),0px 20px 24px 3px rgba(0,0,0,0.05),0px 8px 30px 6px rgba(0,0,0,0.1)',
    '0px 12px 16px -7px rgba(0,0,0,0.07),0px 22px 26px 3px rgba(0,0,0,0.05),0px 8px 32px 6px rgba(0,0,0,0.1)',
    '0px 12px 17px -8px rgba(0,0,0,0.07),0px 24px 28px 3px rgba(0,0,0,0.05),0px 9px 34px 7px rgba(0,0,0,0.1)',
    '0px 13px 18px -8px rgba(0,0,0,0.07),0px 26px 30px 4px rgba(0,0,0,0.05),0px 10px 36px 7px rgba(0,0,0,0.1)',
    '0px 14px 19px -9px rgba(0,0,0,0.07),0px 28px 32px 4px rgba(0,0,0,0.05),0px 10px 38px 8px rgba(0,0,0,0.1)',
    '0px 15px 20px -9px rgba(0,0,0,0.07),0px 30px 34px 4px rgba(0,0,0,0.05),0px 11px 40px 8px rgba(0,0,0,0.1)',
    '0px 16px 22px -10px rgba(0,0,0,0.07),0px 32px 36px 5px rgba(0,0,0,0.05),0px 12px 42px 9px rgba(0,0,0,0.1)',
    '0px 16px 23px -10px rgba(0,0,0,0.07),0px 34px 38px 5px rgba(0,0,0,0.05),0px 12px 44px 9px rgba(0,0,0,0.1)',
    '0px 17px 24px -11px rgba(0,0,0,0.07),0px 36px 40px 5px rgba(0,0,0,0.05),0px 13px 46px 10px rgba(0,0,0,0.1)',
    '0px 18px 25px -11px rgba(0,0,0,0.07),0px 38px 42px 6px rgba(0,0,0,0.05),0px 14px 48px 10px rgba(0,0,0,0.1)',
    '0px 19px 26px -12px rgba(0,0,0,0.07),0px 40px 44px 6px rgba(0,0,0,0.05),0px 14px 50px 11px rgba(0,0,0,0.1)',
    '0px 19px 28px -12px rgba(0,0,0,0.07),0px 42px 46px 6px rgba(0,0,0,0.05),0px 15px 52px 11px rgba(0,0,0,0.1)',
    '0px 20px 29px -13px rgba(0,0,0,0.07),0px 44px 48px 7px rgba(0,0,0,0.05),0px 16px 54px 12px rgba(0,0,0,0.1)',
    '0px 21px 30px -13px rgba(0,0,0,0.07),0px 46px 50px 7px rgba(0,0,0,0.05),0px 16px 56px 12px rgba(0,0,0,0.1)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          },
        },
        outlined: {
          borderWidth: 1.5,
          '&:hover': {
            borderWidth: 1.5,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px',
          '&:last-child': {
            paddingBottom: '24px',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 10px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          padding: '8px 16px',
          '&.Mui-selected': {
            backgroundColor: 'rgba(37, 99, 235, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(37, 99, 235, 0.12)',
            },
            '& .MuiListItemIcon-root': {
              color: '#2563eb',
            },
            '& .MuiListItemText-primary': {
              color: '#2563eb',
              fontWeight: 600,
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: '#f8fafc',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: '#2563eb',
          color: '#ffffff',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;