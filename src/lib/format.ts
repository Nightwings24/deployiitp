/** Date + label formatting helpers shared across pages. */

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Format a partial date string ("YYYY", "YYYY-MM", "YYYY-MM-DD") for display.
 * Year-only -> "2024"; year-month -> "Mar 2024".
 */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '';
  const [y, m] = value.split('-');
  if (!m) return y;
  const monthIndex = Number(m) - 1;
  const month = MONTHS[monthIndex] ?? '';
  return month ? `${month} ${y}` : y;
}

/**
 * Render a position's active range as "Mar 2023 – Jun 2024" or, when current,
 * "Jan 2026 – present". Year-only inputs collapse nicely too.
 */
export function formatRange(
  start: string | null | undefined,
  end: string | null | undefined,
  isCurrent = false,
): string {
  const from = formatDate(start);
  // Standing appointment with no recorded start date.
  if (!from) return isCurrent ? 'Current' : '';
  if (isCurrent || end == null || end === '') {
    return `${from} – present`;
  }
  return `${from} – ${formatDate(end)}`;
}

/** Year that a position/award sorts by (latest activity). */
export function sortYear(
  start: string | null | undefined,
  end: string | null | undefined,
  isCurrent = false,
): number {
  if (isCurrent) return 9999; // current roles sort to the top
  const ref = end && end !== '' ? end : (start ?? '');
  const y = Number(ref.split('-')[0]);
  return Number.isFinite(y) ? y : 0;
}

/** Format an award's year(s): single year, range, or "since YYYY". */
export function formatAwardYears(award: {
  year?: number;
  yearStart?: number;
  yearEnd?: number | null;
}): string {
  if (award.year != null) return String(award.year);
  if (award.yearStart != null) {
    if (award.yearEnd == null) return `${award.yearStart} – present`;
    return award.yearStart === award.yearEnd
      ? String(award.yearStart)
      : `${award.yearStart} – ${award.yearEnd}`;
  }
  return '';
}
