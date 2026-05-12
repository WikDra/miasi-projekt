import { Card, CardContent, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  helperText?: string;
  icon?: ReactNode;
}

export function MetricCard({ title, value, helperText, icon }: MetricCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        background: (theme) => theme.palette.mode === 'light' ? 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,250,242,0.88))' : 'linear-gradient(180deg, rgba(30,30,30,0.96), rgba(18,18,18,0.88))',
        backdropFilter: 'blur(12px)',
      }}
    >
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Stack spacing={0.5}>
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 2 }}>
              {title}
            </Typography>
            <Typography variant="h4">{value}</Typography>
            {helperText ? (
              <Typography variant="body2" color="text.secondary">
                {helperText}
              </Typography>
            ) : null}
          </Stack>
          {icon}
        </Stack>
      </CardContent>
    </Card>
  );
}
