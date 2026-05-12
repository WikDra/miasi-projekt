import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { fetchAttendanceReport, fetchGradesReport } from '../api';
import { EntityTable } from '../components/EntityTable';
import type { AttendanceReportEntry, GradeReportEntry, Session } from '../types';

interface ReportsViewProps {
  session: Session;
}

export function ReportsView({ session }: ReportsViewProps) {
  const [attendanceReport, setAttendanceReport] = useState<AttendanceReportEntry[]>([]);
  const [gradesReport, setGradesReport] = useState<GradeReportEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [a, g] = await Promise.all([
          fetchAttendanceReport(session.token),
          fetchGradesReport(session.token),
        ]);
        setAttendanceReport(a);
        setGradesReport(g);
      } catch {
        // silently ignore if reports fail (e.g. no data)
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [session.token]);

  if (loading) {
    return (
      <Stack spacing={3}>
        <Typography variant="h3">Raporty</Typography>
        <Typography color="text.secondary">Ładowanie raportów...</Typography>
      </Stack>
    );
  }

  const avgAttendance = attendanceReport.length > 0
    ? (attendanceReport.reduce((sum, r) => sum + r.attendancePercentage, 0) / attendanceReport.length).toFixed(1)
    : '—';
  const avgGrade = gradesReport.length > 0
    ? (gradesReport.reduce((sum, r) => sum + r.average, 0) / gradesReport.length).toFixed(2)
    : '—';

  return (
    <Stack spacing={3}>
      <Box><Typography variant="h3">Raporty</Typography></Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        <Card elevation={0} sx={{
          border: '1px solid',
          borderColor: 'divider',
          background: (theme) => theme.palette.mode === 'light' ? 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,250,242,0.88))' : 'linear-gradient(180deg, rgba(30,30,30,0.96), rgba(18,18,18,0.88))',
        }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 2 }}>
              Średnia frekwencja
            </Typography>
            <Typography variant="h3">{avgAttendance}%</Typography>
          </CardContent>
        </Card>
        <Card elevation={0} sx={{
          border: '1px solid',
          borderColor: 'divider',
          background: (theme) => theme.palette.mode === 'light' ? 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,250,242,0.88))' : 'linear-gradient(180deg, rgba(30,30,30,0.96), rgba(18,18,18,0.88))',
        }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 2 }}>
              Średnia ocen
            </Typography>
            <Typography variant="h3">{avgGrade}</Typography>
          </CardContent>
        </Card>
      </Box>

      <EntityTable
        title="Raport frekwencji"
        rows={attendanceReport.map((r, i) => ({ ...r, id: `att-${i}` }))}
        columns={[
          { key: 'studentName', label: 'Uczeń' },
          { key: 'className', label: 'Klasa' },
          { key: 'totalSessions', label: 'Sesje', align: 'center' },
          { key: 'present', label: 'Obecny', align: 'center' },
          { key: 'absent', label: 'Nieobecny', align: 'center' },
          { key: 'late', label: 'Spóźniony', align: 'center' },
          { key: 'excused', label: 'Uspr.', align: 'center' },
          { key: 'attendancePercentage', label: 'Frekwencja %', align: 'center',
            render: (row) => `${row.attendancePercentage}%` },
        ]}
      />

      <EntityTable
        title="Raport średnich ocen"
        rows={gradesReport.map((r, i) => ({ ...r, id: `gr-${i}` }))}
        columns={[
          { key: 'studentName', label: 'Uczeń' },
          { key: 'className', label: 'Klasa' },
          { key: 'subjectName', label: 'Przedmiot' },
          { key: 'average', label: 'Średnia', align: 'center', render: (row) => row.average.toFixed(2) },
          { key: 'gradeCount', label: 'Liczba ocen', align: 'center' },
        ]}
      />
    </Stack>
  );
}
