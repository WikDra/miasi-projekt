import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  Grid, MenuItem, Paper, Stack, TextField, Typography,
} from '@mui/material';
import { useMemo, useState, type FormEvent } from 'react';
import { createMessage, markNotificationRead } from '../api';
import { EntityTable } from '../components/EntityTable';
import type { BootstrapResponse, Session } from '../types';

interface MessagesSectionProps {
  bootstrap: BootstrapResponse;
  session: Session;
  onRefreshBootstrap: (preserveSessionOnFailure?: boolean) => Promise<boolean>;
}

function formatDateLabel(value: string) {
  return new Date(value).toLocaleDateString('pl-PL');
}

export function MessagesSection({ bootstrap, session, onRefreshBootstrap }: MessagesSectionProps) {
  const userById = useMemo(() => new Map(bootstrap.users.map((u) => [u.id, u])), [bootstrap.users]);

  // Filter messages by role
  const visibleMessages = useMemo(() => {
    if (session.roles.some((r) => ['ADMIN', 'DIRECTOR'].includes(r))) return bootstrap.messages;
    return bootstrap.messages.filter((m) => m.senderId === session.userId || m.recipientId === session.userId);
  }, [bootstrap.messages, session]);

  // Filter notifications by user
  const myNotifications = useMemo(
    () => bootstrap.notifications.filter((n) => n.userId === session.userId),
    [bootstrap.notifications, session.userId],
  );

  const [recipientId, setRecipientId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<typeof visibleMessages[0] | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError(null); setSuccess(null);
    try {
      await createMessage({ recipientId, title, content }, session.token);
      await onRefreshBootstrap(true);
      setSuccess('Wiadomość wysłana.');
      setTitle(''); setContent('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nie udało się wysłać wiadomości');
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(notificationId: string) {
    try {
      await markNotificationRead(notificationId, session.token);
      await onRefreshBootstrap(true);
    } catch {
      // silently ignore
    }
  }

  return (
    <Stack spacing={3}>
      <Box><Typography variant="h3">Wiadomości i powiadomienia</Typography></Box>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={5}>
          <Paper elevation={0} sx={{
            p: 3, border: '1px solid rgba(17,100,102,0.12)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,250,242,0.86))',
          }}>
            <Typography variant="h6">Wyślij wiadomość</Typography>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
            <Stack component="form" spacing={2} sx={{ mt: 2.5 }} onSubmit={(e) => { void handleSubmit(e); }}>
              <TextField select label="Odbiorca" value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)} required fullWidth>
                {bootstrap.users.filter((u) => u.id !== session.userId).map((u) => (
                  <MenuItem key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.roles.join(', ')})</MenuItem>
                ))}
              </TextField>
              <TextField label="Tytuł" value={title} onChange={(e) => setTitle(e.target.value)} required fullWidth />
              <TextField label="Treść" value={content} onChange={(e) => setContent(e.target.value)}
                multiline minRows={3} required fullWidth />
              <Button type="submit" variant="contained" size="large" disabled={loading}>
                {loading ? 'Wysyłanie...' : 'Wyślij'}
              </Button>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={7}>
          <Stack spacing={2.5}>
            <EntityTable
              title="Wiadomości"
              rows={visibleMessages}
              columns={[
                { key: 'title', label: 'Tytuł' },
                { key: 'senderId', label: 'Nadawca', render: (row) => {
                  const u = userById.get(row.senderId);
                  return u ? `${u.firstName} ${u.lastName}` : row.senderId;
                }},
                { key: 'recipientId', label: 'Odbiorca', render: (row) => {
                  const u = userById.get(row.recipientId);
                  return u ? `${u.firstName} ${u.lastName}` : row.recipientId;
                }},
                { key: 'sentAt', label: 'Data', render: (row) => formatDateLabel(row.sentAt) },
              ]}
            />

            <EntityTable
              title="Powiadomienia"
              rows={myNotifications}
              columns={[
                { key: 'type', label: 'Typ' },
                { key: 'content', label: 'Treść' },
                { key: 'read', label: 'Status', render: (row) => (
                  row.read
                    ? <Chip label="Przeczytane" color="success" size="small" />
                    : <Chip label="Nowe" color="warning" size="small"
                        onClick={() => { void handleMarkRead(row.id); }}
                        sx={{ cursor: 'pointer' }} />
                )},
                { key: 'createdAt', label: 'Data', render: (row) => formatDateLabel(row.createdAt) },
              ]}
            />

            <EntityTable
              title="Materiały dydaktyczne"
              rows={bootstrap.teachingMaterials}
              columns={[
                { key: 'title', label: 'Tytuł' },
                { key: 'fileUrl', label: 'Plik' },
                { key: 'publishedAt', label: 'Opublikowano', render: (row) => formatDateLabel(row.publishedAt) },
              ]}
            />
          </Stack>
        </Grid>
      </Grid>

      <Dialog open={!!selectedMessage} onClose={() => setSelectedMessage(null)} maxWidth="sm" fullWidth>
        {selectedMessage && (
          <>
            <DialogTitle>{selectedMessage.title}</DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Od: {userById.get(selectedMessage.senderId)?.firstName ?? '?'} •{' '}
                {formatDateLabel(selectedMessage.sentAt)}
              </Typography>
              <Typography>{selectedMessage.content}</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedMessage(null)}>Zamknij</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Stack>
  );
}
