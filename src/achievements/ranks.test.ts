import { describe, it, expect } from 'vitest';
import { getRank } from './ranks';

const NORMAL = { allChips: false, allAchievements: false };

describe('getRank', () => {
  it('Ω 0 is Civilian at index 0', () => {
    const r = getRank(0, NORMAL);
    expect(r.rank).toBe('Civilian');
    expect(r.index).toBe(0);
    expect(r.isLegend).toBe(false);
    expect(r.nextRank).toBe('Recruit');
  });

  it('Ω just below a threshold stays in the lower rank', () => {
    expect(getRank(59, NORMAL).rank).toBe('Recruit');
    expect(getRank(60, NORMAL).rank).toBe('Private');
  });

  it('promotes at each ladder threshold', () => {
    expect(getRank(10, NORMAL).rank).toBe('Recruit');
    expect(getRank(150, NORMAL).rank).toBe('Signalman');
    expect(getRank(300, NORMAL).rank).toBe('Sapper');
    expect(getRank(500, NORMAL).rank).toBe('Sergeant');
    expect(getRank(800, NORMAL).rank).toBe('Veteran');
    expect(getRank(1200, NORMAL).rank).toBe('Commander');
  });

  it('reports progress into the next rank', () => {
    const r = getRank(85, NORMAL); // Private(60) -> Signalman(150)
    expect(r.rank).toBe('Private');
    expect(r.omegaIntoRank).toBe(25);
    expect(r.omegaForNext).toBe(90);
    expect(r.progress01).toBeCloseTo(25 / 90, 5);
  });

  it('top of ladder has no next and full progress', () => {
    const r = getRank(2000, NORMAL);
    expect(r.rank).toBe('Commander');
    expect(r.nextRank).toBeUndefined();
    expect(r.progress01).toBe(1);
  });

  it('Legend requires all chips AND all achievements', () => {
    expect(getRank(2000, { allChips: true, allAchievements: false }).isLegend).toBe(false);
    expect(getRank(50, { allChips: true, allAchievements: true }).isLegend).toBe(true);
    const r = getRank(50, { allChips: true, allAchievements: true });
    expect(r.rank).toBe('Legend');
    expect(r.tier).toBe('legend');
  });
});
