import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  Grid, MenuItem, Paper, Stack, TextField, Typography,
} from '@mui/material';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import ClassRoundedIcon from '@mui/icons-material/ClassRounded';
import MarkEmailUnreadRoundedIcon from '@mui/icons-material/MarkEmailUnreadRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import type { BootstrapResponse, Session, SectionKey } from '../types';
import { EntityTable } from '../components/EntityTable';
import { MetricCard } from '../components/MetricCard';
import { GradesSection } from './GradesSection';
import { ScheduleView } from './ScheduleView';
import { AttendanceSection } from './AttendanceSection';
import { ReportsView } from './ReportsView';
import { MessagesSection } from './MessagesSection';
import { createUser, createStudent, createClassEntity } from '../api';
import { useState, type FormEvent } from 'react';

interface DashboardViewProps {
  bootstrap: BootstrapResponse;
  activeSection: SectionKey;
  session: Session;
  onRefreshBootstrap: (preserveSessionOnFailure?: boolean) => Promise<boolean>;
}

function formatTimeLabel(value: string) {
  return value.length <= 5 ? value : new Date(value).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}

function formatDateLabel(value: string) {
  return new Date(value).toLocaleDateString('pl-PL');
}

export function DashboardView({ bootstrap, activeSection, session, onRefreshBootstrap }: DashboardViewProps) {
  const userById = new Map(bootstrap.users.map((user) => [user.id, user]));
  const teacherNameById = new Map(
    bootstrap.teachers.map((teacher) => {
      const user = userById.get(teacher.userId);
      return [teacher.id, user ? `${user.firstName} ${user.lastName}` : teacher.employeeNumber];
    }),
  );
  const classById = new Map(bootstrap.classes.map((schoolClass) => [schoolClass.id, schoolClass]));
  const subjectById = new Map(bootstrap.subjects.map((subject) => [subject.id, subject]));

  // ── CRUD dialogs state ──
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddClass, setShowAddClass] = useState(false);
  const [crudError, setCrudError] = useState<string | null>(null);
  const [crudLoading, setCrudLoading] = useState(false);

  // New user form
  const [nuFirstName, setNuFirstName] = useState('');
  const [nuLastName, setNuLastName] = useState('');
  const [nuEmail, setNuEmail] = useState('');
  const [nuPassword, setNuPassword] = useState('');
  const [nuRole, setNuRole] = useState('STUDENT');

  // New student form
  const [nsUserId, setNsUserId] = useState('');
  const [nsClassId, setNsClassId] = useState('');
  const [nsNumber, setNsNumber] = useState('');

  // New class form
  const [ncName, setNcName] = useState('');
  const [ncTeacherId, setNcTeacherId] = useState('');
  const [ncYear, setNcYear] = useState('2025/2026');

  async function handleAddUser(e: FormEvent) {
    e.preventDefault(); setCrudLoading(true); setCrudError(null);
    try {
      await createUser({ firstName: nuFirstName, lastName: nuLastName, email: nuEmail, password: nuPassword, roles: [nuRole] }, session.token);
      await onRefreshBootstrap(true);
      setShowAddUser(false);
      setNuFirstName(''); setNuLastName(''); setNuEmail(''); setNuPassword('');
    } catch (err) {
      setCrudError(err instanceof Error ? err.message : 'Błąd');
    } finally { setCrudLoading(false); }
  }

  async function handleAddStudent(e: FormEvent) {
    e.preventDefault(); setCrudLoading(true); setCrudError(null);
    try {
      await createStudent({ userId: nsUserId, classId: nsClassId, studentNumber: nsNumber }, session.token);
      await onRefreshBootstrap(true);
      setShowAddStudent(false);
      setNsUserId(''); setNsClassId(''); setNsNumber('');
    } catch (err) {
      setCrudError(err instanceof Error ? err.message : 'Błąd');
    } finally { setCrudLoading(false); }
  }

  async function handleAddClass(e: FormEvent) {
    e.preventDefault(); setCrudLoading(true); setCrudError(null);
    try {
      await createClassEntity({ name: ncName, teacherId: ncTeacherId, schoolYear: ncYear }, session.token);
      await onRefreshBootstrap(true);
      setShowAddClass(false);
      setNcName(''); setNcTeacherId(''); setNcYear('2025/2026');
    } catch (err) {
      setCrudError(err instanceof Error ? err.message : 'Błąd');
    } finally { setCrudLoading(false); }
  }

  const isAdmin = session.roles.includes('ADMIN');
  const isSecretary = session.roles.includes('SECRETARY');

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h3">Pulpit</Typography>
      </Box>

      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard title="Użytkownicy" value={bootstrap.summary.users} icon={<GroupsRoundedIcon color="primary" fontSize="large" />} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard title="Klasy" value={bootstrap.summary.classes} icon={<ClassRoundedIcon color="secondary" fontSize="large" />} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard title="Nieprzeczytane wiadomości" value={bootstrap.summary.unreadMessages} icon={<MarkEmailUnreadRoundedIcon color="info" fontSize="large" />} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard title="Powiadomienia" value={bootstrap.summary.unreadNotifications} icon={<NotificationsActiveRoundedIcon color="success" fontSize="large" />} />
        </Grid>
      </Grid>

      {activeSection === 'dashboard' ? (
        <Grid container spacing={2.5}>
          <Grid item xs={12} lg={6}>
            <Box sx={{
              p: 3, borderRadius: 4, border: '1px solid rgba(17, 100, 102, 0.12)',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,250,242,0.84))',
            }}>
              <Typography variant="h6">Szybki podgląd</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
                <Chip label={`${bootstrap.summary.teachers} nauczyciel`} color="primary" />
                <Chip label={`${bootstrap.summary.students} uczeń`} color="secondary" />
                <Chip label={`${bootstrap.summary.grades} ocen`} variant="outlined" />
                <Chip label={`${bootstrap.summary.attendanceRecords} wpisów frekwencji`} variant="outlined" />
              </Stack>
              <Stack spacing={1.5} sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Najbliższe zajęcia: {bootstrap.classSessions[0] ? `${formatDateLabel(bootstrap.classSessions[0].sessionDate)} - ${bootstrap.classSessions[0].topic}` : 'brak'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ostatnia ocena: {bootstrap.grades[0] ? `${bootstrap.grades[0].decimalValue} z ${subjectById.get(bootstrap.grades[0].subjectId)?.name ?? 'przedmiotu'}` : 'brak'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ostatnia wiadomość: {bootstrap.messages[0]?.title ?? 'brak'}
                </Typography>
              </Stack>
            </Box>
          </Grid>
          <Grid item xs={12} lg={6}>
            <Box sx={{
              p: 3, borderRadius: 4, border: '1px solid rgba(17, 100, 102, 0.12)',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,250,242,0.84))',
            }}>
              <Typography variant="h6">Legenda ról</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
                {bootstrap.roles.map((role) => <Chip key={role.id} label={role.name} />)}
              </Stack>
            </Box>
          </Grid>
        </Grid>
      ) : null}

      {activeSection === 'users' ? (
        <Stack spacing={2}>
          {isAdmin && (
            <Box><Button variant="contained" onClick={() => { setCrudError(null); setShowAddUser(true); }}>Dodaj użytkownika</Button></Box>
          )}
          <EntityTable
            title="Użytkownicy"
            rows={bootstrap.users}
            columns={[
              { key: 'firstName', label: 'Imię' },
              { key: 'lastName', label: 'Nazwisko' },
              { key: 'email', label: 'Email' },
              { key: 'roles', label: 'Role', render: (row) => <Stack direction="row" spacing={0.5} flexWrap="wrap">{row.roles.map((role) => <Chip key={role} label={role} size="small" />)}</Stack> },
              { key: 'status', label: 'Status', render: (row) => <Chip label={row.status} color={row.status === 'ACTIVE' ? 'success' : 'default'} size="small" /> },
            ]}
          />
        </Stack>
      ) : null}

      {activeSection === 'classes' ? (
        <Stack spacing={2.5}>
          {(isAdmin || isSecretary) && (
            <Box><Button variant="contained" onClick={() => { setCrudError(null); setShowAddClass(true); }}>Dodaj klasę</Button></Box>
          )}
          <EntityTable title="Klasy" rows={bootstrap.classes} columns={[
            { key: 'name', label: 'Nazwa' },
            { key: 'schoolYear', label: 'Rok szkolny' },
            { key: 'teacherId', label: 'Wychowawca', render: (row) => teacherNameById.get(row.teacherId) ?? row.teacherId },
          ]} />
          <EntityTable title="Plan lekcji" rows={bootstrap.schedule} columns={[
            { key: 'dayOfWeek', label: 'Dzień' },
            { key: 'startTime', label: 'Start', render: (row) => formatTimeLabel(row.startTime) },
            { key: 'endTime', label: 'Koniec', render: (row) => formatTimeLabel(row.endTime) },
            { key: 'classId', label: 'Klasa', render: (row) => classById.get(row.classId)?.name ?? row.classId },
            { key: 'subjectId', label: 'Przedmiot', render: (row) => subjectById.get(row.subjectId)?.name ?? row.subjectId },
            { key: 'roomNumber', label: 'Sala' },
          ]} />
        </Stack>
      ) : null}

      {activeSection === 'schedule' ? (
        <ScheduleView bootstrap={bootstrap} session={session} />
      ) : null}

      {activeSection === 'grades' ? (
        <GradesSection bootstrap={bootstrap} session={session} onRefreshBootstrap={onRefreshBootstrap} />
      ) : null}

      {activeSection === 'attendance' ? (
        <AttendanceSection bootstrap={bootstrap} session={session} onRefreshBootstrap={onRefreshBootstrap} />
      ) : null}

      {activeSection === 'students' ? (
        <Stack spacing={2.5}>
          {(isAdmin || isSecretary) && (
            <Box><Button variant="contained" onClick={() => { setCrudError(null); setShowAddStudent(true); }}>Dodaj ucznia</Button></Box>
          )}
          <EntityTable title="Uczniowie" rows={bootstrap.students} columns={[
            { key: 'studentNumber', label: 'Numer' },
            { key: 'classId', label: 'Klasa', render: (row) => classById.get(row.classId)?.name ?? row.classId },
            { key: 'parentId', label: 'Rodzic', render: (row) => bootstrap.parents.find((p) => p.id === row.parentId)?.phoneNumber ?? row.parentId },
            { key: 'userId', label: 'Użytkownik', render: (row) => { const u = userById.get(row.userId); return u ? `${u.firstName} ${u.lastName}` : row.userId; } },
          ]} />
          <EntityTable title="Frekwencja" rows={bootstrap.attendance} columns={[
            { key: 'sessionId', label: 'Lekcja', render: (row) => bootstrap.classSessions.find((s) => s.id === row.sessionId)?.topic ?? row.sessionId },
            { key: 'studentId', label: 'Uczeń', render: (row) => { const sp = bootstrap.students.find((s) => s.id === row.studentId); const u = sp ? userById.get(sp.userId) : undefined; return u ? `${u.firstName} ${u.lastName}` : row.studentId; } },
            { key: 'status', label: 'Status' },
            { key: 'excuseComment', label: 'Uwaga', render: (row) => row.excuseComment ?? 'brak' },
          ]} />
        </Stack>
      ) : null}

      {activeSection === 'messages' ? (
        <MessagesSection bootstrap={bootstrap} session={session} onRefreshBootstrap={onRefreshBootstrap} />
      ) : null}

      {activeSection === 'reports' ? (
        <ReportsView session={session} />
      ) : null}

      {/* ── Add User Dialog ── */}
      <Dialog open={showAddUser} onClose={() => setShowAddUser(false)} maxWidth="sm" fullWidth>
        <form onSubmit={(e) => { void handleAddUser(e); }}>
          <DialogTitle>Dodaj użytkownika</DialogTitle>
          <DialogContent>
            {crudError && <Alert severity="error" sx={{ mb: 2 }}>{crudError}</Alert>}
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Imię" value={nuFirstName} onChange={(e) => setNuFirstName(e.target.value)} required fullWidth />
              <TextField label="Nazwisko" value={nuLastName} onChange={(e) => setNuLastName(e.target.value)} required fullWidth />
              <TextField label="Email" type="email" value={nuEmail} onChange={(e) => setNuEmail(e.target.value)} required fullWidth />
              <TextField label="Hasło" type="password" value={nuPassword} onChange={(e) => setNuPassword(e.target.value)} required fullWidth />
              <TextField select label="Rola" value={nuRole} onChange={(e) => setNuRole(e.target.value)} fullWidth>
                {bootstrap.roles.map((r) => <MenuItem key={r.id} value={r.name}>{r.name}</MenuItem>)}
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAddUser(false)}>Anuluj</Button>
            <Button type="submit" variant="contained" disabled={crudLoading}>{crudLoading ? 'Zapisywanie...' : 'Dodaj'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ── Add Student Dialog ── */}
      <Dialog open={showAddStudent} onClose={() => setShowAddStudent(false)} maxWidth="sm" fullWidth>
        <form onSubmit={(e) => { void handleAddStudent(e); }}>
          <DialogTitle>Dodaj ucznia</DialogTitle>
          <DialogContent>
            {crudError && <Alert severity="error" sx={{ mb: 2 }}>{crudError}</Alert>}
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField select label="Użytkownik" value={nsUserId} onChange={(e) => setNsUserId(e.target.value)} required fullWidth>
                {bootstrap.users.filter((u) => u.roles.includes('STUDENT')).map((u) => (
                  <MenuItem key={u.id} value={u.id}>{u.firstName} {u.lastName}</MenuItem>
                ))}
              </TextField>
              <TextField select label="Klasa" value={nsClassId} onChange={(e) => setNsClassId(e.target.value)} required fullWidth>
                {bootstrap.classes.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </TextField>
              <TextField label="Numer ucznia" value={nsNumber} onChange={(e) => setNsNumber(e.target.value)} required fullWidth />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAddStudent(false)}>Anuluj</Button>
            <Button type="submit" variant="contained" disabled={crudLoading}>{crudLoading ? 'Zapisywanie...' : 'Dodaj'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ── Add Class Dialog ── */}
      <Dialog open={showAddClass} onClose={() => setShowAddClass(false)} maxWidth="sm" fullWidth>
        <form onSubmit={(e) => { void handleAddClass(e); }}>
          <DialogTitle>Dodaj klasę</DialogTitle>
          <DialogContent>
            {crudError && <Alert severity="error" sx={{ mb: 2 }}>{crudError}</Alert>}
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Nazwa klasy" value={ncName} onChange={(e) => setNcName(e.target.value)} required fullWidth />
              <TextField select label="Wychowawca" value={ncTeacherId} onChange={(e) => setNcTeacherId(e.target.value)} required fullWidth>
                {bootstrap.users.filter((u) => u.roles.includes('TEACHER')).map((u) => (
                  <MenuItem key={u.id} value={u.id}>{u.firstName} {u.lastName}</MenuItem>
                ))}
              </TextField>
              <TextField label="Rok szkolny" value={ncYear} onChange={(e) => setNcYear(e.target.value)} required fullWidth />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAddClass(false)}>Anuluj</Button>
            <Button type="submit" variant="contained" disabled={crudLoading}>{crudLoading ? 'Zapisywanie...' : 'Dodaj'}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Stack>
  );
}
