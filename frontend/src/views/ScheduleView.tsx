import { Box, Chip, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import type { BootstrapResponse, Session } from '../types';

interface ScheduleViewProps {
  bootstrap: BootstrapResponse;
  session: Session;
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
  return value.length <= 5 ? value : new Date(value).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}

const slotColors = [
  'rgba(17,100,102,0.12)',
  'rgba(209,154,102,0.14)',
  'rgba(75,123,236,0.12)',
  'rgba(42,157,143,0.14)',
  'rgba(180,80,80,0.10)',
];

export function ScheduleView({ bootstrap, session }: ScheduleViewProps) {
  const subjectById = useMemo(() => new Map(bootstrap.subjects.map((s) => [s.id, s])), [bootstrap.subjects]);
  const classById = useMemo(() => new Map(bootstrap.classes.map((c) => [c.id, c])), [bootstrap.classes]);
  const teacherById = useMemo(() => {
    const userMap = new Map(bootstrap.users.map((u) => [u.id, u]));
    return new Map(
      bootstrap.teachers.map((t) => {
        const u = userMap.get(t.userId);
        return [t.id, u ? `${u.firstName} ${u.lastName}` : t.employeeNumber];
      }),
    );
  }, [bootstrap.teachers, bootstrap.users]);

  // Determine which classes the user can see
  const visibleClassIds = useMemo(() => {
    if (session.roles.some((r) => ['ADMIN', 'DIRECTOR', 'SECRETARY'].includes(r))) {
      return bootstrap.classes.map((c) => c.id);
    }
    if (session.roles.includes('TEACHER')) {
      const teacherProfile = bootstrap.teachers.find((t) => t.userId === session.userId);
      if (teacherProfile) {
        return bootstrap.schedule
          .filter((s) => s.teacherId === teacherProfile.id)
          .map((s) => s.classId)
          .filter((v, i, a) => a.indexOf(v) === i);
      }
    }
    if (session.roles.includes('STUDENT')) {
      const studentProfile = bootstrap.students.find((s) => s.userId === session.userId);
      return studentProfile ? [studentProfile.classId] : [];
    }
    if (session.roles.includes('PARENT')) {
      const childProfile = bootstrap.students.find((s) => s.parentId === session.userId ||
        bootstrap.parents.some((p) => p.userId === session.userId && p.id === s.parentId));
      return childProfile ? [childProfile.classId] : [];
    }
    return bootstrap.classes.map((c) => c.id);
  }, [bootstrap, session]);

  const [selectedClassId, setSelectedClassId] = useState<string>(visibleClassIds[0] ?? '');

  const filteredSchedule = useMemo(
    () => bootstrap.schedule.filter((s) => s.classId === selectedClassId),
    [bootstrap.schedule, selectedClassId],
  );

  const byDay = useMemo(() => {
    const result: Record<string, typeof filteredSchedule> = {};
    for (const day of dayOrder) result[day] = [];
    for (const entry of filteredSchedule) {
      if (result[entry.dayOfWeek]) result[entry.dayOfWeek].push(entry);
    }
    for (const day of dayOrder) {
      result[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return result;
  }, [filteredSchedule]);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3">Plan lekcji</Typography>
      </Box>

      {visibleClassIds.length > 1 && (
        <TextField
          select label="Klasa" value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          sx={{ maxWidth: 280 }}
        >
          {visibleClassIds.map((id) => (
            <MenuItem key={id} value={id}>{classById.get(id)?.name ?? id}</MenuItem>
          ))}
        </TextField>
      )}

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(5, 1fr)' },
        gap: 2,
      }}>
        {dayOrder.map((day, dayIdx) => (
          <Paper
            key={day} elevation={0}
            sx={{
              p: 2, border: '1px solid rgba(17,100,102,0.12)',
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
                byDay[day].map((entry, idx) => (
                  <Box
                    key={entry.id}
                    sx={{
                      p: 1.5, borderRadius: 2,
                      backgroundColor: slotColors[(dayIdx + idx) % slotColors.length],
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
                      {teacherById.get(entry.teacherId) ?? ''}
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
