/**
 * Single source of truth for all song labels.
 * Change a name here — it updates everywhere (Board, riddles, lyrics).
 */
export const SONG_LABELS = [
  "de(A)d ins(I)de",
  "de[AR] sinner",
  "r{IT}ual",
  "adam & /AI/ve",
  "samur<AI/> protocol",
  "r<AI/>sing",
  "effes",
  "pizda",
  "doshik",
] as const;

/** Union type of all valid song labels — TS will error on typos */
export type SongLabel = (typeof SONG_LABELS)[number];
