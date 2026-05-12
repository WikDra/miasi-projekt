import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import type { FormEvent, ReactNode } from 'react';

interface CrudDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  error: string | null;
  loading: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel?: string;
  children: ReactNode;
}

export function CrudDialog({ open, onClose, title, error, loading, onSubmit, submitLabel = 'Zapisz', children }: CrudDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={onSubmit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
          <Stack spacing={2} sx={{ mt: 1 }}>
            {children}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={onClose} disabled={loading}>
            Anuluj
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Zapisywanie...' : submitLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ActionButtons({ onEdit, onDelete }: ActionButtonsProps) {
  return (
    <Stack direction="row" spacing={1}>
      {onEdit && (
        <Button size="small" variant="outlined" onClick={onEdit}>
          Edytuj
        </Button>
      )}
      {onDelete && (
        <Button size="small" color="error" variant="outlined" onClick={onDelete}>
          Usuń
        </Button>
      )}
    </Stack>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <Stack spacing={1}>
      <Typography variant="h3">{title}</Typography>
      {subtitle && <Typography color="text.secondary">{subtitle}</Typography>}
    </Stack>
  );
}
