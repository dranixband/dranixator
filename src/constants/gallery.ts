import type { SongLabel } from "./songs";

export interface SongGallery {
  /** Demo audio src (reuses chip audioSrc by default) */
  demo?: string;
  /** Instrumental download URL */
  instrumental?: string;
  /** Photo URLs shown in PHOTO_LOG tab */
  photos: string[];
  /** YouTube embed IDs or full embed URLs for VIDEO_FEED tab */
  videos: string[];
  /** Short description shown in the gallery header */
  description?: string;
}

export const SONG_GALLERY: Record<SongLabel, SongGallery> = {
  "de(A)d ins(I)de": {
    demo: "songs/dead.mp3",
    photos: [],
    videos: [],
    description: "The track that started it all.",
  },
  "de[AR] sinner": {
    demo: "songs/sinner.mp3",
    photos: [],
    videos: [],
  },
  "r{IT}ual": {
    demo: "songs/ritual.mp3",
    photos: [],
    videos: [],
  },
  "adam & /AI/ve": {
    demo: "songs/adam.mp3",
    photos: [],
    videos: [],
  },
  "samur<AI/> protocol": {
    demo: "songs/samurai.mp3",
    photos: [],
    videos: [],
  },
  "r<AI/>sing": {
    demo: "songs/AdultPanda.wav",
    photos: [],
    videos: [],
  },
  "effes": {
    demo: "songs/effes.mp3",
    photos: [],
    videos: [],
  },
  "pizda": {
    demo: "songs/Pizda.mp3",
    photos: [],
    videos: [],
  },
  "doshik": {
    demo: "songs/Doshik.mp3",
    photos: [],
    videos: [],
  },
};
