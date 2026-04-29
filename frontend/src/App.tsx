import { Alert, Box, CircularProgress, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Shell } from './components/Shell';
import { fetchBootstrap, login } from './api';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import type { BootstrapResponse, SectionKey, Session } from './types';

const sessionStorageKey = 'school-nexus-session';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [bootstrap, setBootstrap] = useState<BootstrapResponse | null>(null);
  const [activeSection, setActiveSection] = useState<SectionKey>('dashboard');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedSession = window.localStorage.getItem(sessionStorageKey);
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession) as Session;
        setSession(parsed);
        void loadBootstrap();
      } catch {
        window.localStorage.removeItem(sessionStorageKey);
      }
    }
    setInitializing(false);
  }, []);

  async function loadBootstrap(preserveSessionOnFailure = false) {
    try {
      setError(null);
      setBootstrap(await fetchBootstrap());
      return true;
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Nie udało się pobrać danych z backendu';
      setError(`Nie udało się połączyć z backendem: ${message}`);
      if (!preserveSessionOnFailure) {
        setBootstrap(null);
        setSession(null);
        window.localStorage.removeItem(sessionStorageKey);
      }
      return false;
    }
  }

  async function handleLogin(credentials: { email: string; password: string }) {
    setLoading(true);
    setError(null);
    try {
      const response = await login(credentials);
      const nextSession: Session = {
        token: response.token,
        userId: response.userId,
        fullName: response.fullName,
        email: response.email,
        roles: response.roles,
      };

      setSession(nextSession);
      window.localStorage.setItem(sessionStorageKey, JSON.stringify(nextSession));
      const loaded = await loadBootstrap();
      if (!loaded) {
        return;
      }
      setActiveSection('dashboard');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Nie udało się zalogować');
      setSession(null);
      setBootstrap(null);
      window.localStorage.removeItem(sessionStorageKey);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    setSession(null);
    setBootstrap(null);
    window.localStorage.removeItem(sessionStorageKey);
  }

  if (initializing) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: '100vh' }} spacing={2}>
        <CircularProgress />
        <Typography color="text.secondary">Ładowanie aplikacji...</Typography>
      </Stack>
    );
  }

  if (!session) {
    return <LoginView onLogin={handleLogin} loading={loading} error={error} />;
  }

  if (!bootstrap) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: '100vh' }} spacing={2}>
        <CircularProgress />
        <Typography color="text.secondary">Pobieranie danych startowych...</Typography>
      </Stack>
    );
  }

  return (
    <Box>
      {error ? (
        <Box sx={{ px: { xs: 2, md: 4 }, pt: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      ) : null}
      <Shell
        session={session}
        activeSection={activeSection}
        onNavigate={setActiveSection}
        onLogout={handleLogout}
      >
        <DashboardView
          bootstrap={bootstrap}
          activeSection={activeSection}
          session={session}
          onRefreshBootstrap={loadBootstrap}
        />
      </Shell>
    </Box>
  );
}
