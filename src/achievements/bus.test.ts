import { describe, it, expect, beforeEach } from 'vitest';
import { track, subscribe, __resetBusForTests } from './bus';
import type { AchEvent } from './types';

beforeEach(() => __resetBusForTests());

describe('bus', () => {
  it('buffers events fired before a subscriber attaches, then flushes', () => {
    const seen: AchEvent[] = [];
    track({ kind: 'node_solved' });
    track({ kind: 'panel_opened' });
    subscribe((e) => seen.push(e));
    expect(seen.map((e) => e.kind)).toEqual(['node_solved', 'panel_opened']);
  });

  it('delivers events fired after subscribing', () => {
    const seen: AchEvent[] = [];
    subscribe((e) => seen.push(e));
    track({ kind: 'callsign_set' });
    expect(seen.map((e) => e.kind)).toEqual(['callsign_set']);
  });

  it('unsubscribe stops delivery', () => {
    const seen: AchEvent[] = [];
    const off = subscribe((e) => seen.push(e));
    off();
    track({ kind: 'callsign_set' });
    expect(seen).toEqual([]);
  });
});
