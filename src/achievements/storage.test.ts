import { describe, it, expect, beforeEach } from 'vitest';
import { load, save, STORAGE_KEY } from './storage';
import { defaultState } from './engine';

// Minimal in-memory localStorage stub (node env has no DOM).
class MemStorage {
  private m = new Map<string, string>();
  getItem(k: string) {
    return this.m.has(k) ? this.m.get(k)! : null;
  }
  setItem(k: string, v: string) {
    this.m.set(k, v);
  }
  removeItem(k: string) {
    this.m.delete(k);
  }
  clear() {
    this.m.clear();
  }
}

beforeEach(() => {
  (globalThis as unknown as { localStorage: MemStorage }).localStorage = new MemStorage();
});

describe('storage', () => {
  it('returns a default state when nothing is stored', () => {
    expect(load()).toEqual(defaultState());
  });

  it('round-trips a saved state', () => {
    const st = defaultState();
    st.xp = 35;
    st.unlocked = { first_contact: 123 };
    save(st);
    const back = load();
    expect(back.xp).toBe(35);
    expect(back.unlocked.first_contact).toBe(123);
  });

  it('resets to default on corrupt JSON', () => {
    globalThis.localStorage.setItem(STORAGE_KEY, '{not json');
    expect(load()).toEqual(defaultState());
  });

  it('resets to default on version mismatch', () => {
    globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 99 }));
    expect(load()).toEqual(defaultState());
  });

  it('never throws when localStorage.setItem throws', () => {
    globalThis.localStorage.setItem = () => {
      throw new Error('quota');
    };
    expect(() => save(defaultState())).not.toThrow();
  });
});
