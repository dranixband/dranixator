import type { NodeType } from '../components/Board';

export type { NodeType };

export type Tier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type RankTier = Tier | 'legend';

export type AchievementCategory =
  | 'firstSteps'
  | 'mastery'
  | 'volume'
  | 'paths'
  | 'sabotage'
  | 'repair'
  | 'perfection'
  | 'social'
  | 'collection'
  | 'time'
  | 'absurd';

export const TIER_XP: Record<Tier, number> = {
  bronze: 10,
  silver: 25,
  gold: 50,
  platinum: 100,
};

// All 8 declared NodeTypes (byType tracks all; catalog only ships the 5 reachable ones).
export const NODE_TYPES: NodeType[] = [
  'riddle',
  'puzzle',
  'memory',
  'wire',
  'wordScramble',
  'prompt',
  'rhythm',
  'drawing',
];

export interface Stats {
  nodesSolved: number;
  byType: Record<NodeType, number>;
  pathsCompleted: number;
  longestPath: number;
  chipsUnlocked: number;
  totalChips: number; // grand total chips that exist (from chip_unlocked events)
  sabotaged: number;
  pathsWiped: number;
  refilled: number;
  selfRefilled: number;
  firstTryCount: number;
  chatMessages: number;
  emojiMessages: number;
  panelOpens: number;
  panelOpensSinceUnlock: number;
  solvedAtNight: boolean; // hour 0..4
  solvedEarly: boolean; // hour 5..6
  callsignSet: boolean;
}

export interface AchEvent {
  kind:
    | 'node_solved'
    | 'path_completed'
    | 'chip_unlocked'
    | 'node_sabotaged'
    | 'node_refilled'
    | 'chat_message'
    | 'panel_opened'
    | 'callsign_set';
  nodeType?: NodeType;
  firstTry?: boolean;
  hour?: number; // 0..23, supplied by caller (keeps engine clock-free)
  pathLength?: number;
  totalChips?: number;
  pathWiped?: boolean;
  wasSelfDestroyed?: boolean;
  hasEmoji?: boolean;
}

// Counts EXCLUDE the `collection` category to avoid meta self-reference.
export interface EvalContext {
  unlockedCount: number;
  totalCount: number;
  unlockedBronze: number;
  totalBronze: number;
}

export interface AchievementDef {
  id: string;
  category: AchievementCategory;
  title: string;
  description: string;
  tier: Tier;
  xp?: number; // defaults to TIER_XP[tier]
  hidden?: boolean;
  glyph: string;
  condition: (s: Stats, ctx: EvalContext) => boolean;
}

export interface AchievementState {
  version: 1;
  stats: Stats;
  unlocked: Record<string, number>; // id -> unlock timestamp (ms)
  xp: number;
  seenToasts: string[];
}
