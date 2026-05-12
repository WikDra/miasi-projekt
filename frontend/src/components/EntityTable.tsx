import {
  Box,
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
        width: '100%',
        minWidth: 0,
        border: '1px solid rgba(17, 100, 102, 0.12)',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ px: 2.5, pt: 2.5, pb: 1 }}>
        <Typography variant="h6">{title}</Typography>
      </Box>

      <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
        <Table sx={{ minWidth: Math.max(columns.length * 100, 500) }}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  align={column.align ?? 'left'}
                  sx={{
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}
                >
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
                    <TableCell
                      key={column.key}
                      align={column.align ?? 'left'}
                      sx={{
                        whiteSpace: 'nowrap',
                      }}
                    >
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
