import type { AchievementState } from './types';
import { defaultState } from './engine';

export const STORAGE_KEY = 'dranix_achievements';

function isValid(x: unknown): x is AchievementState {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return (
    o.version === 1 &&
    typeof o.stats === 'object' &&
    o.stats !== null &&
    typeof o.xp === 'number' &&
    typeof o.unlocked === 'object' &&
    o.unlocked !== null &&
    Array.isArray(o.seenToasts)
  );
}

export function load(): AchievementState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    if (isValid(parsed)) return parsed;
    return defaultState();
  } catch {
    return defaultState();
  }
}

export function save(state: AchievementState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable/full → keep in-memory state, never throw to UI.
  }
}
