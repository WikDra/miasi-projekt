import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';

interface LoginViewProps {
  onLogin: (credentials: { email: string; password: string }) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const testAccounts = [
  'admin@school.local / Admin123!',
  'teacher@school.local / Teacher123!',
  'student@school.local / Student123!',
];

export function LoginView({ onLogin, loading, error }: LoginViewProps) {
  const [email, setEmail] = useState('teacher@school.local');
  const [password, setPassword] = useState('Teacher123!');

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 3, md: 6 },
        background: 'linear-gradient(145deg, rgba(17,100,102,0.14), rgba(209,154,102,0.12))',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 480,
          p: { xs: 3, md: 4 },
          border: '1px solid rgba(17, 100, 102, 0.12)',
          backgroundColor: 'rgba(255,250,242,0.94)',
          backdropFilter: 'blur(18px)',
        }}
      >
        <Typography variant="h4">Zaloguj się</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Użyj jednego z kont dostępu poniżej.
        </Typography>

        {error ? (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        ) : null}

        <Stack
          spacing={2.5}
          sx={{ mt: 3 }}
          component="form"
          onSubmit={(event) => {
            event.preventDefault();
            void onLogin({ email, password });
          }}
        >
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Hasło"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            fullWidth
            required
          />
          <Button type="submit" size="large" variant="contained" disabled={loading}>
            {loading ? 'Logowanie...' : 'Wejdź do systemu'}
          </Button>
        </Stack>

        <Paper variant="outlined" sx={{ mt: 3, p: 2.5, backgroundColor: 'rgba(255,255,255,0.72)' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Konta dostępu
          </Typography>
          <Stack spacing={1} sx={{ mt: 1.5 }}>
            {testAccounts.map((account) => (
              <Typography key={account} variant="body2" color="text.secondary">
                {account}
              </Typography>
            ))}
          </Stack>
        </Paper>
      </Paper>
    </Box>
  );
}
