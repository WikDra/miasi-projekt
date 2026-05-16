import { Box, Button, Chip, MenuItem, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { createStudent, deleteStudent, reactivateStudent, suspendStudent, updateStudent } from '../api';
import { EntityTable } from '../components/EntityTable';
import { ActionButtons, CrudDialog, PageHeader } from '../components/Shared';
import { useCrudState, useEntityMaps, useRoleChecks } from '../hooks';
import type { BootstrapResponse, CreateStudentRequest, Session, StudentProfile, UpdateStudentRequest } from '../types';

interface StudentsSectionProps {
  bootstrap: BootstrapResponse;
  session: Session;
  onRefreshBootstrap: (preserveSessionOnFailure?: boolean) => Promise<boolean>;
}

export function StudentsSection({ bootstrap, session, onRefreshBootstrap }: StudentsSectionProps) {
  const { isAdmin, isSecretary } = useRoleChecks(session);
  const { userById, classById } = useEntityMaps(bootstrap);
  const { loading, error, resetFeedback, runAction } = useCrudState();

  const [showAdd, setShowAdd] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);

  const [userId, setUserId] = useState('');
  const [parentId, setParentId] = useState('');
  const [classId, setClassId] = useState('');
  const [studentNumber, setStudentNumber] = useState('');

  function resetForm() {
    setUserId('');
    setParentId('');
    setClassId('');
    setStudentNumber('');
    setShowAdd(false);
    setEditingStudent(null);
    resetFeedback();
  }

  function openEdit(student: StudentProfile) {
    setUserId(student.userId);
    setParentId(student.parentId || '');
    setClassId(student.classId);
    setStudentNumber(student.studentNumber);
    setEditingStudent(student);
  }

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    const request: CreateStudentRequest = { userId, parentId: parentId || undefined, classId, studentNumber };
    await runAction(async () => {
      await createStudent(request, session.token);
      await onRefreshBootstrap(true);
      resetForm();
    }, 'Dodano ucznia.');
  }

  async function handleEdit(event: React.FormEvent) {
    event.preventDefault();
    if (!editingStudent) return;
    const request: UpdateStudentRequest = { userId, parentId: parentId || undefined, classId, studentNumber };
    await runAction(async () => {
      await updateStudent(editingStudent.id, request, session.token);
      await onRefreshBootstrap(true);
      resetForm();
    }, 'Zaktualizowano ucznia.');
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Usunąć ten profil ucznia?')) return;
    await runAction(async () => {
      await deleteStudent(id, session.token);
      await onRefreshBootstrap(true);
    });
  }

  async function handleSuspend(student: StudentProfile) {
    const user = userById.get(student.userId);
    const label = user ? `${user.firstName} ${user.lastName}` : student.studentNumber;
    if (!window.confirm(`Zawiesić ucznia ${label}?`)) return;
    await runAction(async () => {
      await suspendStudent(student.id, session.token);
      await onRefreshBootstrap(true);
    }, 'Zawieszono ucznia.');
  }

  async function handleReactivate(student: StudentProfile) {
    const user = userById.get(student.userId);
    const label = user ? `${user.firstName} ${user.lastName}` : student.studentNumber;
    if (!window.confirm(`Przywrócić ucznia ${label}?`)) return;
    await runAction(async () => {
      await reactivateStudent(student.id, session.token);
      await onRefreshBootstrap(true);
    }, 'Przywrócono ucznia.');
  }

  function renderStudentActions(row: StudentProfile) {
    if (!(isAdmin || isSecretary)) {
      return '—';
    }

    const isSuspended = userById.get(row.userId)?.status === 'INACTIVE';
    return (
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <ActionButtons onEdit={() => openEdit(row)} onDelete={() => { void handleDelete(row.id); }} />
        {isSuspended ? (
          <Button size="small" color="success" variant="outlined" onClick={() => { void handleReactivate(row); }}>
            Przywróć
          </Button>
        ) : (
          <Button size="small" color="warning" variant="outlined" onClick={() => { void handleSuspend(row); }}>
            Zawieś
          </Button>
        )}
      </Stack>
    );
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: '100%', overflow: 'hidden' }}>
      <PageHeader title="Uczniowie" />

      <Stack spacing={2.5}>
        {(isAdmin || isSecretary) && (
          <Box><Button variant="contained" onClick={() => { resetForm(); setShowAdd(true); }}>Dodaj ucznia</Button></Box>
        )}

        <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>
          <EntityTable title="Uczniowie" rows={bootstrap.students} columns={[
            { key: 'studentNumber', label: 'Numer' },
            { key: 'classId', label: 'Klasa', render: (row) => classById.get(row.classId)?.name ?? row.classId },
            { key: 'parentId', label: 'Rodzic', render: (row) => bootstrap.parents.find((parent) => parent.id === row.parentId)?.phoneNumber ?? row.parentId },
            { key: 'userId', label: 'Użytkownik', render: (row) => {
              const user = userById.get(row.userId);
              return user ? `${user.firstName} ${user.lastName}` : row.userId;
            } },
            { key: 'status', label: 'Status', render: (row) => {
              const status = userById.get(row.userId)?.status ?? 'UNKNOWN';
              return status === 'INACTIVE'
                ? <Chip label="Nieaktywny" color="warning" size="small" />
                : <Chip label="Aktywny" color="success" size="small" />;
            } },
            { key: 'actions', label: 'Akcje', render: renderStudentActions },
          ]} />
        </Box>

        <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>
          <EntityTable title="Ostatnia frekwencja" rows={bootstrap.attendance.slice(0, 10)} columns={[
            { key: 'sessionId', label: 'Lekcja', render: (row) => bootstrap.classSessions.find((session) => session.id === row.sessionId)?.topic ?? row.sessionId },
            { key: 'studentId', label: 'Uczeń', render: (row) => {
              const student = bootstrap.students.find((item) => item.id === row.studentId);
              const user = student ? userById.get(student.userId) : undefined;
              return user ? `${user.firstName} ${user.lastName}` : row.studentId;
            } },
            { key: 'status', label: 'Status' },
            { key: 'excuseComment', label: 'Uwaga', render: (row) => row.excuseComment ?? 'brak' },
          ]} />
        </Box>
      </Stack>

      <CrudDialog open={showAdd} onClose={resetForm} title="Dodaj ucznia" error={error} loading={loading} onSubmit={(event) => { void handleAdd(event); }}>
        <TextField id="konto_użytkownika_1" name="konto_użytkownika_1" select label="Konto użytkownika" value={userId} onChange={(event) => setUserId(event.target.value)} required fullWidth>
          {bootstrap.users.filter((user) => user.roles.includes('STUDENT')).map((user) => <MenuItem key={user.id} value={user.id}>{user.firstName} {user.lastName}</MenuItem>)}
        </TextField>
        <TextField id="klasa_2" name="klasa_2" select label="Klasa" value={classId} onChange={(event) => setClassId(event.target.value)} required fullWidth>
          {bootstrap.classes.map((schoolClass) => <MenuItem key={schoolClass.id} value={schoolClass.id}>{schoolClass.name}</MenuItem>)}
        </TextField>
        <TextField id="numer_w_dzienniku_3" name="numer_w_dzienniku_3" label="Numer w dzienniku" value={studentNumber} onChange={(event) => setStudentNumber(event.target.value)} required fullWidth />
        <TextField id="rodzic_opcjonalnie_4" name="rodzic_opcjonalnie_4" select label="Rodzic (opcjonalnie)" value={parentId} onChange={(event) => setParentId(event.target.value)} fullWidth>
          <MenuItem value="">Brak powiązanego rodzica</MenuItem>
          {bootstrap.parents.map((parent) => {
            const user = userById.get(parent.userId);
            return <MenuItem key={parent.id} value={parent.id}>{user ? `${user.firstName} ${user.lastName}` : parent.id} ({parent.phoneNumber})</MenuItem>;
          })}
        </TextField>
      </CrudDialog>

      <CrudDialog open={!!editingStudent} onClose={resetForm} title="Edytuj ucznia" error={error} loading={loading} onSubmit={(event) => { void handleEdit(event); }}>
        <TextField id="konto_użytkownika_5" name="konto_użytkownika_5" select label="Konto użytkownika" value={userId} onChange={(event) => setUserId(event.target.value)} required fullWidth>
          {bootstrap.users.filter((user) => user.roles.includes('STUDENT')).map((user) => <MenuItem key={user.id} value={user.id}>{user.firstName} {user.lastName}</MenuItem>)}
        </TextField>
        <TextField id="klasa_6" name="klasa_6" select label="Klasa" value={classId} onChange={(event) => setClassId(event.target.value)} required fullWidth>
          {bootstrap.classes.map((schoolClass) => <MenuItem key={schoolClass.id} value={schoolClass.id}>{schoolClass.name}</MenuItem>)}
        </TextField>
        <TextField id="numer_w_dzienniku_7" name="numer_w_dzienniku_7" label="Numer w dzienniku" value={studentNumber} onChange={(event) => setStudentNumber(event.target.value)} required fullWidth />
        <TextField id="rodzic_opcjonalnie_8" name="rodzic_opcjonalnie_8" select label="Rodzic (opcjonalnie)" value={parentId} onChange={(event) => setParentId(event.target.value)} fullWidth>
          <MenuItem value="">Brak powiązanego rodzica</MenuItem>
          {bootstrap.parents.map((parent) => {
            const user = userById.get(parent.userId);
            return <MenuItem key={parent.id} value={parent.id}>{user ? `${user.firstName} ${user.lastName}` : parent.id} ({parent.phoneNumber})</MenuItem>;
          })}
        </TextField>
      </CrudDialog>
    </Stack>
  );
}
