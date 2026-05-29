import type { SongLabel } from "./songs";

const AUDIO_BASE =
  "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/audio/songs";

export interface PhotoEntry {
  src: string;
  title: string;
  date: string;
}

export interface VideoEntry {
  /** YouTube embed URL (https://www.youtube.com/embed/VIDEO_ID) or direct video URL */
  src: string;
  title: string;
  date: string;
  /** Optional thumbnail override; YouTube thumbs are auto-derived if omitted */
  thumbnail?: string;
}

export interface SongGallery {
  /** Demo audio src (reuses chip audioSrc by default) */
  demo?: string;
  /** Instrumental download URL */
  instrumental?: string;
  /** Photo entries shown in PHOTO_LOG tab */
  photos: PhotoEntry[];
  /** Video entries shown in VIDEO_FEED tab */
  videos: VideoEntry[];
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
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/dead/1)photo_2026-05-22_15-08-37.jpg",
        title: "Agent Ra",
        date: "2025-01-22",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/dead/2)photo_2026-05-22_15-08-50.jpg",
        title: "Chained Mihas",
        date: "2025-02-01",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/dead/3)photo_2026-05-22_15-08-25.jpg",
        title: "Salt Nik",
        date: "2025-02-07",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/dead/4)photo_2026-05-22_15-08-31.jpg",
        title: "Padik Egorka",
        date: "2025-02-07",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/dead/5)photo_2026-05-22_15-07-33.jpg",
        title: "Nik's Reservoir Dogs",
        date: "2025-02-07",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/dead/6)photo_2026-05-22_15-07-28.jpg",
        title: "Logo proto",
        date: "2025-02-11",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/dead/7)photo_2026-05-22_15-07-41.jpg",
        title: "Merch idea",
        date: "2025-02-18",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/dead/8)photo_2026-05-22_15-07-23.jpg",
        title: "DRANIXs",
        date: "2025-02-24",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/dead/9)photo_2026-05-22_15-08-02.jpg",
        title: "AI Slop",
        date: "2025-02-28",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/dead/10)photo_2026-05-22_15-08-07.jpg",
        title: "Mihas Anti Salt",
        date: "2025-03-01",
      },
    ],
    videos: [
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/video/gallery/dead/1)video_2026-05-22_15-09-24.mp4",
        title: "Rhythm section true love",
        date: "2025-04-22",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/video/gallery/dead/4)IMG_2592.MOV",
        title: "Deadinsiders",
        date: "2025-04-25",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/video/gallery/dead/IMG_1460.MOV",
        title: "Drum rec",
        date: "2025-03-22",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/video/gallery/dead/Video%20Project%205.mp4",
        title: "Lost in neon lights",
        date: "2024-05-22",
      },
    ],
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
    photos: [
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/sinner/31)photo_2026-05-22_15-12-42.jpg",
        title: "de[AR] sinner and Natosha",
        date: "2025-10-31",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/sinner/32)photo_2026-05-22_15-11-38.jpg",
        title: "KOLONKA",
        date: "2025-10-01",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/sinner/33)photo_2026-05-22_15-11-49.jpg",
        title: "Możliwa Kontrola Biletów",
        date: "2025-09-01",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/sinner/34)photo_2026-05-22_15-11-54.jpg",
        title: "First Dranix show",
        date: "2025-09-01",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/sinner/35)photo_2026-05-22_15-12-00.jpg",
        title: "Best friends",
        date: "2025-10-31",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/sinner/36)photo_2026-05-22_15-12-06.jpg",
        title: "Satisfaction",
        date: "2025-08-05",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/sinner/37)photo_2026-05-22_15-12-12.jpg",
        title: "Wrong hole!",
        date: "2025-08-05",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/sinner/38)photo_2026-05-22_15-12-17.jpg",
        title: "Robo Egorka",
        date: "2025-08-05",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/sinner/39)photo_2026-05-22_15-12-24.jpg",
        title: "Shining Vibes",
        date: "2025-08-05",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/sinner/40)photo_2026-05-22_15-12-30.jpg",
        title: "Little eye infection",
        date: "2025-08-05",
      },
    ],
    videos: [],
  },
  "r{IT}ual": {
    demo: `${AUDIO_BASE}/ritual.mp3`,
    photos: [
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/ritual/11)photo_2026-05-22_15-08-12.jpg",
        title: "Agent ra is watching you!",
        date: "2025-04-05",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/ritual/12)photo_2026-05-22_15-08-16.jpg",
        title: "Nik and his reservoir dogs (mops)",
        date: "2025-04-05",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/ritual/13)photo_2026-05-22_15-08-20.jpg",
        title: "Purple v[AI]bes",
        date: "2025-04-25",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/ritual/14)photo_2026-05-22_15-06-56.jpg",
        title: "Place of Power, Heart of Dranix band",
        date: "2025-02-25",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/ritual/15)photo_2026-05-22_15-07-45.jpg",
        title: "AI Slop",
        date: "2025-01-25",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/ritual/16)photo_2026-05-22_15-07-36.jpg",
        title: "Dranixy",
        date: "2025-01-23",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/ritual/17)photo_2026-05-22_15-08-43.jpg",
        title: "Blue v[AI]bes",
        date: "2025-01-07",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/ritual/18)photo_2026-05-22_15-07-16.jpg",
        title: "Modern Metal style",
        date: "2025-10-07",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/ritual/19)photo_2026-05-22_15-08-55.jpg",
        title: "Cooking!",
        date: "2025-03-07",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/ritual/20)photo_2026-05-22_15-09-03.jpg",
        title: "Photoshoot preps",
        date: "2025-03-17",
      },
    ],
    videos: [],
  },
  "adam & /AI/ve": {
    demo: `${AUDIO_BASE}/adam.mp3`,
    photos: [
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/adam/21)photo_2026-05-22_15-09-09.jpg",
        title: "NBA Nik",
        date: "2025-04-07",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/adam/22)photo_2026-05-22_15-09-13.jpg",
        title: "Chained Agent Ra",
        date: "2026-03-07",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/adam/23)photo_2026-05-22_15-09-18.jpg",
        title: "Mihas Style",
        date: "2025-04-07",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/adam/24)photo_2026-05-22_15-09-45.jpg",
        title: "I am not your toy!",
        date: "2025-02-07",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/adam/25)photo_2026-05-22_15-09-53.jpg",
        title: "Hulio Smotrish?",
        date: "2025-03-09",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/adam/26)photo_2026-05-22_15-09-57.jpg",
        title: "Dead Insiders",
        date: "2025-05-07",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/adam/27)photo_2026-05-22_15-10-02.jpg",
        title: "Comppetitor",
        date: "2026-02-01",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/adam/28)photo_2026-05-22_15-10-06.jpg",
        title: "Beautiful Nik",
        date: "2025-05-10",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/adam/29)photo_2026-05-22_15-10-13.jpg",
        title: "Art",
        date: "2025-07-07",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/adam/30)photo_2026-05-22_15-10-51.jpg",
        title: "I am leaving the band!",
        date: "2025-08-15",
      },
    ],
    videos: [],
  },
  "samur<AI/> protocol": {
    demo: `${AUDIO_BASE}/samurai.mp3`,
    photos: [
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/samurai/41)photo_2026-05-22_15-12-36.jpg",
        title: "Alma mater",
        date: "2025-10-15",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/samurai/42)photo_2026-05-22_15-11-01.jpg",
        title: "Alma mater Entrance. Find us!",
        date: "2025-10-15",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/samurai/43)photo_2026-05-22_15-12-47.jpg",
        title: "Back to school, biatch!",
        date: "2025-12-15",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/samurai/44)photo_2026-05-22_15-12-54.jpg",
        title: "=ДОБРА И ПОЗИТИВА=",
        date: "2026-01-01",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/samurai/45)photo_2026-05-22_15-12-58.jpg",
        title: "Egorka is tired :(",
        date: "2026-01-10",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/samurai/46)photo_2026-05-22_15-13-04.jpg",
        title: "First 2026 show!",
        date: "2026-01-10",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/samurai/47)photo_2026-05-22_15-13-09.jpg",
        title: "Gulman",
        date: "2026-01-23",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/samurai/48)photo_2026-05-22_15-13-14.jpg",
        title: "First 2026 show fans!",
        date: "2025-01-10",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/samurai/49)photo_2026-05-22_15-13-18.jpg",
        title: "Cooking classes",
        date: "2026-02-12",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/samurai/50)photo_2026-05-22_15-13-23.jpg",
        title: "My swamp!",
        date: "2026-02-07",
      },
    ],
    videos: [],
  },
  "r<AI/>sing": {
    demo: `${AUDIO_BASE}/rising.mp3`,
    photos: [
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/rising/51)photo_2026-05-22_15-13-28.jpg",
        title: "Welcome to Sosnowiec!",
        date: "2026-02-28",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/rising/52)photo_2026-05-22_15-13-32.jpg",
        title: "Welcome to Częstochowa",
        date: "2026-02-27",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/rising/61)photo_2026-05-22_15-14-17.jpg",
        title: "Whats in the box?!?!?!",
        date: "2026-04-03",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/rising/54)photo_2026-05-22_15-13-40.jpg",
        title: "Portuguese burger with interesting name",
        date: "2026-04-07",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/rising/55)photo_2026-05-22_15-13-44.jpg",
        title: "Alma mater and touring life!",
        date: "2026-03-15",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/rising/56)photo_2026-05-22_15-13-48.jpg",
        title: "Devil eats banana bread",
        date: "2026-03-01",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/rising/57)photo_2026-05-22_15-13-52.jpg",
        title: "Concept art. Are you buying it???",
        date: "2026-04-14",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/rising/58)photo_2026-05-22_15-13-56.jpg",
        title: "Boys shopping",
        date: "2026-04-17",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/rising/59)photo_2026-05-22_15-14-01.jpg",
        title: "Where am I? Who am I?",
        date: "2026-04-18",
      },
      {
        src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/gallery/rising/60)photo_2026-05-22_15-14-04.jpg",
        title: "samur<AI/> protocol engaged!",
        date: "2026-04-21",
      },
    ],
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
