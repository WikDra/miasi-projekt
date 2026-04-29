import { createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#116466',
      dark: '#0a4d4f',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#d19a66',
      dark: '#b77f45',
    },
    background: {
      default: '#f3efe7',
      paper: '#fffaf2',
    },
    text: {
      primary: '#132226',
      secondary: '#456268',
    },
    info: {
      main: '#4b7bec',
    },
    success: {
      main: '#2a9d8f',
    },
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily: '"Space Grotesk", "Source Sans 3", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.04em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.03em',
    },
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontWeight: 700,
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});
