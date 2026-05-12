import { Box, Button, MenuItem, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { createStudent, deleteStudent, updateStudent } from '../api';
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
  const { loading, error, success, setError, resetFeedback, runAction } = useCrudState();

  const [showAdd, setShowAdd] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);

  const [userId, setUserId] = useState('');
  const [parentId, setParentId] = useState('');
  const [classId, setClassId] = useState('');
  const [studentNumber, setStudentNumber] = useState('');

  function resetForm() {
    setUserId(''); setParentId(''); setClassId(''); setStudentNumber('');
    setShowAdd(false); setEditingStudent(null);
    resetFeedback();
  }

  function openEdit(s: StudentProfile) {
    setUserId(s.userId); setParentId(s.parentId || ''); setClassId(s.classId); setStudentNumber(s.studentNumber);
    setEditingStudent(s);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const req: CreateStudentRequest = { userId, parentId: parentId || undefined, classId, studentNumber };
    await runAction(async () => {
      await createStudent(req, session.token);
      await onRefreshBootstrap(true);
      resetForm();
    }, 'Dodano ucznia.');
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingStudent) return;
    const req: UpdateStudentRequest = { userId, parentId: parentId || undefined, classId, studentNumber };
    await runAction(async () => {
      await updateStudent(editingStudent.id, req, session.token);
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
            { key: 'parentId', label: 'Rodzic', render: (row) => bootstrap.parents.find((p) => p.id === row.parentId)?.phoneNumber ?? row.parentId },
            { key: 'userId', label: 'Użytkownik', render: (row) => { const u = userById.get(row.userId); return u ? `${u.firstName} ${u.lastName}` : row.userId; } },
            { key: 'actions', label: 'Akcje', render: (row) => (
              <ActionButtons onEdit={() => openEdit(row)} onDelete={() => { void handleDelete(row.id); }} />
            )},
          ]} />
        </Box>

        <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>
          <EntityTable title="Ostatnia frekwencja" rows={bootstrap.attendance.slice(0, 10)} columns={[
            { key: 'sessionId', label: 'Lekcja', render: (row) => bootstrap.classSessions.find((s) => s.id === row.sessionId)?.topic ?? row.sessionId },
            { key: 'studentId', label: 'Uczeń', render: (row) => { const sp = bootstrap.students.find((s) => s.id === row.studentId); const u = sp ? userById.get(sp.userId) : undefined; return u ? `${u.firstName} ${u.lastName}` : row.studentId; } },
            { key: 'status', label: 'Status' },
            { key: 'excuseComment', label: 'Uwaga', render: (row) => row.excuseComment ?? 'brak' },
          ]} />
        </Box>
      </Stack>

      <CrudDialog open={showAdd} onClose={resetForm} title="Dodaj ucznia" error={error} loading={loading} onSubmit={(e) => { void handleAdd(e); }}>
        <TextField id="konto_użytkownika_1" name="konto_użytkownika_1" select label="Konto użytkownika" value={userId} onChange={(e) => setUserId(e.target.value)} required fullWidth>
          {bootstrap.users.filter(u => u.roles.includes('STUDENT')).map(u => <MenuItem key={u.id} value={u.id}>{u.firstName} {u.lastName}</MenuItem>)}
        </TextField>
        <TextField id="klasa_2" name="klasa_2" select label="Klasa" value={classId} onChange={(e) => setClassId(e.target.value)} required fullWidth>
          {bootstrap.classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
        </TextField>
        <TextField id="numer_w_dzienniku_3" name="numer_w_dzienniku_3" label="Numer w dzienniku" value={studentNumber} onChange={(e) => setStudentNumber(e.target.value)} required fullWidth />
        <TextField id="rodzic_opcjonalnie_4" name="rodzic_opcjonalnie_4" select label="Rodzic (opcjonalnie)" value={parentId} onChange={(e) => setParentId(e.target.value)} fullWidth>
          <MenuItem value="">Brak powiązanego rodzica</MenuItem>
          {bootstrap.parents.map(p => {
            const u = userById.get(p.userId);
            return <MenuItem key={p.id} value={p.id}>{u ? `${u.firstName} ${u.lastName}` : p.id} ({p.phoneNumber})</MenuItem>;
          })}
        </TextField>
      </CrudDialog>

      <CrudDialog open={!!editingStudent} onClose={resetForm} title="Edytuj ucznia" error={error} loading={loading} onSubmit={(e) => { void handleEdit(e); }}>
        <TextField id="konto_użytkownika_5" name="konto_użytkownika_5" select label="Konto użytkownika" value={userId} onChange={(e) => setUserId(e.target.value)} required fullWidth>
          {bootstrap.users.filter(u => u.roles.includes('STUDENT')).map(u => <MenuItem key={u.id} value={u.id}>{u.firstName} {u.lastName}</MenuItem>)}
        </TextField>
        <TextField id="klasa_6" name="klasa_6" select label="Klasa" value={classId} onChange={(e) => setClassId(e.target.value)} required fullWidth>
          {bootstrap.classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
        </TextField>
        <TextField id="numer_w_dzienniku_7" name="numer_w_dzienniku_7" label="Numer w dzienniku" value={studentNumber} onChange={(e) => setStudentNumber(e.target.value)} required fullWidth />
        <TextField id="rodzic_opcjonalnie_8" name="rodzic_opcjonalnie_8" select label="Rodzic (opcjonalnie)" value={parentId} onChange={(e) => setParentId(e.target.value)} fullWidth>
          <MenuItem value="">Brak powiązanego rodzica</MenuItem>
          {bootstrap.parents.map(p => {
            const u = userById.get(p.userId);
            return <MenuItem key={p.id} value={p.id}>{u ? `${u.firstName} ${u.lastName}` : p.id} ({p.phoneNumber})</MenuItem>;
          })}
        </TextField>
      </CrudDialog>
    </Stack>
  );
}
