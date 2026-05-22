import type { SongLabel } from "./songs";

export interface WordScrambleData {
  songLabel: SongLabel;
  /** The lyric fragment — words will be split by spaces and shuffled */
  phrase: string;
  /** Audio start time in seconds for the reward playback */
  startTime: number;
  /** Audio end time in seconds */
  endTime: number;
}

/**
 * Word scramble challenges per song.
 * Each entry is a lyric fragment that gets shuffled for the player to reorder.
 * TODO: Fill in exact timecodes matching the audio files.
 */
export const WORD_SCRAMBLES: WordScrambleData[] = [
  {
    songLabel: "de(A)d ins(I)de",
    phrase: "I'm dead inside on the dancefloor",
    startTime: 34,
    endTime: 37,
  },
  {
    songLabel: "de(A)d ins(I)de",
    phrase: "Lost in neon lights",
    startTime: 32,
    endTime: 35,
  },
  // {
  //   songLabel: "de[AR] sinner",
  //   phrase: "Dear sinner never say goodbye",
  //   startTime: 0,
  //   endTime: 10,
  // },
  // {
  //   songLabel: "de[AR] sinner",
  //   phrase: "You worship a kingdom built on blood",
  //   startTime: 0,
  //   endTime: 10,
  // },
  // {
  //   songLabel: "r{IT}ual",
  //   phrase: "If the spear pierces my heart",
  //   startTime: 0,
  //   endTime: 10,
  // },
  // {
  //   songLabel: "r{IT}ual",
  //   phrase: "We are the warborn titans",
  //   startTime: 0,
  //   endTime: 10,
  // },
  // {
  //   songLabel: "adam & /AI/ve",
  //   phrase: "For your false promise I have to break true ones",
  //   startTime: 0,
  //   endTime: 10,
  // },
  // {
  //   songLabel: "samur<AI/> protocol",
  //   phrase: "Every night I dream of stars",
  //   startTime: 0,
  //   endTime: 10,
  // },
  // {
  //   songLabel: "samur<AI/> protocol",
  //   phrase: "Voices echo breaking the walls",
  //   startTime: 0,
  //   endTime: 10,
  // },
];
