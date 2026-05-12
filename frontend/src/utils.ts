/** Shared formatting helpers — single source of truth. */

export function formatDateLabel(value: string): string {
  return new Date(value).toLocaleDateString('pl-PL');
}

export function formatTimeLabel(value: string): string {
  if (!value) return '';
  const normalized = value.trim();
  const timeMatch = normalized.match(/^(\d{2}):(\d{2})(?::\d{2}(?:\.\d{1,9})?)?$/);
  if (timeMatch) return `${timeMatch[1]}:${timeMatch[2]}`;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime())
    ? normalized
    : parsed.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}

/** Standard Paper card sx prop for form cards. */
export const formPaperSx = {
  p: { xs: 2, sm: 3 },
  border: '1px solid',
  borderColor: 'divider',
  overflow: 'hidden',
  background: (theme: any) =>
    theme.palette.mode === 'light'
      ? 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,250,242,0.86))'
      : 'linear-gradient(180deg, rgba(30,30,30,0.95), rgba(18,18,18,0.86))',
} as const;
