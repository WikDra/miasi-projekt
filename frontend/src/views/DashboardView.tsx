import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  Grid, MenuItem, Paper, Stack, TextField, Typography,
} from '@mui/material';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import ClassRoundedIcon from '@mui/icons-material/ClassRounded';
import MarkEmailUnreadRoundedIcon from '@mui/icons-material/MarkEmailUnreadRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import type { BootstrapResponse, Session, SectionKey, User } from '../types';
import { EntityTable } from '../components/EntityTable';
import { MetricCard } from '../components/MetricCard';
import { GradesSection } from './GradesSection';
import { ScheduleView } from './ScheduleView';
import { AttendanceSection } from './AttendanceSection';
import { ReportsView } from './ReportsView';
import { MessagesSection } from './MessagesSection';
import { createUser, createStudent, createClassEntity, updateUser, createSubject, updateSubject, deleteSubject, deleteUser, updateClassEntity, deleteClassEntity, updateStudent, deleteStudent } from '../api';
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
  const [showEditUser, setShowEditUser] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showEditStudent, setShowEditStudent] = useState(false);
  const [showAddClass, setShowAddClass] = useState(false);
  const [showEditClass, setShowEditClass] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showEditSubject, setShowEditSubject] = useState(false);
  const [crudError, setCrudError] = useState<string | null>(null);
  const [crudLoading, setCrudLoading] = useState(false);

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);

  // New user form
  const [nuFirstName, setNuFirstName] = useState('');
  const [nuLastName, setNuLastName] = useState('');
  const [nuEmail, setNuEmail] = useState('');
  const [nuPassword, setNuPassword] = useState('');
  const [nuRole, setNuRole] = useState('STUDENT');

  // Edit user form
  const [euFirstName, setEuFirstName] = useState('');
  const [euLastName, setEuLastName] = useState('');
  const [euEmail, setEuEmail] = useState('');
  const [euStatus, setEuStatus] = useState('ACTIVE');
  const [euRoles, setEuRoles] = useState<string[]>(['STUDENT']);

  // New student form
  const [nsUserId, setNsUserId] = useState('');
  const [nsClassId, setNsClassId] = useState('');
  const [nsNumber, setNsNumber] = useState('');

  // New class form
  const [ncName, setNcName] = useState('');
  const [ncTeacherId, setNcTeacherId] = useState('');
  const [ncYear, setNcYear] = useState('2025/2026');

  // Edit class form
  const [ecName, setEcName] = useState('');
  const [ecTeacherId, setEcTeacherId] = useState('');
  const [ecYear, setEcYear] = useState('2025/2026');

  // Edit student form
  const [esUserId, setEsUserId] = useState('');
  const [esParentId, setEsParentId] = useState('');
  const [esClassId, setEsClassId] = useState('');
  const [esNumber, setEsNumber] = useState('');

  // Subject form
  const [subName, setSubName] = useState('');
  const [subDescription, setSubDescription] = useState('');

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

  function openEditUser(user: User) {
    setCrudError(null);
    setEditingUserId(user.id);
    setEuFirstName(user.firstName);
    setEuLastName(user.lastName);
    setEuEmail(user.email);
    setEuStatus(user.status);
    setEuRoles(user.roles.length > 0 ? user.roles : ['STUDENT']);
    setShowEditUser(true);
  }

  function closeEditUser() {
    setShowEditUser(false);
    setEditingUserId(null);
  }

  async function handleEditUser(e: FormEvent) {
    e.preventDefault();
    if (!editingUserId) {
      return;
    }

    setCrudLoading(true);
    setCrudError(null);
    try {
      await updateUser(editingUserId, {
        firstName: euFirstName,
        lastName: euLastName,
        email: euEmail,
        status: euStatus,
        roles: euRoles,
      }, session.token);
      await onRefreshBootstrap(true);
      closeEditUser();
    } catch (err) {
      setCrudError(err instanceof Error ? err.message : 'Błąd');
    } finally {
      setCrudLoading(false);
    }
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

  function openEditClass(schoolClass: (typeof bootstrap.classes)[number]) {
    setCrudError(null);
    setEditingClassId(schoolClass.id);
    setEcName(schoolClass.name);
    setEcTeacherId(schoolClass.teacherId);
    setEcYear(schoolClass.schoolYear);
    setShowEditClass(true);
  }

  function closeEditClass() {
    setShowEditClass(false);
    setEditingClassId(null);
  }

  async function handleEditClass(e: FormEvent) {
    e.preventDefault();
    if (!editingClassId) {
      return;
    }

    setCrudLoading(true); setCrudError(null);
    try {
      await updateClassEntity(editingClassId, { name: ecName, teacherId: ecTeacherId, schoolYear: ecYear }, session.token);
      await onRefreshBootstrap(true);
      closeEditClass();
    } catch (err) {
      setCrudError(err instanceof Error ? err.message : 'Błąd');
    } finally { setCrudLoading(false); }
  }

  async function handleDeleteClass(classId: string) {
    if (!window.confirm('Usunąć tę klasę?')) {
      return;
    }

    setCrudLoading(true);
    setCrudError(null);
    try {
      await deleteClassEntity(classId, session.token);
      await onRefreshBootstrap(true);
    } catch (err) {
      setCrudError(err instanceof Error ? err.message : 'Błąd');
    } finally {
      setCrudLoading(false);
    }
  }

  function openEditStudent(student: (typeof bootstrap.students)[number]) {
    setCrudError(null);
    setEditingStudentId(student.id);
    setEsUserId(student.userId);
    setEsParentId(student.parentId ?? '');
    setEsClassId(student.classId);
    setEsNumber(student.studentNumber);
    setShowEditStudent(true);
  }

  function closeEditStudent() {
    setShowEditStudent(false);
    setEditingStudentId(null);
  }

  async function handleEditStudent(e: FormEvent) {
    e.preventDefault();
    if (!editingStudentId) {
      return;
    }

    setCrudLoading(true); setCrudError(null);
    try {
      await updateStudent(editingStudentId, {
        userId: esUserId,
        parentId: esParentId || undefined,
        classId: esClassId,
        studentNumber: esNumber,
      }, session.token);
      await onRefreshBootstrap(true);
      closeEditStudent();
    } catch (err) {
      setCrudError(err instanceof Error ? err.message : 'Błąd');
    } finally { setCrudLoading(false); }
  }

  async function handleDeleteStudent(studentId: string) {
    if (!window.confirm('Usunąć tego ucznia?')) {
      return;
    }

    setCrudLoading(true);
    setCrudError(null);
    try {
      await deleteStudent(studentId, session.token);
      await onRefreshBootstrap(true);
    } catch (err) {
      setCrudError(err instanceof Error ? err.message : 'Błąd');
    } finally {
      setCrudLoading(false);
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!window.confirm('Usunąć tego użytkownika?')) {
      return;
    }

    setCrudLoading(true);
    setCrudError(null);
    try {
      await deleteUser(userId, session.token);
      await onRefreshBootstrap(true);
    } catch (err) {
      setCrudError(err instanceof Error ? err.message : 'Błąd');
    } finally {
      setCrudLoading(false);
    }
  }

  function openEditSubject(subject: (typeof bootstrap.subjects)[number]) {
    setCrudError(null);
    setEditingSubjectId(subject.id);
    setSubName(subject.name);
    setSubDescription(subject.description);
    setShowEditSubject(true);
  }

  function resetSubjectForm() {
    setSubName('');
    setSubDescription('');
    setEditingSubjectId(null);
  }

  async function handleAddSubject(e: FormEvent) {
    e.preventDefault(); setCrudLoading(true); setCrudError(null);
    try {
      await createSubject({ name: subName, description: subDescription }, session.token);
      await onRefreshBootstrap(true);
      setShowAddSubject(false);
      resetSubjectForm();
    } catch (err) {
      setCrudError(err instanceof Error ? err.message : 'Błąd');
    } finally { setCrudLoading(false); }
  }

  async function handleEditSubject(e: FormEvent) {
    e.preventDefault();
    if (!editingSubjectId) {
      return;
    }

    setCrudLoading(true); setCrudError(null);
    try {
      await updateSubject(editingSubjectId, { name: subName, description: subDescription }, session.token);
      await onRefreshBootstrap(true);
      setShowEditSubject(false);
      resetSubjectForm();
    } catch (err) {
      setCrudError(err instanceof Error ? err.message : 'Błąd');
    } finally { setCrudLoading(false); }
  }

  async function handleDeleteSubject(subjectId: string) {
    if (!window.confirm('Usunąć ten przedmiot?')) {
      return;
    }
    setCrudLoading(true); setCrudError(null);
    try {
      await deleteSubject(subjectId, session.token);
      await onRefreshBootstrap(true);
    } catch (err) {
      setCrudError(err instanceof Error ? err.message : 'Błąd');
    } finally { setCrudLoading(false); }
  }

  const isAdmin = session.roles.includes('ADMIN');
  const isSecretary = session.roles.includes('SECRETARY');
  const canManageSubjects = session.roles.some((role) => ['ADMIN', 'DIRECTOR', 'SECRETARY'].includes(role));

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h3">Pulpit</Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
          gap: 2.5,
        }}
      >
        <Box>
          <MetricCard title="Użytkownicy" value={bootstrap.summary.users} icon={<GroupsRoundedIcon color="primary" fontSize="large" />} />
        </Box>
        <Box>
          <MetricCard title="Klasy" value={bootstrap.summary.classes} icon={<ClassRoundedIcon color="secondary" fontSize="large" />} />
        </Box>
        <Box>
          <MetricCard title="Nieprzeczytane wiadomości" value={bootstrap.summary.unreadMessages} icon={<MarkEmailUnreadRoundedIcon color="info" fontSize="large" />} />
        </Box>
        <Box>
          <MetricCard title="Powiadomienia" value={bootstrap.summary.unreadNotifications} icon={<NotificationsActiveRoundedIcon color="success" fontSize="large" />} />
        </Box>
      </Box>

      {activeSection === 'dashboard' ? (
        <Grid container spacing={2.5}>
          <Grid item xs={12} lg={6} sx={{ minWidth: 0 }}>
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
          <Grid item xs={12} lg={6} sx={{ minWidth: 0 }}>
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
              { key: 'actions', label: 'Akcje', render: (row) => (
                <Stack direction="row" spacing={1}>
                  <Button size="small" variant="outlined" onClick={() => openEditUser(row)}>
                    Edytuj
                  </Button>
                  {isAdmin ? (
                    <Button size="small" color="error" variant="outlined" onClick={() => { void handleDeleteUser(row.id); }}>
                      Usuń
                    </Button>
                  ) : null}
                </Stack>
              ) },
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
            {
              key: 'actions',
              label: 'Akcje',
              render: (row) => (
                <Stack direction="row" spacing={1}>
                  <Button size="small" variant="outlined" onClick={() => openEditClass(row)}>
                    Edytuj
                  </Button>
                  <Button size="small" color="error" variant="outlined" onClick={() => { void handleDeleteClass(row.id); }}>
                    Usuń
                  </Button>
                </Stack>
              ),
            },
          ]} />
          <EntityTable title="Plan lekcji" rows={bootstrap.lessons} columns={[
            { key: 'dayOfWeek', label: 'Dzień' },
            { key: 'startTime', label: 'Start', render: (row) => formatTimeLabel(row.startTime) },
            { key: 'endTime', label: 'Koniec', render: (row) => formatTimeLabel(row.endTime) },
            { key: 'classId', label: 'Klasa', render: (row) => classById.get(row.classId)?.name ?? row.classId },
            { key: 'subjectId', label: 'Przedmiot', render: (row) => subjectById.get(row.subjectId)?.name ?? row.subjectId },
            { key: 'roomNumber', label: 'Sala' },
          ]} />
          {canManageSubjects ? (
            <Stack spacing={2.5}>
              <Box>
                <Button variant="contained" onClick={() => { setCrudError(null); setShowAddSubject(true); }}>Dodaj przedmiot</Button>
              </Box>
              <EntityTable
                title="Przedmioty"
                rows={bootstrap.subjects}
                columns={[
                  { key: 'name', label: 'Nazwa' },
                  { key: 'description', label: 'Opis' },
                  {
                    key: 'actions',
                    label: 'Akcje',
                    render: (row) => (
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="outlined" onClick={() => openEditSubject(row)}>
                          Edytuj
                        </Button>
                        <Button size="small" color="error" variant="outlined" onClick={() => { void handleDeleteSubject(row.id); }}>
                          Usuń
                        </Button>
                      </Stack>
                    ),
                  },
                ]}
              />
            </Stack>
          ) : null}
        </Stack>
      ) : null}

      {activeSection === 'schedule' ? (
        <ScheduleView bootstrap={bootstrap} session={session} onRefreshBootstrap={onRefreshBootstrap} />
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
            {
              key: 'actions',
              label: 'Akcje',
              render: (row) => (
                <Stack direction="row" spacing={1}>
                  <Button size="small" variant="outlined" onClick={() => openEditStudent(row)}>
                    Edytuj
                  </Button>
                  <Button size="small" color="error" variant="outlined" onClick={() => { void handleDeleteStudent(row.id); }}>
                    Usuń
                  </Button>
                </Stack>
              ),
            },
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

      {/* ── Edit User Dialog ── */}
      <Dialog open={showEditUser} onClose={closeEditUser} maxWidth="sm" fullWidth>
        <form onSubmit={(e) => { void handleEditUser(e); }}>
          <DialogTitle>Edytuj użytkownika</DialogTitle>
          <DialogContent>
            {crudError && <Alert severity="error" sx={{ mb: 2 }}>{crudError}</Alert>}
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Imię" value={euFirstName} onChange={(e) => setEuFirstName(e.target.value)} required fullWidth />
              <TextField label="Nazwisko" value={euLastName} onChange={(e) => setEuLastName(e.target.value)} required fullWidth />
              <TextField label="Email" type="email" value={euEmail} onChange={(e) => setEuEmail(e.target.value)} required fullWidth />
              <TextField label="Status" value={euStatus} onChange={(e) => setEuStatus(e.target.value)} required fullWidth />
              <TextField
                select
                label="Role"
                value={euRoles}
                onChange={(e) => {
                  const value = e.target.value;
                  setEuRoles(typeof value === 'string' ? value.split(',') : value);
                }}
                fullWidth
                SelectProps={{
                  multiple: true,
                  renderValue: (selected) => (selected as string[]).join(', '),
                }}
              >
                {bootstrap.roles.map((r) => (
                  <MenuItem key={r.id} value={r.name}>
                    {r.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeEditUser}>Anuluj</Button>
            <Button type="submit" variant="contained" disabled={crudLoading || !editingUserId}>
              {crudLoading ? 'Zapisywanie...' : 'Zapisz'}
            </Button>
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

      {/* ── Edit Class Dialog ── */}
      <Dialog open={showEditClass} onClose={closeEditClass} maxWidth="sm" fullWidth>
        <form onSubmit={(e) => { void handleEditClass(e); }}>
          <DialogTitle>Edytuj klasę</DialogTitle>
          <DialogContent>
            {crudError && <Alert severity="error" sx={{ mb: 2 }}>{crudError}</Alert>}
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Nazwa klasy" value={ecName} onChange={(e) => setEcName(e.target.value)} required fullWidth />
              <TextField select label="Wychowawca" value={ecTeacherId} onChange={(e) => setEcTeacherId(e.target.value)} required fullWidth>
                {bootstrap.users.filter((u) => u.roles.includes('TEACHER')).map((u) => (
                  <MenuItem key={u.id} value={u.id}>{u.firstName} {u.lastName}</MenuItem>
                ))}
              </TextField>
              <TextField label="Rok szkolny" value={ecYear} onChange={(e) => setEcYear(e.target.value)} required fullWidth />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeEditClass}>Anuluj</Button>
            <Button type="submit" variant="contained" disabled={crudLoading || !editingClassId}>{crudLoading ? 'Zapisywanie...' : 'Zapisz'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ── Edit Student Dialog ── */}
      <Dialog open={showEditStudent} onClose={closeEditStudent} maxWidth="sm" fullWidth>
        <form onSubmit={(e) => { void handleEditStudent(e); }}>
          <DialogTitle>Edytuj ucznia</DialogTitle>
          <DialogContent>
            {crudError && <Alert severity="error" sx={{ mb: 2 }}>{crudError}</Alert>}
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField select label="Użytkownik" value={esUserId} onChange={(e) => setEsUserId(e.target.value)} required fullWidth>
                {bootstrap.users.filter((u) => u.roles.includes('STUDENT')).map((u) => (
                  <MenuItem key={u.id} value={u.id}>{u.firstName} {u.lastName}</MenuItem>
                ))}
              </TextField>
              <TextField select label="Rodzic" value={esParentId} onChange={(e) => setEsParentId(e.target.value)} fullWidth>
                <MenuItem value="">Brak</MenuItem>
                {bootstrap.parents.map((parent) => {
                  const parentUser = userById.get(parent.userId);
                  return (
                    <MenuItem key={parent.id} value={parent.id}>
                      {parentUser ? `${parentUser.firstName} ${parentUser.lastName}` : parent.phoneNumber}
                    </MenuItem>
                  );
                })}
              </TextField>
              <TextField select label="Klasa" value={esClassId} onChange={(e) => setEsClassId(e.target.value)} required fullWidth>
                {bootstrap.classes.map((schoolClass) => (
                  <MenuItem key={schoolClass.id} value={schoolClass.id}>{schoolClass.name}</MenuItem>
                ))}
              </TextField>
              <TextField label="Numer ucznia" value={esNumber} onChange={(e) => setEsNumber(e.target.value)} required fullWidth />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeEditStudent}>Anuluj</Button>
            <Button type="submit" variant="contained" disabled={crudLoading || !editingStudentId}>{crudLoading ? 'Zapisywanie...' : 'Zapisz'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ── Add Subject Dialog ── */}
      <Dialog open={showAddSubject} onClose={() => setShowAddSubject(false)} maxWidth="sm" fullWidth>
        <form onSubmit={(e) => { void handleAddSubject(e); }}>
          <DialogTitle>Dodaj przedmiot</DialogTitle>
          <DialogContent>
            {crudError && <Alert severity="error" sx={{ mb: 2 }}>{crudError}</Alert>}
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Nazwa" value={subName} onChange={(e) => setSubName(e.target.value)} required fullWidth />
              <TextField label="Opis" value={subDescription} onChange={(e) => setSubDescription(e.target.value)} required fullWidth multiline minRows={3} />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAddSubject(false)}>Anuluj</Button>
            <Button type="submit" variant="contained" disabled={crudLoading}>{crudLoading ? 'Zapisywanie...' : 'Dodaj'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ── Edit Subject Dialog ── */}
      <Dialog open={showEditSubject} onClose={() => setShowEditSubject(false)} maxWidth="sm" fullWidth>
        <form onSubmit={(e) => { void handleEditSubject(e); }}>
          <DialogTitle>Edytuj przedmiot</DialogTitle>
          <DialogContent>
            {crudError && <Alert severity="error" sx={{ mb: 2 }}>{crudError}</Alert>}
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Nazwa" value={subName} onChange={(e) => setSubName(e.target.value)} required fullWidth />
              <TextField label="Opis" value={subDescription} onChange={(e) => setSubDescription(e.target.value)} required fullWidth multiline minRows={3} />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowEditSubject(false)}>Anuluj</Button>
            <Button type="submit" variant="contained" disabled={crudLoading || !editingSubjectId}>{crudLoading ? 'Zapisywanie...' : 'Zapisz'}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Stack>
  );
}
