/**
 * buildMemorySnapshot(checkIns): commonStressors, restoresEnergy, peakProductivity, recentWins.
 */
import type { CheckInData, MemorySnapshot } from './types';

export function buildMemorySnapshot(checkIns: CheckInData[]): MemorySnapshot {
  const stressed = checkIns.map((c) => c.prompts?.stressed?.trim()).filter((s): s is string => !!s);
  const grateful = checkIns.map((c) => c.prompts?.grateful?.trim()).filter((s): s is string => !!s);
  const proud = checkIns.map((c) => c.prompts?.proud?.trim()).filter((s): s is string => !!s);
  const commonStressors = [...new Set(stressed)].slice(0, 5);
  const restoresEnergy = [...new Set(grateful)].slice(0, 5);
  const recentWins = [...new Set(proud)].slice(0, 5);
  let peakProductivity = 'Unknown';
  if (checkIns.length >= 2) {
    const byFocus = [...checkIns].sort((a, b) => (b.ratings?.focus ?? 0) - (a.ratings?.focus ?? 0));
    const byEnergy = [...checkIns].sort((a, b) => (b.ratings?.energy ?? 0) - (a.ratings?.energy ?? 0));
    if (byFocus[0]?.ratings?.focus >= 7 || byEnergy[0]?.ratings?.energy >= 7) {
      peakProductivity = 'On days with higher focus and energy in your check-ins';
    }
  }
  return {
    commonStressors: commonStressors.length ? commonStressors : ['None noted yet'],
    restoresEnergy: restoresEnergy.length ? restoresEnergy : ['None noted yet'],
    peakProductivity,
    recentWins: recentWins.length ? recentWins : ['None noted yet'],
  };
}
