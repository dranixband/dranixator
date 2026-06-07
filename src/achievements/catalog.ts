import type { AchievementDef, NodeType, Tier } from './types';

const MASTERY_GLYPH: Record<string, string> = {
  riddle: '🧩',
  puzzle: '🧱',
  memory: '🧠',
  wire: '🔌',
  wordScramble: '🔤',
};

// Only the 5 reachable node types (see plan §Decisions). Names per spec §4.B.
const MASTERY: { type: NodeType; names: [string, string, string] }[] = [
  { type: 'riddle', names: ['Decoder', 'Sign Reader', 'Emoji Oracle'] },
  { type: 'puzzle', names: ['Assembler', 'Engineer', 'Schematic Architect'] },
  { type: 'memory', names: ['Memorizer', 'Photographic', 'Neural Net'] },
  { type: 'wire', names: ['Electrician', 'Tracer', 'Current Lord'] },
  { type: 'wordScramble', names: ['Wordsmith', 'Cryptolinguist', 'Voice of Dranix'] },
];

const masteryDefs: AchievementDef[] = MASTERY.flatMap(({ type, names }) => {
  const steps: { tier: Tier; n: number; idx: 0 | 1 | 2 }[] = [
    { tier: 'bronze', n: 1, idx: 0 },
    { tier: 'silver', n: 5, idx: 1 },
    { tier: 'gold', n: 15, idx: 2 },
  ];
  return steps.map(({ tier, n, idx }) => ({
    id: `mastery_${type}_${tier}`,
    category: 'mastery' as const,
    title: names[idx],
    description: `Solve ${n} ${type} node${n > 1 ? 's' : ''}.`,
    tier,
    glyph: MASTERY_GLYPH[type],
    condition: (s) => s.byType[type] >= n,
  }));
});

const firstSteps: AchievementDef[] = [
  { id: 'first_contact', category: 'firstSteps', title: 'First Contact', description: 'Solve your first node.', tier: 'bronze', glyph: '🛰️', condition: (s) => s.nodesSolved >= 1 },
  { id: 'trailblazer', category: 'firstSteps', title: 'Trailblazer', description: 'Complete your first path.', tier: 'bronze', glyph: '🧭', condition: (s) => s.pathsCompleted >= 1 },
  { id: 'signal_caught', category: 'firstSteps', title: 'Signal Caught', description: 'Unlock your first chip (song).', tier: 'bronze', glyph: '📡', condition: (s) => s.chipsUnlocked >= 1 },
  { id: 'first_sabotage', category: 'firstSteps', title: 'First Sabotage', description: 'Destroy your first node.', tier: 'bronze', glyph: '💥', condition: (s) => s.sabotaged >= 1 },
  { id: 'callsign', category: 'firstSteps', title: 'Callsign', description: 'Set your chat nickname + avatar.', tier: 'bronze', glyph: '🎙️', condition: (s) => s.callsignSet },
];

const volume: AchievementDef[] = [
  { id: 'ten_strong', category: 'volume', title: 'Ten-Strong', description: 'Solve 10 nodes.', tier: 'bronze', glyph: '🔟', condition: (s) => s.nodesSolved >= 10 },
  { id: 'frontliner', category: 'volume', title: 'Frontliner', description: 'Solve 25 nodes.', tier: 'silver', glyph: '🎖️', condition: (s) => s.nodesSolved >= 25 },
  { id: 'half_century', category: 'volume', title: 'Half-Century', description: 'Solve 50 nodes.', tier: 'silver', glyph: '🏅', condition: (s) => s.nodesSolved >= 50 },
  { id: 'centurion', category: 'volume', title: 'Centurion', description: 'Solve 100 nodes.', tier: 'gold', glyph: '💯', condition: (s) => s.nodesSolved >= 100 },
  { id: 'machine_against_machines', category: 'volume', title: 'Machine Against Machines', description: 'Solve 250 nodes.', tier: 'platinum', glyph: '🤖', condition: (s) => s.nodesSolved >= 250 },
];

const paths: AchievementDef[] = [
  { id: 'resistance_playlist', category: 'paths', title: 'Resistance Playlist', description: 'Unlock 3 chips.', tier: 'bronze', glyph: '🎵', condition: (s) => s.chipsUnlocked >= 3 },
  { id: 'discography', category: 'paths', title: 'Discography', description: 'Unlock every chip.', tier: 'gold', glyph: '💿', condition: (s) => s.totalChips > 0 && s.chipsUnlocked >= s.totalChips },
  { id: 'long_road', category: 'paths', title: 'Long Road', description: 'Complete a path of 5+ nodes.', tier: 'silver', glyph: '🛣️', condition: (s) => s.longestPath >= 5 },
];

const sabotage: AchievementDef[] = [
  { id: 'demolisher', category: 'sabotage', title: 'Demolisher', description: 'Destroy 1 node.', tier: 'bronze', glyph: '💣', condition: (s) => s.sabotaged >= 1 },
  { id: 'bomber', category: 'sabotage', title: 'Bomber', description: 'Destroy 10 nodes.', tier: 'silver', glyph: '🧨', condition: (s) => s.sabotaged >= 10 },
  { id: 'chaos_agent', category: 'sabotage', title: 'Chaos Agent', description: 'Destroy 50 nodes.', tier: 'gold', glyph: '☢️', condition: (s) => s.sabotaged >= 50 },
  { id: 'cleaner', category: 'sabotage', title: 'Cleaner', description: 'Wipe a whole path.', tier: 'gold', glyph: '🧹', condition: (s) => s.pathsWiped >= 1 },
];

const repair: AchievementDef[] = [
  { id: 'repairman', category: 'repair', title: 'Repairman', description: 'Refill 1 destroyed node.', tier: 'bronze', glyph: '🔧', condition: (s) => s.refilled >= 1 },
  { id: 'restorer', category: 'repair', title: 'Restorer', description: 'Refill 10 destroyed nodes.', tier: 'silver', glyph: '🛠️', condition: (s) => s.refilled >= 10 },
  { id: 'phoenix', category: 'repair', title: 'Phoenix', description: 'Restore a node you destroyed.', tier: 'gold', glyph: '🔥', condition: (s) => s.selfRefilled >= 1 },
];

const perfection: AchievementDef[] = [
  { id: 'first_try', category: 'perfection', title: 'First Try', description: 'Solve a node on the first attempt.', tier: 'bronze', glyph: '🎯', condition: (s) => s.firstTryCount >= 1 },
];

const social: AchievementDef[] = [
  { id: 'on_air', category: 'social', title: 'On Air', description: 'Send your first chat message.', tier: 'bronze', glyph: '📻', condition: (s) => s.chatMessages >= 1 },
  { id: 'radio_operator', category: 'social', title: 'Radio Operator', description: 'Send 50 chat messages.', tier: 'silver', glyph: '🎚️', condition: (s) => s.chatMessages >= 50 },
  { id: 'emoji_partisan', category: 'social', title: 'Emoji Partisan', description: 'Send a message with an emoji.', tier: 'bronze', glyph: '😎', condition: (s) => s.emojiMessages >= 1 },
];

// Collection denominators EXCLUDE the collection category (see EvalContext).
const collection: AchievementDef[] = [
  { id: 'quarter_way', category: 'collection', title: 'Quarter Way', description: 'Unlock 25% of all achievements.', tier: 'silver', glyph: '🌓', condition: (_s, ctx) => ctx.totalCount > 0 && ctx.unlockedCount >= ctx.totalCount * 0.25 },
  { id: 'halfway', category: 'collection', title: 'Halfway', description: 'Unlock 50% of all achievements.', tier: 'gold', glyph: '🌗', condition: (_s, ctx) => ctx.totalCount > 0 && ctx.unlockedCount >= ctx.totalCount * 0.5 },
  { id: 'resistance_platinum', category: 'collection', title: 'Resistance Platinum', description: 'Unlock everything.', tier: 'platinum', glyph: '🏆', condition: (_s, ctx) => ctx.totalCount > 0 && ctx.unlockedCount >= ctx.totalCount },
  { id: 'bronze_collector', category: 'collection', title: 'Bronze Collector', description: 'Unlock every bronze badge.', tier: 'silver', glyph: '🥉', condition: (_s, ctx) => ctx.totalBronze > 0 && ctx.unlockedBronze >= ctx.totalBronze },
];

const time: AchievementDef[] = [
  { id: 'night_shift', category: 'time', title: 'Night Shift', description: 'Solve a node between 00:00 and 04:59.', tier: 'bronze', hidden: true, glyph: '🌙', condition: (s) => s.solvedAtNight },
  { id: 'early_bird', category: 'time', title: 'Early Bird', description: 'Solve a node between 05:00 and 06:59.', tier: 'bronze', hidden: true, glyph: '🐦', condition: (s) => s.solvedEarly },
];

const absurd: AchievementDef[] = [
  { id: 'just_looking', category: 'absurd', title: 'Just Looking', description: 'Open the panel 10 times without earning anything new.', tier: 'bronze', hidden: true, glyph: '👀', condition: (s) => s.panelOpensSinceUnlock >= 10 },
];

export const CATALOG: AchievementDef[] = [
  ...firstSteps,
  ...masteryDefs,
  ...volume,
  ...paths,
  ...sabotage,
  ...repair,
  ...perfection,
  ...social,
  ...collection,
  ...time,
  ...absurd,
];
