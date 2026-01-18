/**
 * getStartEndForPeriod(7|30|'week'): { start, end } in YYYY-MM-DD. 'week' = Mon–Sun.
 * getStartEndForContextDays(7|30): last N days including today.
 */
function toYYYYMMDD(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function getStartEndForPeriod(period: 7 | 30 | 'week'): { start: string; end: string } {
  const today = new Date();
  const end = new Date(today);
  let start: Date;
  if (period === 'week') {
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    start = new Date(today);
    start.setDate(diff);
    const sun = new Date(start);
    sun.setDate(sun.getDate() + 6);
    return { start: toYYYYMMDD(start), end: toYYYYMMDD(sun) };
  }
  start = new Date(today);
  start.setDate(start.getDate() - (period === 7 ? 6 : 29));
  return { start: toYYYYMMDD(start), end: toYYYYMMDD(end) };
}

export function getStartEndForContextDays(days: 7 | 30): { start: string; end: string } {
  const today = new Date();
  const end = toYYYYMMDD(today);
  const start = new Date(today);
  start.setDate(start.getDate() - (days - 1));
  return { start: toYYYYMMDD(start), end };
}
