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
      sx={{
        height: '100%',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,250,242,0.88))',
        border: '1px solid rgba(17, 100, 102, 0.12)',
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
