import { createTheme, ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { createContext, useEffect, useMemo, useState, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark';

export const ThemeContext = createContext({
  mode: 'light' as ThemeMode,
  toggleMode: () => {},
});

export function getAppTheme(mode: ThemeMode) {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#116466' : '#2c9396',
        dark: mode === 'light' ? '#0a4d4f' : '#1b6b6d',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#d19a66',
        dark: '#b77f45',
      },
      background: {
        default: mode === 'light' ? '#f3efe7' : '#121212',
        paper: mode === 'light' ? '#fffaf2' : '#1e1e1e',
      },
      text: {
        primary: mode === 'light' ? '#132226' : '#f0f0f0',
        secondary: mode === 'light' ? '#456268' : '#a0a0a0',
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
      h1: { fontWeight: 700, letterSpacing: '-0.04em' },
      h2: { fontWeight: 700, letterSpacing: '-0.03em' },
      h3: { fontWeight: 700, letterSpacing: '-0.02em' },
      h4: { fontWeight: 700 },
      button: { textTransform: 'none', fontWeight: 700 },
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
    },
  });
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const [mode, setMode] = useState<ThemeMode>(() => {
    try {
      const stored = localStorage.getItem('theme_mode');
      if (stored === 'light' || stored === 'dark') return stored;
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (e) {}
    return 'light';
  });

  useEffect(() => {
    const stored = localStorage.getItem('theme_mode');
    if (!stored) {
      setMode(prefersDarkMode ? 'dark' : 'light');
    }
  }, [prefersDarkMode]);

  const toggleMode = () => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('theme_mode', next);
      } catch (e) {}
      return next;
    });
  };

  const theme = useMemo(() => getAppTheme(mode), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
}
