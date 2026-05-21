import type { SongLabel } from "./songs";

const AUDIO_BASE =
  "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/audio/songs";

export interface PhotoEntry {
  src: string;
  title: string;
  date: string;
}

export interface SongGallery {
  /** Demo audio src (reuses chip audioSrc by default) */
  demo?: string;
  /** Instrumental download URL */
  instrumental?: string;
  /** Photo entries shown in PHOTO_LOG tab */
  photos: PhotoEntry[];
  /** YouTube embed IDs or full embed URLs for VIDEO_FEED tab */
  videos: string[];
  /** Short description shown in the gallery header */
  description?: string;
  /** Sampler pad definitions (up to 8) */
  samples?: { label: string; src: string }[];
}

export const SONG_GALLERY: Record<SongLabel, SongGallery> = {
  "de(A)d ins(I)de": {
    demo: `${AUDIO_BASE}/dead.mp3`,
    photos: [
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/puzzles/dead.jpg",
        title: "Studio session #1",
        date: "2025-01-15",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/puzzles/dead.jpg",
        title: "Tracking guitars",
        date: "2025-02-03",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/puzzles/dead.jpg",
        title: "Vocal takes",
        date: "2025-02-20",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/puzzles/dead.jpg",
        title: "Mixing day",
        date: "2025-03-10",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/puzzles/dead.jpg",
        title: "Final master",
        date: "2025-03-28",
      },
    ],
    videos: [],
    description: "The track that started it all.",
    samples: [
      {
        label: "vox_chorus",
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/audio/samples/dead/vox_chorus.mp3",
      },
      {
        label: "guitar_chorus",
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/audio/samples/dead/guitar_chorus.mp3",
      },
      {
        label: "drums_chorus",
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/audio/samples/dead/drums_chorus.mp3",
      },
      {
        label: "bass_chorus",
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/audio/samples/dead/bass_chorus.mp3",
      },
      {
        label: "singalong",
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/audio/samples/dead/singalong.mp3",
      },
      {
        label: "love",
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/audio/samples/dead/love.mp3",
      },
      {
        label: "bleagh",
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/audio/samples/dead/bleagh.mp3",
      },
      {
        label: "okay",
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/audio/samples/dead/okay.mp3",
      },
    ],
  },
  "de[AR] sinner": {
    demo: `${AUDIO_BASE}/sinner.mp3`,
    photos: [],
    videos: [],
  },
  "r{IT}ual": {
    demo: `${AUDIO_BASE}/ritual.mp3`,
    photos: [],
    videos: [],
  },
  "adam & /AI/ve": {
    demo: `${AUDIO_BASE}/adam.mp3`,
    photos: [],
    videos: [],
  },
  "samur<AI/> protocol": {
    demo: `${AUDIO_BASE}/samurai.mp3`,
    photos: [],
    videos: [],
  },
  "r<AI/>sing": {
    demo: `${AUDIO_BASE}/rising.mp3`,
    photos: [],
    videos: [],
  },
  effes: {
    demo: `${AUDIO_BASE}/effes.mp3`,
    photos: [],
    videos: [],
  },
  pizda: {
    demo: `${AUDIO_BASE}/Pizda.mp3`,
    photos: [],
    videos: [],
  },
  doshik: {
    demo: `${AUDIO_BASE}/Doshik.mp3`,
    photos: [],
    videos: [],
  },
};
