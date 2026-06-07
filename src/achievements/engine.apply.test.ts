import { describe, it, expect } from 'vitest';
import { defaultState, buildContext, applyEvent } from './engine';
import type { AchievementDef } from './types';

// Small fixture catalog isolates evaluator logic from the real CATALOG.
const FIX: AchievementDef[] = [
  { id: 'a_first', category: 'firstSteps', title: 'A', description: 'first node', tier: 'bronze', glyph: 'x', condition: (s) => s.nodesSolved >= 1 },
  { id: 'a_ten', category: 'volume', title: 'B', description: 'ten nodes', tier: 'silver', glyph: 'x', condition: (s) => s.nodesSolved >= 10 },
  { id: 'c_quarter', category: 'collection', title: 'C', description: '25%', tier: 'silver', glyph: 'x', condition: (_s, ctx) => ctx.totalCount > 0 && ctx.unlockedCount >= ctx.totalCount * 0.25 },
];

describe('buildContext', () => {
  it('excludes the collection category from counts', () => {
    const ctx = buildContext(FIX, { a_first: 1 });
    expect(ctx.totalCount).toBe(2); // a_first + a_ten, NOT c_quarter
    expect(ctx.unlockedCount).toBe(1);
    expect(ctx.totalBronze).toBe(1);
    expect(ctx.unlockedBronze).toBe(1);
  });
});

describe('applyEvent', () => {
  it('unlocks a matching achievement, adds XP, stamps timestamp, returns newlyUnlocked', () => {
    const { state, newlyUnlocked } = applyEvent(
      defaultState(),
      { kind: 'node_solved', nodeType: 'riddle' },
      FIX,
      1000,
    );
    expect(newlyUnlocked).toEqual(['a_first']);
    expect(state.unlocked.a_first).toBe(1000);
    expect(state.xp).toBe(10); // bronze
  });

  it('is idempotent: re-applying does not re-unlock or double XP', () => {
    let st = defaultState();
    st = applyEvent(st, { kind: 'node_solved', nodeType: 'riddle' }, FIX, 1).state;
    const again = applyEvent(st, { kind: 'node_solved', nodeType: 'riddle' }, FIX, 2);
    expect(again.newlyUnlocked).toEqual([]);
    expect(again.state.xp).toBe(10);
    expect(again.state.unlocked.a_first).toBe(1); // original timestamp kept
  });

  it('collection % uses the PRE-tick unlocked count (lags one event)', () => {
    // Reach 9 nodes: a_first unlocked, a_ten not. ctx before tick = 1/2 = 50% >= 25%.
    let st = defaultState();
    for (let i = 0; i < 9; i++) {
      st = applyEvent(st, { kind: 'node_solved', nodeType: 'riddle' }, FIX, i + 1).state;
    }
    expect(!!st.unlocked.a_first).toBe(true);
    expect(!!st.unlocked.c_quarter).toBe(true); // unlocked on a later tick, not the first
  });

  it('resets panelOpensSinceUnlock whenever something unlocks', () => {
    let st = defaultState();
    st = applyEvent(st, { kind: 'panel_opened' }, FIX, 1).state;
    st = applyEvent(st, { kind: 'panel_opened' }, FIX, 2).state;
    expect(st.stats.panelOpensSinceUnlock).toBe(2);
    st = applyEvent(st, { kind: 'node_solved', nodeType: 'riddle' }, FIX, 3).state; // unlocks a_first
    expect(st.stats.panelOpensSinceUnlock).toBe(0);
  });
});
