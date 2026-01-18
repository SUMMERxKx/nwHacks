import type { CheckInData } from './types';

export function serializeCheckIns(checkIns: CheckInData[]): string {
  if (checkIns.length === 0) return 'No check-ins in this period.';
  return checkIns
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((c) => {
      const r = c.ratings || {};
      const p = c.prompts || {};
      return [
        `[${c.date}]`,
        `ratings: stress=${r.stress} energy=${r.energy} mood=${r.mood} focus=${r.focus}`,
        `proud: ${p.proud || '-'}`,
        `stressed: ${p.stressed || '-'}`,
        `challenge: ${p.challenge || '-'}`,
        `grateful: ${p.grateful || '-'}`,
        `intention: ${p.intention || '-'}`,
      ].join('\n');
    })
    .join('\n\n---\n\n');
}
