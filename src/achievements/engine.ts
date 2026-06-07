import type { AchEvent, AchievementState, Stats, AchievementDef, EvalContext } from './types';
import { NODE_TYPES, TIER_XP } from './types';
import type { NodeType } from './types';

export function emptyStats(): Stats {
  const byType = {} as Record<NodeType, number>;
  for (const t of NODE_TYPES) byType[t] = 0;
  return {
    nodesSolved: 0,
    byType,
    pathsCompleted: 0,
    longestPath: 0,
    chipsUnlocked: 0,
    totalChips: 0,
    sabotaged: 0,
    pathsWiped: 0,
    refilled: 0,
    selfRefilled: 0,
    firstTryCount: 0,
    chatMessages: 0,
    emojiMessages: 0,
    panelOpens: 0,
    panelOpensSinceUnlock: 0,
    solvedAtNight: false,
    solvedEarly: false,
    callsignSet: false,
  };
}

export function defaultState(): AchievementState {
  return { version: 1, stats: emptyStats(), unlocked: {}, xp: 0, seenToasts: [] };
}

/** Pure: returns a new Stats with the event applied. Never mutates input. */
export function reduce(stats: Stats, e: AchEvent): Stats {
  const s: Stats = { ...stats, byType: { ...stats.byType } };
  switch (e.kind) {
    case 'node_solved': {
      s.nodesSolved += 1;
      if (e.nodeType) s.byType[e.nodeType] += 1;
      if (e.firstTry) s.firstTryCount += 1;
      if (e.hour != null) {
        if (e.hour >= 0 && e.hour <= 4) s.solvedAtNight = true;
        if (e.hour >= 5 && e.hour <= 6) s.solvedEarly = true;
      }
      break;
    }
    case 'path_completed': {
      s.pathsCompleted += 1;
      s.longestPath = Math.max(s.longestPath, e.pathLength ?? 0);
      break;
    }
    case 'chip_unlocked': {
      s.chipsUnlocked += 1;
      if (e.totalChips != null) s.totalChips = e.totalChips;
      break;
    }
    case 'node_sabotaged': {
      s.sabotaged += 1;
      if (e.pathWiped) s.pathsWiped += 1;
      break;
    }
    case 'node_refilled': {
      s.refilled += 1;
      if (e.wasSelfDestroyed) s.selfRefilled += 1;
      break;
    }
    case 'chat_message': {
      s.chatMessages += 1;
      if (e.hasEmoji) s.emojiMessages += 1;
      break;
    }
    case 'panel_opened': {
      s.panelOpens += 1;
      s.panelOpensSinceUnlock += 1;
      break;
    }
    case 'callsign_set': {
      s.callsignSet = true;
      break;
    }
  }
  return s;
}

/** Pre-tick context. Collection category is excluded to avoid meta self-reference. */
export function buildContext(
  catalog: AchievementDef[],
  unlocked: Record<string, number>,
): EvalContext {
  const nonColl = catalog.filter((d) => d.category !== 'collection');
  const bronze = nonColl.filter((d) => d.tier === 'bronze');
  return {
    totalCount: nonColl.length,
    unlockedCount: nonColl.filter((d) => unlocked[d.id] != null).length,
    totalBronze: bronze.length,
    unlockedBronze: bronze.filter((d) => unlocked[d.id] != null).length,
  };
}

export interface ApplyResult {
  state: AchievementState;
  newlyUnlocked: string[];
}

/** Pure orchestrator: reduce -> evaluate locked defs -> unlock + add XP. `now` is injected.
 *
 * Two-pass evaluation:
 *   Pass 1 (non-collection): uses pre-tick context. Unlocks are toasted and add XP.
 *   Pass 2 (collection):     uses post-pass-1 context so collection % sees the current tick's
 *                            non-collection unlocks. Collection achievements unlock silently
 *                            (not added to newlyUnlocked, no XP) to avoid meta self-reference.
 */
export function applyEvent(
  state: AchievementState,
  e: AchEvent,
  catalog: AchievementDef[],
  now: number,
): ApplyResult {
  const stats = reduce(state.stats, e);
  const unlocked = { ...state.unlocked };
  const newlyUnlocked: string[] = [];
  let xp = state.xp;

  // Pass 1: non-collection defs — pre-tick context, visible unlocks, add XP.
  const preTickCtx = buildContext(catalog, state.unlocked);
  for (const def of catalog) {
    if (def.category === 'collection') continue;
    if (unlocked[def.id] != null) continue;
    if (def.condition(stats, preTickCtx)) {
      unlocked[def.id] = now;
      xp += def.xp ?? TIER_XP[def.tier];
      newlyUnlocked.push(def.id);
    }
  }

  // Pass 2: collection defs — post-pass-1 context, silent unlocks, no XP.
  const postCtx = buildContext(catalog, unlocked);
  for (const def of catalog) {
    if (def.category !== 'collection') continue;
    if (unlocked[def.id] != null) continue;
    if (def.condition(stats, postCtx)) {
      unlocked[def.id] = now;
      // intentionally: no XP, not pushed to newlyUnlocked
    }
  }

  const finalStats =
    newlyUnlocked.length > 0 ? { ...stats, panelOpensSinceUnlock: 0 } : stats;

  return {
    state: { ...state, stats: finalStats, unlocked, xp },
    newlyUnlocked,
  };
}
