import { Box, Chip, Grid, Stack, Typography } from '@mui/material';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import ClassRoundedIcon from '@mui/icons-material/ClassRounded';
import MarkEmailUnreadRoundedIcon from '@mui/icons-material/MarkEmailUnreadRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import type { BootstrapResponse } from '../types';
import type { Session } from '../types';
import type { SectionKey } from '../types';
import { EntityTable } from '../components/EntityTable';
import { MetricCard } from '../components/MetricCard';
import { GradesSection } from './GradesSection';

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
            <Box
              sx={{
                p: 3,
                borderRadius: 4,
                border: '1px solid rgba(17, 100, 102, 0.12)',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,250,242,0.84))',
              }}
            >
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
            <Box
              sx={{
                p: 3,
                borderRadius: 4,
                border: '1px solid rgba(17, 100, 102, 0.12)',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,250,242,0.84))',
              }}
            >
              <Typography variant="h6">Legenda ról</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
                {bootstrap.roles.map((role) => (
                  <Chip key={role.id} label={role.name} />
                ))}
              </Stack>
            </Box>
          </Grid>
        </Grid>
      ) : null}

      {activeSection === 'users' ? (
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
      ) : null}

      {activeSection === 'classes' ? (
        <Stack spacing={2.5}>
          <EntityTable
            title="Klasy"
            rows={bootstrap.classes}
            columns={[
              { key: 'name', label: 'Nazwa' },
              { key: 'schoolYear', label: 'Rok szkolny' },
              { key: 'teacherId', label: 'Wychowawca', render: (row) => teacherNameById.get(row.teacherId) ?? row.teacherId },
            ]}
          />

          <EntityTable
            title="Plan lekcji"
            rows={bootstrap.schedule}
            columns={[
              { key: 'dayOfWeek', label: 'Dzień' },
              { key: 'startTime', label: 'Start', render: (row) => formatTimeLabel(row.startTime) },
              { key: 'endTime', label: 'Koniec', render: (row) => formatTimeLabel(row.endTime) },
              { key: 'classId', label: 'Klasa', render: (row) => classById.get(row.classId)?.name ?? row.classId },
              { key: 'subjectId', label: 'Przedmiot', render: (row) => subjectById.get(row.subjectId)?.name ?? row.subjectId },
              { key: 'roomNumber', label: 'Sala' },
            ]}
          />
        </Stack>
      ) : null}

      {activeSection === 'grades' ? (
        <GradesSection
          bootstrap={bootstrap}
          session={session}
          onRefreshBootstrap={onRefreshBootstrap}
        />
      ) : null}

      {activeSection === 'students' ? (
        <Stack spacing={2.5}>
          <EntityTable
            title="Uczniowie"
            rows={bootstrap.students}
            columns={[
              { key: 'studentNumber', label: 'Numer' },
              { key: 'classId', label: 'Klasa', render: (row) => classById.get(row.classId)?.name ?? row.classId },
              { key: 'parentId', label: 'Rodzic', render: (row) => bootstrap.parents.find((parent) => parent.id === row.parentId)?.phoneNumber ?? row.parentId },
              { key: 'userId', label: 'Użytkownik', render: (row) => userById.get(row.userId)?.firstName ?? row.userId },
            ]}
          />

          <EntityTable
            title="Frekwencja"
            rows={bootstrap.attendance}
            columns={[
              { key: 'sessionId', label: 'Lekcja', render: (row) => bootstrap.classSessions.find((session) => session.id === row.sessionId)?.topic ?? row.sessionId },
              { key: 'studentId', label: 'Uczeń', render: (row) => userById.get(bootstrap.students.find((student) => student.id === row.studentId)?.userId ?? '')?.firstName ?? row.studentId },
              { key: 'status', label: 'Status' },
              { key: 'excuseComment', label: 'Uwaga', render: (row) => row.excuseComment ?? 'brak' },
            ]}
          />
        </Stack>
      ) : null}

      {activeSection === 'messages' ? (
        <Stack spacing={2.5}>
          <EntityTable
            title="Wiadomości"
            rows={bootstrap.messages}
            columns={[
              { key: 'title', label: 'Tytuł' },
              { key: 'senderId', label: 'Nadawca', render: (row) => userById.get(row.senderId)?.firstName ?? row.senderId },
              { key: 'recipientId', label: 'Odbiorca', render: (row) => userById.get(row.recipientId)?.firstName ?? row.recipientId },
              { key: 'sentAt', label: 'Wysłano', render: (row) => formatDateLabel(row.sentAt) },
            ]}
          />

          <EntityTable
            title="Powiadomienia"
            rows={bootstrap.notifications}
            columns={[
              { key: 'type', label: 'Typ' },
              { key: 'content', label: 'Treść' },
              { key: 'read', label: 'Przeczytane', render: (row) => <Chip label={row.read ? 'tak' : 'nie'} color={row.read ? 'success' : 'warning'} size="small" /> },
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
      ) : null}

    </Stack>
  );
}
