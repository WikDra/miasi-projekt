import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { createGrade, deleteGrade, updateGrade } from '../api';
import { EntityTable } from '../components/EntityTable';
import type { BootstrapResponse, Session } from '../types';

interface GradesSectionProps {
  bootstrap: BootstrapResponse;
  session: Session;
  onRefreshBootstrap: (preserveSessionOnFailure?: boolean) => Promise<boolean>;
}

interface GradeFormState {
  studentId: string;
  teacherId: string;
  subjectId: string;
  decimalValue: string;
  weight: string;
  type: string;
  comment: string;
}

const gradeTypes = ['SPRAWDZIAN', 'KARTKÓWKA', 'ODPOWIEDŹ', 'PRACA DOMOWA', 'AKTYWNOŚĆ'];

function formatDateLabel(value: string) {
  return new Date(value).toLocaleDateString('pl-PL');
}

function getInitialForm(bootstrap: BootstrapResponse, currentUserId: string): GradeFormState {
  const currentTeacherId = bootstrap.teachers.find((teacher) => teacher.userId === currentUserId)?.id ?? bootstrap.teachers[0]?.id ?? '';
  return {
    studentId: bootstrap.students[0]?.id ?? '',
    teacherId: currentTeacherId,
    subjectId: bootstrap.subjects[0]?.id ?? '',
    decimalValue: '5',
    weight: '1',
    type: gradeTypes[0],
    comment: '',
  };
}

export function GradesSection({ bootstrap, session, onRefreshBootstrap }: GradesSectionProps) {
  const userById = useMemo(() => new Map(bootstrap.users.map((user) => [user.id, user])), [bootstrap.users]);
  const studentById = useMemo(() => new Map(bootstrap.students.map((student) => [student.id, student])), [bootstrap.students]);
  const subjectById = useMemo(() => new Map(bootstrap.subjects.map((subject) => [subject.id, subject])), [bootstrap.subjects]);

  const canManageGrades = session.roles.some((role) => ['TEACHER', 'ADMIN', 'DIRECTOR'].includes(role));

  const visibleGrades = useMemo(() => {
    if (session.roles.some((role) => ['ADMIN', 'DIRECTOR', 'SECRETARY', 'TEACHER'].includes(role))) {
      return bootstrap.grades;
    }
    if (session.roles.includes('STUDENT')) {
      const profile = bootstrap.students.find((student) => student.userId === session.userId);
      return profile ? bootstrap.grades.filter((grade) => grade.studentId === profile.id) : [];
    }
    if (session.roles.includes('PARENT')) {
      const childProfile = bootstrap.students.find((student) =>
        bootstrap.parents.some((parent) => parent.userId === session.userId && parent.id === student.parentId));
      return childProfile ? bootstrap.grades.filter((grade) => grade.studentId === childProfile.id) : [];
    }
    return [];
  }, [bootstrap, session]);

  const [form, setForm] = useState<GradeFormState>(() => getInitialForm(bootstrap, session.userId));
  const [editForm, setEditForm] = useState<GradeFormState>(() => getInitialForm(bootstrap, session.userId));
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setForm(getInitialForm(bootstrap, session.userId));
    setEditForm(getInitialForm(bootstrap, session.userId));
  }, [bootstrap, session.userId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const createdGrade = await createGrade({
        studentId: form.studentId,
        teacherId: form.teacherId,
        subjectId: form.subjectId,
        decimalValue: Number(form.decimalValue),
        weight: Number(form.weight),
        type: form.type,
        comment: form.comment,
      }, session.token);

      const refreshed = await onRefreshBootstrap(true);
      if (refreshed) {
        const student = studentById.get(createdGrade.studentId);
        const studentUser = student ? userById.get(student.userId) : undefined;
        const subject = subjectById.get(createdGrade.subjectId);
        setSuccess(
          `Dodano ocenę ${createdGrade.decimalValue} dla ${studentUser ? `${studentUser.firstName} ${studentUser.lastName}` : 'ucznia'} z ${subject?.name ?? 'przedmiotu'}.`,
        );
        setForm((current) => ({
          ...current,
          decimalValue: '5',
          weight: '1',
          comment: '',
        }));
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Nie udało się zapisać oceny');
    } finally {
      setLoading(false);
    }
  }

  function openEditGrade(grade: (typeof bootstrap.grades)[number]) {
    setEditingGradeId(grade.id);
    setEditForm({
      studentId: grade.studentId,
      teacherId: grade.teacherId,
      subjectId: grade.subjectId,
      decimalValue: grade.decimalValue,
      weight: grade.weight.toString(),
      type: grade.type,
      comment: grade.comment,
    });
    setError(null);
    setSuccess(null);
    setShowEditDialog(true);
  }

  async function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingGradeId) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateGrade(editingGradeId, {
        studentId: editForm.studentId,
        teacherId: editForm.teacherId,
        subjectId: editForm.subjectId,
        decimalValue: Number(editForm.decimalValue),
        weight: Number(editForm.weight),
        type: editForm.type,
        comment: editForm.comment,
      }, session.token);
      await onRefreshBootstrap(true);
      setSuccess('Zaktualizowano ocenę.');
      setShowEditDialog(false);
      setEditingGradeId(null);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Nie udało się zaktualizować oceny');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteGrade(gradeId: string) {
    if (!window.confirm('Usunąć tę ocenę?')) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await deleteGrade(gradeId, session.token);
      await onRefreshBootstrap(true);
      setSuccess('Usunięto ocenę.');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Nie udało się usunąć oceny');
    } finally {
      setLoading(false);
    }
  }

  const gradeColumns = [
    { key: 'decimalValue', label: 'Ocena' },
    { key: 'weight', label: 'Waga', align: 'center' as const },
    { key: 'type', label: 'Typ' },
    {
      key: 'studentId',
      label: 'Uczeń',
      render: (row: (typeof bootstrap.grades)[number]) => {
        const student = studentById.get(row.studentId);
        const studentUser = student ? userById.get(student.userId) : undefined;
        return studentUser ? `${studentUser.firstName} ${studentUser.lastName}` : row.studentId;
      },
    },
    {
      key: 'subjectId',
      label: 'Przedmiot',
      render: (row: (typeof bootstrap.grades)[number]) => subjectById.get(row.subjectId)?.name ?? row.subjectId,
    },
    { key: 'issuedAt', label: 'Data', render: (row: (typeof bootstrap.grades)[number]) => formatDateLabel(row.issuedAt) },
    { key: 'comment', label: 'Komentarz' },
    ...(canManageGrades ? [{
      key: 'actions',
      label: 'Akcje',
      render: (row: (typeof bootstrap.grades)[number]) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={() => openEditGrade(row)}>
            Edytuj
          </Button>
          <Button size="small" color="error" variant="outlined" onClick={() => { void handleDeleteGrade(row.id); }}>
            Usuń
          </Button>
        </Stack>
      ),
    }] : []),
  ];

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3">Oceny</Typography>
      </Box>

      <Grid container spacing={2.5}>
        {canManageGrades ? (
          <Grid item xs={12} lg={5}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px solid rgba(17, 100, 102, 0.12)',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,250,242,0.86))',
              }}
            >
              <Typography variant="h6">Wystaw nową ocenę</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.2 }}>
                Wybierz ucznia, nauczyciela i przedmiot.
              </Typography>

              {error ? <Alert severity="error" sx={{ mt: 2.5 }}>{error}</Alert> : null}
              {success ? <Alert severity="success" sx={{ mt: 2.5 }}>{success}</Alert> : null}

              <Stack component="form" spacing={2} sx={{ mt: 3 }} onSubmit={(event) => { void handleSubmit(event); }}>
                <TextField
                  select
                  label="Uczeń"
                  value={form.studentId}
                  onChange={(event) => setForm((current) => ({ ...current, studentId: event.target.value }))}
                  required
                  fullWidth
                >
                  {bootstrap.students.map((student) => {
                    const user = userById.get(student.userId);
                    return (
                      <MenuItem key={student.id} value={student.id}>
                        {user ? `${user.firstName} ${user.lastName}` : student.studentNumber} ({student.studentNumber})
                      </MenuItem>
                    );
                  })}
                </TextField>

                <TextField
                  select
                  label="Nauczyciel"
                  value={form.teacherId}
                  onChange={(event) => setForm((current) => ({ ...current, teacherId: event.target.value }))}
                  required
                  fullWidth
                >
                  {bootstrap.teachers.map((teacher) => {
                    const user = userById.get(teacher.userId);
                    return (
                      <MenuItem key={teacher.id} value={teacher.id}>
                        {user ? `${user.firstName} ${user.lastName}` : teacher.employeeNumber} - {teacher.specialization}
                      </MenuItem>
                    );
                  })}
                </TextField>

                <TextField
                  select
                  label="Przedmiot"
                  value={form.subjectId}
                  onChange={(event) => setForm((current) => ({ ...current, subjectId: event.target.value }))}
                  required
                  fullWidth
                >
                  {bootstrap.subjects.map((subject) => (
                    <MenuItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </MenuItem>
                  ))}
                </TextField>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Ocena"
                      type="number"
                      inputProps={{ step: 0.5, min: 1, max: 6 }}
                      value={form.decimalValue}
                      onChange={(event) => setForm((current) => ({ ...current, decimalValue: event.target.value }))}
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Waga"
                      type="number"
                      inputProps={{ min: 1, max: 10 }}
                      value={form.weight}
                      onChange={(event) => setForm((current) => ({ ...current, weight: event.target.value }))}
                      required
                      fullWidth
                    />
                  </Grid>
                </Grid>

                <TextField
                  select
                  label="Typ oceny"
                  value={form.type}
                  onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
                  required
                  fullWidth
                >
                  {gradeTypes.map((gradeType) => (
                    <MenuItem key={gradeType} value={gradeType}>{gradeType}</MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Komentarz"
                  value={form.comment}
                  onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))}
                  multiline
                  minRows={3}
                  fullWidth
                />

                <Button type="submit" variant="contained" size="large" disabled={loading}>
                  {loading ? 'Zapisywanie...' : 'Zapisz ocenę'}
                </Button>
              </Stack>
            </Paper>
          </Grid>
        ) : null}

        <Grid item xs={12} lg={canManageGrades ? 7 : 12}>
          <Stack spacing={2.5}>
            <EntityTable
              title="Lista ocen"
              rows={visibleGrades}
              columns={gradeColumns}
            />
          </Stack>
        </Grid>
      </Grid>

      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={(event) => { void handleEditSubmit(event); }}>
          <DialogTitle>Edytuj ocenę</DialogTitle>
          <DialogContent>
            {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                select
                label="Uczeń"
                value={editForm.studentId}
                onChange={(event) => setEditForm((current) => ({ ...current, studentId: event.target.value }))}
                required
                fullWidth
              >
                {bootstrap.students.map((student) => {
                  const user = userById.get(student.userId);
                  return (
                    <MenuItem key={student.id} value={student.id}>
                      {user ? `${user.firstName} ${user.lastName}` : student.studentNumber} ({student.studentNumber})
                    </MenuItem>
                  );
                })}
              </TextField>

              <TextField
                select
                label="Nauczyciel"
                value={editForm.teacherId}
                onChange={(event) => setEditForm((current) => ({ ...current, teacherId: event.target.value }))}
                required
                fullWidth
              >
                {bootstrap.teachers.map((teacher) => {
                  const user = userById.get(teacher.userId);
                  return (
                    <MenuItem key={teacher.id} value={teacher.id}>
                      {user ? `${user.firstName} ${user.lastName}` : teacher.employeeNumber} - {teacher.specialization}
                    </MenuItem>
                  );
                })}
              </TextField>

              <TextField
                select
                label="Przedmiot"
                value={editForm.subjectId}
                onChange={(event) => setEditForm((current) => ({ ...current, subjectId: event.target.value }))}
                required
                fullWidth
              >
                {bootstrap.subjects.map((subject) => (
                  <MenuItem key={subject.id} value={subject.id}>{subject.name}</MenuItem>
                ))}
              </TextField>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Ocena"
                    type="number"
                    inputProps={{ step: 0.5, min: 1, max: 6 }}
                    value={editForm.decimalValue}
                    onChange={(event) => setEditForm((current) => ({ ...current, decimalValue: event.target.value }))}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Waga"
                    type="number"
                    inputProps={{ min: 1, max: 10 }}
                    value={editForm.weight}
                    onChange={(event) => setEditForm((current) => ({ ...current, weight: event.target.value }))}
                    required
                    fullWidth
                  />
                </Grid>
              </Grid>

              <TextField
                select
                label="Typ oceny"
                value={editForm.type}
                onChange={(event) => setEditForm((current) => ({ ...current, type: event.target.value }))}
                required
                fullWidth
              >
                {gradeTypes.map((gradeType) => (
                  <MenuItem key={gradeType} value={gradeType}>{gradeType}</MenuItem>
                ))}
              </TextField>

              <TextField
                label="Komentarz"
                value={editForm.comment}
                onChange={(event) => setEditForm((current) => ({ ...current, comment: event.target.value }))}
                multiline
                minRows={3}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowEditDialog(false)}>Anuluj</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Stack>
  );
}