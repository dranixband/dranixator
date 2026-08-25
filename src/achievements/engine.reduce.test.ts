import { describe, it, expect } from 'vitest';
import { emptyStats, defaultState, reduce } from './engine';

describe('emptyStats', () => {
  it('initializes all 8 byType keys to 0', () => {
    const s = emptyStats();
    expect(s.nodesSolved).toBe(0);
    expect(Object.keys(s.byType).sort()).toEqual(
      ['drawing', 'memory', 'prompt', 'puzzle', 'rhythm', 'riddle', 'wire', 'wordScramble'].sort(),
    );
    expect(s.byType.riddle).toBe(0);
  });
});

describe('defaultState', () => {
  it('is a clean v1 state', () => {
    const st = defaultState();
    expect(st.version).toBe(1);
    expect(st.xp).toBe(0);
    expect(st.unlocked).toEqual({});
    expect(st.seenToasts).toEqual([]);
  });
});

describe('reduce', () => {
  it('node_solved increments totals, byType, firstTry, and time flags', () => {
    let s = emptyStats();
    s = reduce(s, { kind: 'node_solved', nodeType: 'riddle', firstTry: true, hour: 2 });
    expect(s.nodesSolved).toBe(1);
    expect(s.byType.riddle).toBe(1);
    expect(s.firstTryCount).toBe(1);
    expect(s.solvedAtNight).toBe(true);
    expect(s.solvedEarly).toBe(false);

    s = reduce(s, { kind: 'node_solved', nodeType: 'wire', firstTry: false, hour: 6 });
    expect(s.nodesSolved).toBe(2);
    expect(s.byType.wire).toBe(1);
    expect(s.firstTryCount).toBe(1);
    expect(s.solvedEarly).toBe(true);
  });

  it('path_completed tracks count and longest path', () => {
    let s = emptyStats();
    s = reduce(s, { kind: 'path_completed', pathLength: 3 });
    s = reduce(s, { kind: 'path_completed', pathLength: 7 });
    s = reduce(s, { kind: 'path_completed', pathLength: 5 });
    expect(s.pathsCompleted).toBe(3);
    expect(s.longestPath).toBe(7);
  });

  it('chip_unlocked records count and grand total', () => {
    let s = emptyStats();
    s = reduce(s, { kind: 'chip_unlocked', totalChips: 9 });
    expect(s.chipsUnlocked).toBe(1);
    expect(s.totalChips).toBe(9);
  });

  it('node_sabotaged counts wipes only when flagged', () => {
    let s = emptyStats();
    s = reduce(s, { kind: 'node_sabotaged', pathWiped: false });
    s = reduce(s, { kind: 'node_sabotaged', pathWiped: true });
    expect(s.sabotaged).toBe(2);
    expect(s.pathsWiped).toBe(1);
  });

  it('node_refilled counts self-restores only when flagged', () => {
    let s = emptyStats();
    s = reduce(s, { kind: 'node_refilled', wasSelfDestroyed: true });
    s = reduce(s, { kind: 'node_refilled', wasSelfDestroyed: false });
    expect(s.refilled).toBe(2);
    expect(s.selfRefilled).toBe(1);
  });

  it('chat_message counts emoji messages', () => {
    let s = emptyStats();
    s = reduce(s, { kind: 'chat_message', hasEmoji: true });
    s = reduce(s, { kind: 'chat_message', hasEmoji: false });
    expect(s.chatMessages).toBe(2);
    expect(s.emojiMessages).toBe(1);
  });

  it('panel_opened increments both panel counters', () => {
    let s = emptyStats();
    s = reduce(s, { kind: 'panel_opened' });
    s = reduce(s, { kind: 'panel_opened' });
    expect(s.panelOpens).toBe(2);
    expect(s.panelOpensSinceUnlock).toBe(2);
  });

  it('callsign_set flips the flag', () => {
    const s = reduce(emptyStats(), { kind: 'callsign_set' });
    expect(s.callsignSet).toBe(true);
  });

  it('does not mutate the input stats object', () => {
    const s0 = emptyStats();
    const s1 = reduce(s0, { kind: 'node_solved', nodeType: 'riddle' });
    expect(s0.nodesSolved).toBe(0);
    expect(s1).not.toBe(s0);
  });
});
