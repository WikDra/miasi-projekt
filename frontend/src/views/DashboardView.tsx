import { Box, Stack } from '@mui/material';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import ClassRoundedIcon from '@mui/icons-material/ClassRounded';
import MarkEmailUnreadRoundedIcon from '@mui/icons-material/MarkEmailUnreadRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';

import { MetricCard } from '../components/MetricCard';
import type { BootstrapResponse, SectionKey, Session } from '../types';

import { ScheduleView } from './ScheduleView';
import { GradesSection } from './GradesSection';
import { AttendanceSection } from './AttendanceSection';
import { MessagesSection } from './MessagesSection';
import { ReportsView } from './ReportsView';
import { UsersSection } from './UsersSection';
import { ClassesSection } from './ClassesSection';
import { StudentsSection } from './StudentsSection';
import { PageHeader } from '../components/Shared';

interface DashboardViewProps {
  bootstrap: BootstrapResponse;
  session: Session;
  activeSection: SectionKey;
  onRefreshBootstrap: (preserveSessionOnFailure?: boolean) => Promise<boolean>;
}

export function DashboardView({ bootstrap, session, activeSection, onRefreshBootstrap }: DashboardViewProps) {
  return (
    <Stack spacing={4} sx={{ maxWidth: '100%', overflow: 'hidden' }}>
      {activeSection === 'dashboard' ? (
        <Stack spacing={4}>
          <PageHeader title="Pulpit" />
          
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
              gap: 2.5,
            }}
          >
            <MetricCard title="Użytkownicy" value={bootstrap.summary.users} icon={<GroupsRoundedIcon color="primary" fontSize="large" />} />
            <MetricCard title="Klasy" value={bootstrap.summary.classes} icon={<ClassRoundedIcon color="secondary" fontSize="large" />} />
            <MetricCard title="Nieprzeczytane wiadomości" value={bootstrap.summary.unreadMessages} icon={<MarkEmailUnreadRoundedIcon color="info" fontSize="large" />} />
            <MetricCard title="Powiadomienia" value={bootstrap.summary.unreadNotifications} icon={<NotificationsActiveRoundedIcon color="success" fontSize="large" />} />
          </Box>
        </Stack>
      ) : null}

      {activeSection === 'users' ? <UsersSection bootstrap={bootstrap} session={session} onRefreshBootstrap={onRefreshBootstrap} /> : null}
      {activeSection === 'classes' ? <ClassesSection bootstrap={bootstrap} session={session} onRefreshBootstrap={onRefreshBootstrap} /> : null}
      {activeSection === 'students' ? <StudentsSection bootstrap={bootstrap} session={session} onRefreshBootstrap={onRefreshBootstrap} /> : null}

      {activeSection === 'schedule' ? <ScheduleView bootstrap={bootstrap} session={session} onRefreshBootstrap={onRefreshBootstrap} /> : null}
      {activeSection === 'grades' ? <GradesSection bootstrap={bootstrap} session={session} onRefreshBootstrap={onRefreshBootstrap} /> : null}
      {activeSection === 'attendance' ? <AttendanceSection bootstrap={bootstrap} session={session} onRefreshBootstrap={onRefreshBootstrap} /> : null}
      {activeSection === 'messages' ? <MessagesSection bootstrap={bootstrap} session={session} onRefreshBootstrap={onRefreshBootstrap} /> : null}
      {activeSection === 'reports' ? <ReportsView session={session} /> : null}
    </Stack>
  );
}
