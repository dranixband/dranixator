import type { SongLabel } from "./songs";

const AUDIO_BASE =
  "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/audio/songs";

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
  /** Sampler pad definitions (up to 8) */
  samples?: { label: string; src: string }[];
}

export const SONG_GALLERY: Record<SongLabel, SongGallery> = {
  "de(A)d ins(I)de": {
    demo: `${AUDIO_BASE}/dead.mp3`,
    photos: [],
    videos: [],
    description: "The track that started it all.",
    samples: [
      {
        label: "okay",
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/audio/samples/dead/okay.mp3",
      },
      {
        label: "singalong",
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/audio/samples/dead/singalong.mp3",
      },
      {
        label: "bleagh",
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/audio/samples/dead/bleagh.mp3",
      },
      {
        label: "chorus",
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/audio/samples/dead/chorus.mp3",
      },
      {
        label: "guit_intro",
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/audio/samples/dead/guit_intro.mp3",
      },
      {
        label: "bass_verse_2",
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/audio/samples/dead/bass_verse_2.mp3",
      },
      {
        label: "drums",
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/audio/samples/dead/drums.mp3",
      },
      {
        label: "guit_solo",
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/audio/samples/dead/guit_solo.mp3",
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
