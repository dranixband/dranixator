import type { SongLabel } from "./songs";

export interface Riddle {
  /** The emoji clue shown to the player */
  emojis: string[];
  /** The correct answer — must be a valid SongLabel */
  answer: SongLabel;
  /** 4 wrong options (correct answer is added automatically = 5 total) */
  decoys: SongLabel[];
}

/**
 * Add new riddles here.
 * - `emojis`: 3 emojis that hint at the song
 * - `answer`: exact song label (TS will error on typos)
 * - `decoys`: 4 wrong song labels
 */
export const RIDDLES: Riddle[] = [
  {
    emojis: ["💀", "📱", "🕺"],
    answer: "de(A)d ins(I)de",
    decoys: ["de[AR] sinner", "r{IT}ual", "effes", "r<AI/>sing"],
  },
  {
    emojis: ["🐘", "🗡️", "❤️"],
    answer: "r{IT}ual",
    decoys: ["de(A)d ins(I)de", "adam & /AI/ve", "doshik", "pizda"],
  },
  {
    emojis: ["🇯🇵", "🥷", "📋"],
    answer: "samur<AI/> protocol",
    decoys: ["r<AI/>sing", "de[AR] sinner", "pizda", "effes"],
  },
  {
    emojis: ["🍎", "🐍", "💑"],
    answer: "adam & /AI/ve",
    decoys: ["r{IT}ual", "effes", "de(A)d ins(I)de", "doshik"],
  },
  {
    emojis: ["😈", "🔥", "🙏"],
    answer: "de[AR] sinner",
    decoys: [
      "de(A)d ins(I)de",
      "samur<AI/> protocol",
      "r<AI/>sing",
      "adam & /AI/ve",
    ],
  },
  {
    emojis: ["📈", "🌅", "🤖"],
    answer: "r<AI/>sing",
    decoys: ["de[AR] sinner", "doshik", "adam & /AI/ve", "samur<AI/> protocol"],
  },
];
