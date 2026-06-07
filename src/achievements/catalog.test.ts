import { describe, it, expect } from 'vitest';
import { CATALOG } from './catalog';
import { TIER_XP } from './types';

describe('CATALOG', () => {
  it('has 46 achievements', () => {
    expect(CATALOG.length).toBe(46);
  });

  it('has unique ids', () => {
    const ids = CATALOG.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('only references valid tiers and provides a glyph + non-empty copy', () => {
    for (const d of CATALOG) {
      expect(d.tier in TIER_XP).toBe(true);
      expect(d.glyph.length).toBeGreaterThan(0);
      expect(d.title.length).toBeGreaterThan(0);
      expect(d.description.length).toBeGreaterThan(0);
    }
  });

  it('ships exactly 15 mastery badges (5 reachable types x 3 tiers)', () => {
    expect(CATALOG.filter((d) => d.category === 'mastery').length).toBe(15);
  });

  it('has at least one bronze non-collection badge (for Bronze Collector denominator)', () => {
    const bronze = CATALOG.filter((d) => d.category !== 'collection' && d.tier === 'bronze');
    expect(bronze.length).toBeGreaterThan(0);
  });
});
