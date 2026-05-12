import { Alert, Box, Button, Chip, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { createLesson, deleteLesson, updateLesson } from '../api';
import { EntityTable } from '../components/EntityTable';
import type { BootstrapResponse, Session } from '../types';

interface ScheduleViewProps {
  bootstrap: BootstrapResponse;
  session: Session;
  onRefreshBootstrap: (preserveSessionOnFailure?: boolean) => Promise<boolean>;
}

const dayLabels: Record<string, string> = {
  MONDAY: 'Poniedziałek',
  TUESDAY: 'Wtorek',
  WEDNESDAY: 'Środa',
  THURSDAY: 'Czwartek',
  FRIDAY: 'Piątek',
};

const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

function formatTime(value: string) {
  if (!value) {
    return '';
  }

  const normalized = value.trim();
  const timeMatch = normalized.match(/^(\d{2}):(\d{2})(?::\d{2}(?:\.\d{1,9})?)?$/);
  if (timeMatch) {
    return `${timeMatch[1]}:${timeMatch[2]}`;
  }

  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime())
    ? normalized
    : parsed.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}

const slotColors = [
  'rgba(17,100,102,0.12)',
  'rgba(209,154,102,0.14)',
  'rgba(75,123,236,0.12)',
  'rgba(42,157,143,0.14)',
  'rgba(180,80,80,0.10)',
];

interface LessonFormState {
  classId: string;
  teacherId: string;
  subjectId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  roomNumber: string;
}

export function ScheduleView({ bootstrap, session, onRefreshBootstrap }: ScheduleViewProps) {
  const subjectById = useMemo(() => new Map(bootstrap.subjects.map((subject) => [subject.id, subject])), [bootstrap.subjects]);
  const classById = useMemo(() => new Map(bootstrap.classes.map((schoolClass) => [schoolClass.id, schoolClass])), [bootstrap.classes]);
  const teacherNameById = useMemo(() => {
    const userById = new Map(bootstrap.users.map((user) => [user.id, user]));
    return new Map(
      bootstrap.teachers.map((teacher) => {
        const user = userById.get(teacher.userId);
        return [teacher.id, user ? `${user.firstName} ${user.lastName}` : teacher.employeeNumber];
      }),
    );
  }, [bootstrap.teachers, bootstrap.users]);

  const canManageLessons = session.roles.some((role) => ['ADMIN', 'DIRECTOR', 'SECRETARY', 'TEACHER'].includes(role));
  const defaultTeacherId = bootstrap.teachers.find((teacher) => teacher.userId === session.userId)?.id ?? bootstrap.teachers[0]?.id ?? '';
  const defaultClassId = bootstrap.classes[0]?.id ?? '';

  const [lessonForm, setLessonForm] = useState<LessonFormState>({
    classId: defaultClassId,
    teacherId: defaultTeacherId,
    subjectId: bootstrap.subjects[0]?.id ?? '',
    dayOfWeek: dayOrder[0],
    startTime: '08:00',
    endTime: '08:45',
    roomNumber: '',
  });
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const visibleClassIds = useMemo(() => {
    if (session.roles.some((role) => ['ADMIN', 'DIRECTOR', 'SECRETARY'].includes(role))) {
      return bootstrap.classes.map((schoolClass) => schoolClass.id);
    }
    if (session.roles.includes('TEACHER')) {
      const teacherProfile = bootstrap.teachers.find((teacher) => teacher.userId === session.userId);
      if (teacherProfile) {
        return bootstrap.lessons
          .filter((lesson) => lesson.teacherId === teacherProfile.id)
          .map((lesson) => lesson.classId)
          .filter((value, index, array) => array.indexOf(value) === index);
      }
    }
    if (session.roles.includes('STUDENT')) {
      const studentProfile = bootstrap.students.find((student) => student.userId === session.userId);
      return studentProfile ? [studentProfile.classId] : [];
    }
    if (session.roles.includes('PARENT')) {
      const childProfile = bootstrap.students.find((student) =>
        bootstrap.parents.some((parent) => parent.userId === session.userId && parent.id === student.parentId));
      return childProfile ? [childProfile.classId] : [];
    }
    return bootstrap.classes.map((schoolClass) => schoolClass.id);
  }, [bootstrap, session]);

  const [selectedClassId, setSelectedClassId] = useState<string>(visibleClassIds[0] ?? '');

  useEffect(() => {
    if (visibleClassIds.length > 0 && !visibleClassIds.includes(selectedClassId)) {
      setSelectedClassId(visibleClassIds[0]);
    }
  }, [selectedClassId, visibleClassIds]);

  const filteredSchedule = useMemo(
    () => bootstrap.lessons.filter((lesson) => lesson.classId === selectedClassId),
    [bootstrap.lessons, selectedClassId],
  );

  const visibleLessons = useMemo(
    () => bootstrap.lessons.filter((lesson) => visibleClassIds.includes(lesson.classId)),
    [bootstrap.lessons, visibleClassIds],
  );

  const byDay = useMemo(() => {
    const result: Record<string, typeof filteredSchedule> = {};
    for (const day of dayOrder) {
      result[day] = [];
    }
    for (const entry of filteredSchedule) {
      if (result[entry.dayOfWeek]) {
        result[entry.dayOfWeek].push(entry);
      }
    }
    for (const day of dayOrder) {
      result[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return result;
  }, [filteredSchedule]);

  function resetLessonForm() {
    setEditingLessonId(null);
    setLessonForm({
      classId: defaultClassId,
      teacherId: defaultTeacherId,
      subjectId: bootstrap.subjects[0]?.id ?? '',
      dayOfWeek: dayOrder[0],
      startTime: '08:00',
      endTime: '08:45',
      roomNumber: '',
    });
    setFormError(null);
    setFormSuccess(null);
  }

  function startEditLesson(lesson: (typeof bootstrap.lessons)[number]) {
    setEditingLessonId(lesson.id);
    setLessonForm({
      classId: lesson.classId,
      teacherId: lesson.teacherId,
      subjectId: lesson.subjectId,
      dayOfWeek: lesson.dayOfWeek,
      startTime: lesson.startTime,
      endTime: lesson.endTime,
      roomNumber: lesson.roomNumber,
    });
    setFormError(null);
    setFormSuccess(null);
  }

  async function handleLessonSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      if (editingLessonId) {
        await updateLesson(editingLessonId, lessonForm, session.token);
        setFormSuccess('Zaktualizowano lekcję.');
      } else {
        await createLesson(lessonForm, session.token);
        setFormSuccess('Dodano lekcję.');
      }

      await onRefreshBootstrap(true);
      resetLessonForm();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : 'Nie udało się zapisać lekcji');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDeleteLesson(lessonId: string) {
    if (!window.confirm('Usunąć tę lekcję?')) {
      return;
    }

    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      await deleteLesson(lessonId, session.token);
      if (editingLessonId === lessonId) {
        resetLessonForm();
      }
      setFormSuccess('Usunięto lekcję.');
      await onRefreshBootstrap(true);
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : 'Nie udało się usunąć lekcji');
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: '100%', overflow: 'hidden' }}>
      <Box>
        <Typography variant="h3">Plan lekcji</Typography>
      </Box>

      {canManageLessons ? (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            border: '1px solid rgba(17,100,102,0.12)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,250,242,0.86))',
            overflow: 'hidden',
          }}
        >
          <Typography variant="h6">{editingLessonId ? 'Edytuj lekcję' : 'Dodaj lekcję'}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.2 }}>
            Zarządzaj planem tygodniowym z tego miejsca.
          </Typography>

          {formError ? <Alert severity="error" sx={{ mt: 2.5 }}>{formError}</Alert> : null}
          {formSuccess ? <Alert severity="success" sx={{ mt: 2.5 }}>{formSuccess}</Alert> : null}

          <Stack component="form" spacing={2} sx={{ mt: 3 }} onSubmit={(event) => { void handleLessonSubmit(event); }}>
            <TextField
              select
              label="Klasa"
              value={lessonForm.classId}
              onChange={(event) => setLessonForm((current) => ({ ...current, classId: event.target.value }))}
              required
              fullWidth
            >
              {bootstrap.classes.map((schoolClass) => (
                <MenuItem key={schoolClass.id} value={schoolClass.id}>{schoolClass.name}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Nauczyciel"
              value={lessonForm.teacherId}
              onChange={(event) => setLessonForm((current) => ({ ...current, teacherId: event.target.value }))}
              required
              fullWidth
            >
              {bootstrap.teachers.map((teacher) => {
                const user = bootstrap.users.find((candidate) => candidate.id === teacher.userId);
                return (
                  <MenuItem key={teacher.id} value={teacher.id}>
                    {user ? `${user.firstName} ${user.lastName}` : teacher.employeeNumber}
                  </MenuItem>
                );
              })}
            </TextField>

            <TextField
              select
              label="Przedmiot"
              value={lessonForm.subjectId}
              onChange={(event) => setLessonForm((current) => ({ ...current, subjectId: event.target.value }))}
              required
              fullWidth
            >
              {bootstrap.subjects.map((subject) => (
                <MenuItem key={subject.id} value={subject.id}>{subject.name}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Dzień tygodnia"
              value={lessonForm.dayOfWeek}
              onChange={(event) => setLessonForm((current) => ({ ...current, dayOfWeek: event.target.value }))}
              required
              fullWidth
            >
              {dayOrder.map((day) => (
                <MenuItem key={day} value={day}>{dayLabels[day]}</MenuItem>
              ))}
            </TextField>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
              <TextField
                label="Start"
                type="time"
                value={lessonForm.startTime}
                onChange={(event) => setLessonForm((current) => ({ ...current, startTime: event.target.value }))}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Koniec"
                type="time"
                value={lessonForm.endTime}
                onChange={(event) => setLessonForm((current) => ({ ...current, endTime: event.target.value }))}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <TextField
              label="Sala"
              value={lessonForm.roomNumber}
              onChange={(event) => setLessonForm((current) => ({ ...current, roomNumber: event.target.value }))}
              required
              fullWidth
            />

            <Stack direction="row" spacing={1.5}>
              <Button
                type="submit"
                variant="contained"
                disabled={formLoading || bootstrap.subjects.length === 0 || bootstrap.teachers.length === 0 || bootstrap.classes.length === 0}
              >
                {formLoading ? 'Zapisywanie...' : editingLessonId ? 'Zapisz zmiany' : 'Dodaj lekcję'}
              </Button>
              {editingLessonId ? (
                <Button variant="outlined" onClick={resetLessonForm} disabled={formLoading}>
                  Anuluj edycję
                </Button>
              ) : null}
            </Stack>
          </Stack>

          <Box sx={{ mt: 3, maxWidth: '100%', overflow: 'hidden' }}>
            <EntityTable
              title="Lekcje do zarządzania"
              rows={visibleLessons}
              columns={[
                { key: 'classId', label: 'Klasa', render: (row) => classById.get(row.classId)?.name ?? row.classId },
                { key: 'subjectId', label: 'Przedmiot', render: (row) => subjectById.get(row.subjectId)?.name ?? row.subjectId },
                { key: 'dayOfWeek', label: 'Dzień', render: (row) => dayLabels[row.dayOfWeek] ?? row.dayOfWeek },
                { key: 'startTime', label: 'Start', render: (row) => formatTime(row.startTime) },
                { key: 'endTime', label: 'Koniec', render: (row) => formatTime(row.endTime) },
                { key: 'roomNumber', label: 'Sala' },
                {
                  key: 'actions',
                  label: 'Akcje',
                  render: (row) => (
                    <Stack direction="row" spacing={1}>
                      <Button size="small" variant="outlined" onClick={() => startEditLesson(row)}>
                        Edytuj
                      </Button>
                      <Button size="small" color="error" variant="outlined" onClick={() => { void handleDeleteLesson(row.id); }}>
                        Usuń
                      </Button>
                    </Stack>
                  ),
                },
              ]}
            />
          </Box>
        </Paper>
      ) : null}

      {visibleClassIds.length > 1 ? (
        <TextField
          select
          label="Klasa"
          value={selectedClassId}
          onChange={(event) => setSelectedClassId(event.target.value)}
          sx={{ maxWidth: 280 }}
        >
          {visibleClassIds.map((classId) => (
            <MenuItem key={classId} value={classId}>{classById.get(classId)?.name ?? classId}</MenuItem>
          ))}
        </TextField>
      ) : null}

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(5, 1fr)' },
        gap: 2,
      }}>
        {dayOrder.map((day, dayIndex) => (
          <Paper
            key={day}
            elevation={0}
            sx={{
              p: 2,
              border: '1px solid rgba(17,100,102,0.12)',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,250,242,0.86))',
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
              {dayLabels[day]}
            </Typography>
            <Stack spacing={1}>
              {byDay[day].length === 0 ? (
                <Typography variant="body2" color="text.secondary">Brak lekcji</Typography>
              ) : (
                byDay[day].map((entry, index) => (
                  <Box
                    key={entry.id}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: slotColors[(dayIndex + index) % slotColors.length],
                      border: '1px solid rgba(17,100,102,0.08)',
                    }}
                  >
                    <Typography variant="subtitle2">
                      {subjectById.get(entry.subjectId)?.name ?? '?'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatTime(entry.startTime)} – {formatTime(entry.endTime)}
                    </Typography>
                    <br />
                    <Chip label={entry.roomNumber} size="small" sx={{ mt: 0.5 }} />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      {teacherNameById.get(entry.teacherId) ?? ''}
                    </Typography>
                  </Box>
                ))
              )}
            </Stack>
          </Paper>
        ))}
      </Box>
    </Stack>
  );
}