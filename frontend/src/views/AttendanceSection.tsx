import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Paper, Stack, TextField, Typography,
} from '@mui/material';
import { useMemo, useState, type FormEvent } from 'react';
import { createAttendance, excuseAttendance } from '../api';
import { EntityTable } from '../components/EntityTable';
import type { BootstrapResponse, Session } from '../types';

interface AttendanceSectionProps {
  bootstrap: BootstrapResponse;
  session: Session;
  onRefreshBootstrap: (preserveSessionOnFailure?: boolean) => Promise<boolean>;
}

const attendanceStatuses = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];
const statusLabels: Record<string, string> = {
  PRESENT: 'Obecny', ABSENT: 'Nieobecny', LATE: 'Spóźniony', EXCUSED: 'Usprawiedliwiony',
};
const statusColors: Record<string, 'success' | 'error' | 'warning' | 'info'> = {
  PRESENT: 'success', ABSENT: 'error', LATE: 'warning', EXCUSED: 'info',
};

export function AttendanceSection({ bootstrap, session, onRefreshBootstrap }: AttendanceSectionProps) {
  const userById = useMemo(() => new Map(bootstrap.users.map((u) => [u.id, u])), [bootstrap.users]);
  const studentById = useMemo(() => new Map(bootstrap.students.map((s) => [s.id, s])), [bootstrap.students]);

  const canManage = session.roles.some((r) => ['TEACHER', 'ADMIN', 'DIRECTOR'].includes(r));

  // Filter attendance by role
  const visibleAttendance = useMemo(() => {
    if (session.roles.some((r) => ['ADMIN', 'DIRECTOR', 'SECRETARY', 'TEACHER'].includes(r))) {
      return bootstrap.attendance;
    }
    if (session.roles.includes('STUDENT')) {
      const profile = bootstrap.students.find((s) => s.userId === session.userId);
      return profile ? bootstrap.attendance.filter((a) => a.studentId === profile.id) : [];
    }
    if (session.roles.includes('PARENT')) {
      const childProfile = bootstrap.students.find((s) =>
        bootstrap.parents.some((p) => p.userId === session.userId && p.id === s.parentId));
      return childProfile ? bootstrap.attendance.filter((a) => a.studentId === childProfile.id) : [];
    }
    return [];
  }, [bootstrap, session]);

  const [sessionId, setSessionId] = useState(bootstrap.classSessions[0]?.id ?? '');
  const [studentId, setStudentId] = useState(bootstrap.students[0]?.id ?? '');
  const [status, setStatus] = useState('PRESENT');
  const [excuseComment, setExcuseComment] = useState('');
  const [excuseDialogOpen, setExcuseDialogOpen] = useState(false);
  const [excusingAttendanceId, setExcusingAttendanceId] = useState<string | null>(null);
  const [excuseDialogText, setExcuseDialogText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError(null); setSuccess(null);
    try {
      await createAttendance({ sessionId, studentId, status, excuseComment: excuseComment || undefined }, session.token);
      const refreshed = await onRefreshBootstrap(true);
      if (refreshed) {
        setSuccess('Zapisano frekwencję.');
        setExcuseComment('');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nie udało się zapisać frekwencji');
    } finally {
      setLoading(false);
    }
  }

  function openExcuseDialog(attendanceId: string) {
    setExcusingAttendanceId(attendanceId);
    setExcuseDialogText('');
    setError(null);
    setSuccess(null);
    setExcuseDialogOpen(true);
  }

  async function handleExcuseSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!excusingAttendanceId) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await excuseAttendance(excusingAttendanceId, { excuseComment: excuseDialogText }, session.token);
      const refreshed = await onRefreshBootstrap(true);
      if (refreshed) {
        setSuccess('Usprawiedliwiono nieobecność.');
        setExcuseDialogOpen(false);
        setExcusingAttendanceId(null);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Nie udało się usprawiedliwić nieobecności');
    } finally {
      setLoading(false);
    }
  }

  function canExcuse(row: (typeof bootstrap.attendance)[number]) {
    if (row.status === 'EXCUSED') {
      return false;
    }
    if (session.roles.some((role) => ['ADMIN', 'DIRECTOR', 'SECRETARY', 'TEACHER'].includes(role))) {
      return true;
    }
    if (session.roles.includes('STUDENT')) {
      const profile = bootstrap.students.find((student) => student.userId === session.userId);
      return profile?.id === row.studentId;
    }
    if (session.roles.includes('PARENT')) {
      const childProfile = bootstrap.students.find((student) =>
        bootstrap.parents.some((parent) => parent.userId === session.userId && parent.id === student.parentId));
      return childProfile?.id === row.studentId;
    }
    return false;
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: '100%', overflow: 'hidden' }}>
      <Box><Typography variant="h3">Frekwencja</Typography></Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: canManage ? '5fr 7fr' : '1fr' },
          gap: 2.5,
        }}
      >
        {canManage && (
          <Box sx={{ minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
            <Paper elevation={0} sx={{
              p: { xs: 2, sm: 3 }, border: '1px solid rgba(17,100,102,0.12)',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,250,242,0.86))',
              overflow: 'hidden',
            }}>
              <Typography variant="h6">Rejestruj frekwencję</Typography>
              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
              <Stack component="form" spacing={2} sx={{ mt: 2.5 }} onSubmit={(e) => { void handleSubmit(e); }}>
                <TextField select label="Sesja lekcyjna" value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)} required fullWidth>
                  {bootstrap.classSessions.map((s) => (
                    <MenuItem key={s.id} value={s.id}>{s.topic} ({s.sessionDate})</MenuItem>
                  ))}
                </TextField>
                <TextField select label="Uczeń" value={studentId}
                  onChange={(e) => setStudentId(e.target.value)} required fullWidth>
                  {bootstrap.students.map((s) => {
                    const u = userById.get(s.userId);
                    return <MenuItem key={s.id} value={s.id}>{u ? `${u.firstName} ${u.lastName}` : s.studentNumber}</MenuItem>;
                  })}
                </TextField>
                <TextField select label="Status" value={status}
                  onChange={(e) => setStatus(e.target.value)} required fullWidth>
                  {attendanceStatuses.map((s) => <MenuItem key={s} value={s}>{statusLabels[s]}</MenuItem>)}
                </TextField>
                <TextField label="Komentarz" value={excuseComment}
                  onChange={(e) => setExcuseComment(e.target.value)} fullWidth />
                <Button type="submit" variant="contained" size="large" disabled={loading}>
                  {loading ? 'Zapisywanie...' : 'Zapisz'}
                </Button>
              </Stack>
            </Paper>
          </Box>
        )}
        <Box sx={{ minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
          <EntityTable
            title="Lista frekwencji"
            rows={visibleAttendance}
            columns={[
              {
                key: 'sessionId', label: 'Lekcja',
                render: (row) => bootstrap.classSessions.find((s) => s.id === row.sessionId)?.topic ?? row.sessionId,
              },
              {
                key: 'studentId', label: 'Uczeń',
                render: (row) => {
                  const sp = studentById.get(row.studentId);
                  const u = sp ? userById.get(sp.userId) : undefined;
                  return u ? `${u.firstName} ${u.lastName}` : row.studentId;
                },
              },
              {
                key: 'status', label: 'Status',
                render: (row) => <Chip label={statusLabels[row.status] ?? row.status}
                  color={statusColors[row.status] ?? 'default'} size="small" />,
              },
              { key: 'excuseComment', label: 'Uwaga', render: (row) => row.excuseComment ?? '—' },
                {
                  key: 'actions',
                  label: 'Akcje',
                  render: (row) => canExcuse(row) ? (
                    <Button size="small" variant="outlined" onClick={() => openExcuseDialog(row.id)}>
                      Usprawiedliw
                    </Button>
                  ) : '—',
                },
            ]}
          />
        </Box>
      </Box>

      <Dialog open={excuseDialogOpen} onClose={() => setExcuseDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={(event) => { void handleExcuseSubmit(event); }}>
          <DialogTitle>Usprawiedliw nieobecność</DialogTitle>
          <DialogContent>
            {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Komentarz"
                value={excuseDialogText}
                onChange={(event) => setExcuseDialogText(event.target.value)}
                multiline
                minRows={3}
                required
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExcuseDialogOpen(false)}>Anuluj</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Zapisywanie...' : 'Usprawiedliw'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Stack>
  );
}
