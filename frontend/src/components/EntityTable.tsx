import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => ReactNode;
}

interface EntityTableProps<T extends { id?: string }> {
  title: string;
  columns: Column<T>[];
  rows: T[];
  emptyLabel?: string;
  onRowClick?: (row: T) => void;
}

export function EntityTable<T extends { id?: string }>({
  title,
  columns,
  rows,
  emptyLabel = 'Brak danych do wyświetlenia',
  onRowClick,
}: EntityTableProps<T>) {
  return (
    <Paper
      sx={{
        overflow: 'hidden',
        width: '100%',
        minWidth: 0,
        border: '1px solid rgba(17, 100, 102, 0.12)',
      }}
    >
      <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
        <Table sx={{ minWidth: 0 }}>
          <TableHead>
            <TableRow>
              <TableCell colSpan={columns.length} sx={{ borderBottom: 'none', pb: 0 }}>
                <Typography variant="h6">{title}</Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.key} align={column.align ?? 'left'} sx={{ fontWeight: 700 }}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {emptyLabel}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow
                  key={row.id ?? `${title}-${index}`}
                  hover={Boolean(onRowClick)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  sx={onRowClick ? { cursor: 'pointer' } : undefined}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} align={column.align ?? 'left'}>
                      {column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
