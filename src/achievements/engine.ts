import type { AchEvent, AchievementState, Stats } from './types';
import { NODE_TYPES } from './types';
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
