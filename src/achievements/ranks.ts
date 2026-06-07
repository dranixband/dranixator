import type { Tier, RankTier } from './types';

interface LadderEntry {
  name: string;
  omega: number;
  tier: Tier;
}

// Tiers per spec §5: bronze ranks 1-2, silver 3-4, gold 5-7. Civilian (0) is neutral bronze.
const LADDER: LadderEntry[] = [
  { name: 'Civilian', omega: 0, tier: 'bronze' },
  { name: 'Recruit', omega: 10, tier: 'bronze' },
  { name: 'Private', omega: 60, tier: 'bronze' },
  { name: 'Signalman', omega: 150, tier: 'silver' },
  { name: 'Sapper', omega: 300, tier: 'silver' },
  { name: 'Sergeant', omega: 500, tier: 'gold' },
  { name: 'Veteran', omega: 800, tier: 'gold' },
  { name: 'Commander', omega: 1200, tier: 'gold' },
];

export interface RankInfo {
  rank: string;
  index: number;
  tier: RankTier;
  nextRank?: string;
  omegaIntoRank: number;
  omegaForNext: number;
  progress01: number;
  isLegend: boolean;
}

export function getRank(
  omega: number,
  opts: { allChips: boolean; allAchievements: boolean },
): RankInfo {
  if (opts.allChips && opts.allAchievements) {
    return {
      rank: 'Legend',
      index: LADDER.length,
      tier: 'legend',
      nextRank: undefined,
      omegaIntoRank: 0,
      omegaForNext: 0,
      progress01: 1,
      isLegend: true,
    };
  }

  let i = 0;
  for (let k = 0; k < LADDER.length; k++) {
    if (omega >= LADDER[k].omega) i = k;
  }
  const current = LADDER[i];
  const next = LADDER[i + 1];
  const omegaIntoRank = omega - current.omega;
  const omegaForNext = next ? next.omega - current.omega : 0;
  const progress01 = next ? Math.min(1, omegaIntoRank / omegaForNext) : 1;

  return {
    rank: current.name,
    index: i,
    tier: current.tier,
    nextRank: next?.name,
    omegaIntoRank,
    omegaForNext,
    progress01,
    isLegend: false,
  };
}
