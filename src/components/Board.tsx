import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import lottie from "lottie-web";
import ReviewPopup from "./ReviewPopup";
import chipImg from "../assets/Chip.jpg";
import dranixLogo from "../assets/Dranix logo.svg";
import doorLeft from "../assets/door-left.svg";
import doorRight from "../assets/door-right.svg";
import type { SongLabel } from "../constants/songs";

/* ───── Types ───── */

type WireColor = "yellow" | "cyan" | "red" | "magenta" | "green" | "orange";

export type NodeType = "prompt" | "rhythm" | "drawing" | "riddle" | "puzzle" | "memory" | "wire";

interface SongChip {
  id: number;
  label: SongLabel;
  x: number;
  y: number;
  audioSrc?: string;
  puzzleImage?: string;
}

interface ViewState {
  x: number;
  y: number;
  scale: number;
}

interface PromptReview {
  type: "prompt";
  name: string;
  prompt: string;
  text: string;
}

interface RhythmReview {
  type: "rhythm";
  name: string;
  taps: number[];
  duration: number;
}

interface DrawingReview {
  type: "drawing";
  name: string;
  imageDataUrl: string;
}

interface RiddleReview {
  type: "riddle";
  name: string;
  correct: boolean;
}

interface PuzzleReview {
  type: "puzzle";
  name: string;
  moves: number;
}

interface MemoryReview {
  type: "memory";
  name: string;
  flips: number;
}

interface WireReview {
  type: "wire";
  name: string;
  lines: number;
}

export type Review = PromptReview | RhythmReview | DrawingReview | RiddleReview | PuzzleReview | MemoryReview | WireReview;

interface PathData {
  sourceChipId: number;
  nodes: { x: number; y: number }[];
  color: WireColor;
  reachedChipId?: number;
  reviews: Review[];
}

interface PendingGhost {
  x: number;
  y: number;
  unlocks?: SongChip;
  nodeType: NodeType;
  audioSrc?: string;
  puzzleImage?: string;
  difficulty: number;
}

/** Deterministic node type from grid coordinates (checkerboard pattern) */
function getNodeTypeForPosition(x: number, y: number): NodeType {
  const gx = Math.round(x / GRID);
  const gy = Math.round(y / GRID);
  const idx = ((((gx % 4) + 4) % 4) + (((gy % 4) + 4) % 4)) % 4;
  const types: NodeType[] = [/* "prompt", */ /* "rhythm", */ /* "drawing", */ "riddle", "puzzle", "memory", "wire"];
  return types[idx];
}

/* ───── Constants ───── */

const MIN_SCALE = 0.5;
const MAX_SCALE = 5;
const ZOOM_SENSITIVITY = 0.008;
const GRID = 40; // grid spacing in px
const CHIP_SIZE = 160; // 4 grid cells — edge at 80px = 2×GRID, aligns perfectly
// Chip zone: ±2 grid cells from center are blocked except 8 anchors
// Unlock only when a node lands exactly on a chip anchor

const BOARD_PADDING = 1800;
const BOARD_MIN_X = -480 - BOARD_PADDING;
const BOARD_MAX_X = 480 + BOARD_PADDING;
const BOARD_MIN_Y = -480 - BOARD_PADDING;
const BOARD_MAX_Y = 480 + BOARD_PADDING;

const WIRE_COLORS: Record<WireColor, string> = {
  yellow: "#f9ce0f",
  cyan: "#1ba6c4",
  red: "#df0221",
  magenta: "#df0221",
  green: "#77c56e",
  orange: "#e9691a",
};

const COLOR_CYCLE: WireColor[] = [
  "yellow",
  "cyan",
  "red",
  "yellow",
  "cyan",
  "red",
  "yellow",
  "cyan",
  "green",
  "orange",
];

/* ───── Song chip positions (aligned to 40px grid) ───── */

const SONGS: SongChip[] = [
  { id: 1, label: "de(A)d ins(I)de", x: 0, y: 0, audioSrc: "songs/dead.mp3", puzzleImage: "puzzleImages/dead.jpg" },
  { id: 2, label: "de[AR] sinner", x: -480, y: -480, audioSrc: "songs/sinner.mp3", puzzleImage: "puzzleImages/sinner.jpg" },
  { id: 3, label: "r{IT}ual", x: 480, y: -480, audioSrc: "songs/ritual.mp3", puzzleImage: "puzzleImages/ritual.jpg" },
  { id: 4, label: "adam & /AI/ve", x: -480, y: 480, audioSrc: "songs/adam.mp3", puzzleImage: "puzzleImages/adam.jpg" },
  { id: 5, label: "samur<AI/> protocol", x: 480, y: 480, audioSrc: "songs/samurai.mp3", puzzleImage: "puzzleImages/samurai.jpg" },
  { id: 6, label: "r<AI/>sing", x: 0, y: -480, audioSrc: "songs/AdultPanda.wav" },
  { id: 7, label: "effes", x: 0, y: 480, audioSrc: "songs/effes.mp3" },
  { id: 8, label: "pizda", x: -480, y: 0, audioSrc: "songs/Pizda.mp3" },
  { id: 9, label: "doshik", x: 480, y: 0, audioSrc: "songs/Doshik.mp3" },
];

/* ───── 8-direction offsets ───── */

const DIRS: { dx: number; dy: number }[] = [
  { dx: 0, dy: -GRID }, // top
  { dx: GRID, dy: -GRID }, // top-right
  { dx: GRID, dy: 0 }, // right
  { dx: GRID, dy: GRID }, // bottom-right
  { dx: 0, dy: GRID }, // bottom
  { dx: -GRID, dy: GRID }, // bottom-left
  { dx: -GRID, dy: 0 }, // left
  { dx: -GRID, dy: -GRID }, // top-left
];

/* ───── Helpers ───── */

function cellKey(x: number, y: number): string {
  return `${x},${y}`;
}

/** Is this position inside any chip's exclusion zone?
 *  Blocks all grid cells within ±2 cells of a chip center,
 *  EXCEPT the 8 anchor positions (mid-sides + corners). */
function isInChipZone(x: number, y: number, songs: SongChip[]): boolean {
  for (const s of songs) {
    const gx = Math.round((x - s.x) / GRID);
    const gy = Math.round((y - s.y) / GRID);
    if (Math.abs(gx) > 2 || Math.abs(gy) > 2) continue; // outside chip area

    // Inside the 5×5 chip zone — only allow the 8 anchor positions
    const isAnchor =
      (Math.abs(gx) === 2 || gx === 0) &&
      (Math.abs(gy) === 2 || gy === 0) &&
      !(gx === 0 && gy === 0);
    if (!isAnchor) return true; // blocked
  }
  return false;
}

/** Find a locked chip if this position matches one of its 8 edge anchors exactly */
function findReachableChip(
  x: number,
  y: number,
  songs: SongChip[],
  unlocked: Set<number>,
): SongChip | undefined {
  for (const s of songs) {
    if (unlocked.has(s.id)) continue;
    const anchors = getChipAnchors(s);
    if (anchors.some((a) => a.x === x && a.y === y)) return s;
  }
  return undefined;
}

/** Get opposite direction index (0↔4, 1↔5, 2↔6, 3↔7) */
function oppositeDir(dirIdx: number): number {
  return (dirIdx + 4) % 8;
}

/** Get the direction index from prev to current position */
function getDirIndex(
  prevX: number,
  prevY: number,
  curX: number,
  curY: number,
): number {
  const dx = curX - prevX;
  const dy = curY - prevY;
  return DIRS.findIndex((d) => d.dx === dx && d.dy === dy);
}

/** Compute valid ghost positions from a head position */
function getGhostPositions(
  headX: number,
  headY: number,
  prevX: number | null, // null if building from chip (no previous node)
  prevY: number | null,
  occupied: Set<string>,
  songs: SongChip[],
  unlocked: Set<number>,
  sourceChipId?: number, // block going back into source chip zone
): { x: number; y: number; unlocks?: SongChip }[] {
  const lastDirIdx =
    prevX !== null && prevY !== null
      ? getDirIndex(prevX, prevY, headX, headY)
      : -1;

  const ghosts: { x: number; y: number; unlocks?: SongChip }[] = [];

  // Collect source chip anchor positions to block them
  const sourceAnchors = new Set<string>();
  if (sourceChipId !== undefined) {
    const sourceChip = songs.find((s) => s.id === sourceChipId);
    if (sourceChip) {
      for (const a of getChipAnchors(sourceChip)) {
        sourceAnchors.add(cellKey(a.x, a.y));
      }
    }
  }

  for (let i = 0; i < DIRS.length; i++) {
    // Can't go in the exact opposite direction
    if (lastDirIdx >= 0 && i === oppositeDir(lastDirIdx)) continue;

    const nx = headX + DIRS[i].dx;
    const ny = headY + DIRS[i].dy;

    // Can't overlap existing nodes
    if (occupied.has(cellKey(nx, ny))) continue;

    // Can't go back into source chip zone
    if (sourceAnchors.has(cellKey(nx, ny))) continue;

    // Check if this position would unlock a chip
    const reachable = findReachableChip(nx, ny, songs, unlocked);
    if (reachable) {
      ghosts.push({ x: nx, y: ny, unlocks: reachable });
      continue;
    }

    // Can't be inside any chip's zone
    if (isInChipZone(nx, ny, songs)) continue;

    ghosts.push({ x: nx, y: ny });
  }

  return ghosts;
}

/** Get the "exit" grid position for starting a path from a chip */
function getChipExitPositions(
  chip: SongChip,
  occupied: Set<string>,
  songs: SongChip[],
  unlocked: Set<number>,
): { x: number; y: number; unlocks?: SongChip }[] {
  const ghosts: { x: number; y: number; unlocks?: SongChip }[] = [];

  // Try positions at 3 grid cells out from center in each direction
  // (outside the chip exclusion zone)
  for (const dir of DIRS) {
    const scale = 3; // 3 grid cells from center = 1 step past the ±2 zone
    const nx = chip.x + dir.dx * scale;
    const ny = chip.y + dir.dy * scale;

    if (occupied.has(cellKey(nx, ny))) continue;

    const reachable = findReachableChip(nx, ny, songs, unlocked);
    if (reachable) {
      ghosts.push({ x: nx, y: ny, unlocks: reachable });
      continue;
    }

    if (isInChipZone(nx, ny, songs)) continue;

    ghosts.push({ x: nx, y: ny });
  }

  return ghosts;
}

/* ───── Main Board Component ───── */

export default function Board() {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const [view, setView] = useState<ViewState>({ x: 0, y: 0, scale: 1 });
  const [panning, setPanning] = useState(false);
  const isPanning = useRef(false);
  const dragMoved = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const lastPinchDist = useRef(0);

  const [paths, setPaths] = useState<PathData[]>(() => [
    // Mock path: Song 1 → up toward Song 6 (5 nodes)
    {
      sourceChipId: 1,
      color: "yellow",
      nodes: [
        { x: 0, y: -120 },
        { x: 0, y: -160 },
        { x: 0, y: -200 },
        { x: 0, y: -240 },
        { x: 0, y: -280 },
      ],
      reviews: [
        {
          type: "prompt",
          name: "Alex",
          prompt: "Describe this song in 3 words",
          text: "Dark, raw, electric",
        },
        {
          type: "riddle",
          name: "Maria",
          correct: true,
        },
        {
          type: "prompt",
          name: "DJ_K",
          prompt: "What color is this track?",
          text: "Deep crimson with neon green edges",
        },
        {
          type: "riddle",
          name: "Luna",
          correct: false,
        },
        {
          type: "prompt",
          name: "Max",
          prompt: "In what movie could this track play?",
          text: "The Matrix, definitely the lobby scene",
        },
      ],
    },
  ]);
  const [unlockedChips, setUnlockedChips] = useState<Set<number>>(new Set([1]));
  const [activePathIdx, setActivePathIdx] = useState<number | null>(null);
  const [buildingFromChip, setBuildingFromChip] = useState<number | null>(null);
  const [recentlyUnlocked, setRecentlyUnlocked] = useState<Set<number>>(
    new Set(),
  );
  const [pendingGhost, setPendingGhost] = useState<PendingGhost | null>(null);
  const [viewingReview, setViewingReview] = useState<{
    songName: string;
    review: Review;
  } | null>(null);
  const [playingChip, setPlayingChip] = useState<SongChip | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioVolume, setAudioVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<number>(0);
  const [skipReview, setSkipReview] = useState(false);
  const [introOpen, setIntroOpen] = useState(true);

  // Reactions: per-chip selected reaction for current user + total counts
  const [chipReactions, setChipReactions] = useState<
    Record<number, { selected: string | null; counts: Record<string, number> }>
  >({});

  const handleReaction = useCallback((chipId: number, reactionId: string) => {
    setChipReactions((prev) => {
      const chip = prev[chipId] ?? { selected: null, counts: {} };
      const counts = { ...chip.counts };

      // Remove previous selection
      if (chip.selected) {
        counts[chip.selected] = Math.max(0, (counts[chip.selected] ?? 0) - 1);
      }

      // Toggle: if same reaction clicked again, just deselect
      const newSelected = chip.selected === reactionId ? null : reactionId;
      if (newSelected) {
        counts[newSelected] = (counts[newSelected] ?? 0) + 1;
      }

      return { ...prev, [chipId]: { selected: newSelected, counts } };
    });
  }, []);

  // Occupied cells (all placed nodes)
  const occupied = useMemo(() => {
    const set = new Set<string>();
    for (const p of paths) {
      for (const n of p.nodes) {
        set.add(cellKey(n.x, n.y));
      }
    }
    return set;
  }, [paths]);

  // Ghost nodes to show
  const ghosts = useMemo(() => {
    // Building from a chip (new path, no nodes yet)
    if (buildingFromChip !== null) {
      const chip = SONGS.find((s) => s.id === buildingFromChip);
      if (!chip) return [];
      return getChipExitPositions(chip, occupied, SONGS, unlockedChips);
    }

    // Extending an active path
    if (activePathIdx !== null && paths[activePathIdx]) {
      const path = paths[activePathIdx];
      if (path.reachedChipId !== undefined) return []; // completed path
      const nodes = path.nodes;
      if (nodes.length === 0) return [];
      const head = nodes[nodes.length - 1];
      // When only 1 node, use source chip center as "previous" to block going back toward it
      const sourceChip = SONGS.find((s) => s.id === path.sourceChipId);
      const prev =
        nodes.length > 1
          ? nodes[nodes.length - 2]
          : sourceChip
            ? { x: sourceChip.x, y: sourceChip.y }
            : null;
      return getGhostPositions(
        head.x,
        head.y,
        prev?.x ?? null,
        prev?.y ?? null,
        occupied,
        SONGS,
        unlockedChips,
        path.sourceChipId,
      );
    }

    return [];
  }, [buildingFromChip, activePathIdx, paths, occupied, unlockedChips]);

  // Current wire color for ghosts
  const activeColor = useMemo(() => {
    if (activePathIdx !== null && paths[activePathIdx]) {
      return WIRE_COLORS[paths[activePathIdx].color];
    }
    if (buildingFromChip !== null) {
      return WIRE_COLORS[COLOR_CYCLE[paths.length % COLOR_CYCLE.length]];
    }
    return WIRE_COLORS.yellow;
  }, [activePathIdx, buildingFromChip, paths]);

  /* ── Audio Player ── */

  const playAudio = useCallback(
    (chip: SongChip) => {
      if (!chip.audioSrc) return;

      // If clicking the same chip that's already playing, toggle play/pause
      if (playingChip?.id === chip.id && audioRef.current) {
        if (isAudioPlaying) {
          audioRef.current.pause();
          setIsAudioPlaying(false);
        } else {
          audioRef.current.play();
          setIsAudioPlaying(true);
        }
        return;
      }

      // Stop previous
      if (audioRef.current) {
        audioRef.current.pause();
        clearInterval(progressIntervalRef.current);
      }

      const base = import.meta.env.BASE_URL;
      const audio = new Audio(`${base}${chip.audioSrc}`);
      audioRef.current = audio;
      setPlayingChip(chip);
      setAudioProgress(0);
      setAudioDuration(0);

      audio.onloadedmetadata = () => setAudioDuration(audio.duration);
      audio.onended = () => {
        setIsAudioPlaying(false);
        setAudioProgress(audio.duration);
        clearInterval(progressIntervalRef.current);
      };

      audio.volume = audioVolume;
      audio.play();
      setIsAudioPlaying(true);

      progressIntervalRef.current = window.setInterval(() => {
        if (audio) setAudioProgress(audio.currentTime);
      }, 250);
    },
    [playingChip, isAudioPlaying, audioVolume],
  );

  const toggleAudioPlayback = useCallback(() => {
    if (!audioRef.current) return;
    if (isAudioPlaying) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    } else {
      audioRef.current.play();
      setIsAudioPlaying(true);
    }
  }, [isAudioPlaying]);

  const seekAudio = useCallback(
    (fraction: number) => {
      if (!audioRef.current || !audioDuration) return;
      audioRef.current.currentTime = fraction * audioDuration;
      setAudioProgress(audioRef.current.currentTime);
    },
    [audioDuration],
  );

  const changeVolume = useCallback((vol: number) => {
    setAudioVolume(vol);
    if (audioRef.current) audioRef.current.volume = vol;
  }, []);

  const closeAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    clearInterval(progressIntervalRef.current);
    setPlayingChip(null);
    setIsAudioPlaying(false);
    setAudioProgress(0);
    setAudioDuration(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      clearInterval(progressIntervalRef.current);
    };
  }, []);

  /* ── Pan / Zoom ── */

  const clampView = useCallback((v: ViewState): ViewState => {
    const el = containerRef.current;
    if (!el) return v;
    const w = el.clientWidth;
    const h = el.clientHeight;
    const boardW = (BOARD_MAX_X - BOARD_MIN_X) * v.scale;
    const boardH = (BOARD_MAX_Y - BOARD_MIN_Y) * v.scale;
    let x = v.x,
      y = v.y;

    if (boardW <= w) {
      x = (w - (BOARD_MIN_X + BOARD_MAX_X) * v.scale) / 2;
    } else {
      const minX = w - BOARD_MAX_X * v.scale;
      const maxX = -BOARD_MIN_X * v.scale;
      x = Math.min(maxX, Math.max(minX, x));
    }
    if (boardH <= h) {
      y = (h - (BOARD_MIN_Y + BOARD_MAX_Y) * v.scale) / 2;
    } else {
      const minY = h - BOARD_MAX_Y * v.scale;
      const maxY = -BOARD_MIN_Y * v.scale;
      y = Math.min(maxY, Math.max(minY, y));
    }
    return { ...v, x, y };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isPanning.current = true;
    dragMoved.current = false;
    setPanning(true);
    lastMouse.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning.current) return;
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) dragMoved.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      setView((v) => clampView({ ...v, x: v.x + dx, y: v.y + dy }));
    },
    [clampView],
  );

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
    dragMoved.current = false;
    setPanning(false);
  }, []);

  /* ── Touch (pan + pinch-zoom) ── */

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isPanning.current = true;
      dragMoved.current = false;
      setPanning(true);
      lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      isPanning.current = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDist.current = Math.hypot(dx, dy);
      lastMouse.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1 && isPanning.current) {
        const dx = e.touches[0].clientX - lastMouse.current.x;
        const dy = e.touches[0].clientY - lastMouse.current.y;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) dragMoved.current = true;
        lastMouse.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
        setView((v) => clampView({ ...v, x: v.x + dx, y: v.y + dy }));
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        if (lastPinchDist.current > 0) {
          const container = containerRef.current;
          if (container) {
            const rect = container.getBoundingClientRect();
            const midX =
              (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
            const midY =
              (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
            const scaleFactor = dist / lastPinchDist.current;
            setView((v) => {
              const newScale = Math.min(
                MAX_SCALE,
                Math.max(MIN_SCALE, v.scale * scaleFactor),
              );
              const ratio = newScale / v.scale;
              return clampView({
                x: midX - ratio * (midX - v.x),
                y: midY - ratio * (midY - v.y),
                scale: newScale,
              });
            });
          }
        }
        lastPinchDist.current = dist;
      }
    },
    [clampView],
  );

  const handleTouchEnd = useCallback(() => {
    isPanning.current = false;
    setPanning(false);
    lastPinchDist.current = 0;
    setTimeout(() => {
      dragMoved.current = false;
    }, 0);
  }, []);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;
      setView((v) => {
        const delta = -e.deltaY * ZOOM_SENSITIVITY;
        const newScale = Math.min(
          MAX_SCALE,
          Math.max(MIN_SCALE, v.scale * (1 + delta)),
        );
        const ratio = newScale / v.scale;
        return clampView({
          x: cursorX - ratio * (cursorX - v.x),
          y: cursorY - ratio * (cursorY - v.y),
          scale: newScale,
        });
      });
    },
    [clampView],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  useEffect(() => {
    if (initialized.current) return;
    const el = containerRef.current;
    if (!el) return;
    initialized.current = true;

    const cx = el.clientWidth / 2;
    const cy = el.clientHeight / 2;
    const startScale = 5;
    const endScale = 1.15;
    const duration = 1400;
    const start = performance.now();

    setView({ x: cx, y: cy, scale: startScale });

    // Start panels opening
    setTimeout(() => setIntroOpen(false), 300);

    const animate = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const ease = 1 - Math.pow(1 - t, 3);
      const scale = startScale + (endScale - startScale) * ease;
      setView({ x: cx, y: cy, scale });
      if (t < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const up = () => {
      isPanning.current = false;
      dragMoved.current = false;
      setPanning(false);
      lastPinchDist.current = 0;
    };
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);
    window.addEventListener("touchcancel", up);
    return () => {
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchend", up);
      window.removeEventListener("touchcancel", up);
    };
  }, []);

  /* ── Click: deselect when clicking empty board ── */
  const handleBoardClick = useCallback(() => {
    if (dragMoved.current) return;
    setActivePathIdx(null);
    setBuildingFromChip(null);
  }, []);

  /* ── Click: chip ── */
  const handleChipClick = useCallback(
    (chipId: number) => {
      if (dragMoved.current) return;
      if (!unlockedChips.has(chipId)) return;

      // Start building a new path from this chip
      setActivePathIdx(null);
      setBuildingFromChip(chipId);
    },
    [unlockedChips],
  );

  /* ── Click: ghost node → open review popup ── */
  const handleGhostClick = useCallback(
    (gx: number, gy: number, unlocks?: SongChip) => {
      if (dragMoved.current) return;
      if (skipReview) {
        // Place node directly without review
        const review: Review = { type: "prompt", name: "dev", prompt: "—", text: "—" };
        if (buildingFromChip !== null) {
          const color = COLOR_CYCLE[paths.length % COLOR_CYCLE.length];
          const newPath: PathData = {
            sourceChipId: buildingFromChip,
            nodes: [{ x: gx, y: gy }],
            color,
            reachedChipId: unlocks?.id,
            reviews: [review],
          };
          const newIdx = paths.length;
          setPaths((prev) => [...prev, newPath]);
          setBuildingFromChip(null);
          if (unlocks) {
            setUnlockedChips((prev) => new Set([...prev, unlocks.id]));
            setRecentlyUnlocked(new Set([unlocks.id]));
            setTimeout(() => setRecentlyUnlocked(new Set()), 1500);
            setActivePathIdx(null);
          } else {
            setActivePathIdx(newIdx);
          }
        } else if (activePathIdx !== null) {
          setPaths((prev) => {
            const next = [...prev];
            const path = { ...next[activePathIdx] };
            path.nodes = [...path.nodes, { x: gx, y: gy }];
            path.reviews = [...path.reviews, review];
            if (unlocks) path.reachedChipId = unlocks.id;
            next[activePathIdx] = path;
            return next;
          });
          if (unlocks) {
            setUnlockedChips((prev) => new Set([...prev, unlocks.id]));
            setRecentlyUnlocked(new Set([unlocks.id]));
            setTimeout(() => setRecentlyUnlocked(new Set()), 1500);
            setActivePathIdx(null);
          }
        }
      } else {
        const chipId = buildingFromChip ?? (activePathIdx !== null ? paths[activePathIdx]?.sourceChipId : null);
        const chip = chipId != null ? SONGS.find((s) => s.id === chipId) : undefined;
        setPendingGhost({
          x: gx,
          y: gy,
          unlocks,
          nodeType: getNodeTypeForPosition(gx, gy),
          audioSrc: chip?.audioSrc,
          puzzleImage: chip?.puzzleImage,
          difficulty: Math.min(1, Math.hypot(gx, gy) / 700),
        });
      }
    },
    [skipReview, buildingFromChip, activePathIdx, paths],
  );

  /* ── Get the source song name for the current build context ── */
  const pendingSongName = useMemo(() => {
    if (buildingFromChip !== null) {
      return SONGS.find((s) => s.id === buildingFromChip)?.label ?? "Song";
    }
    if (activePathIdx !== null && paths[activePathIdx]) {
      return (
        SONGS.find((s) => s.id === paths[activePathIdx].sourceChipId)?.label ??
        "Song"
      );
    }
    return "Song";
  }, [buildingFromChip, activePathIdx, paths]);

  /* ── Review submitted → place the node ── */
  const handleReviewSubmit = useCallback(
    (review: Review) => {
      if (!pendingGhost) return;
      const { x: gx, y: gy, unlocks } = pendingGhost;

      if (buildingFromChip !== null) {
        const color = COLOR_CYCLE[paths.length % COLOR_CYCLE.length];
        const newPath: PathData = {
          sourceChipId: buildingFromChip,
          nodes: [{ x: gx, y: gy }],
          color,
          reachedChipId: unlocks?.id,
          reviews: [review],
        };
        const newIdx = paths.length;
        setPaths((prev) => [...prev, newPath]);
        setBuildingFromChip(null);

        if (unlocks) {
          setUnlockedChips((prev) => new Set([...prev, unlocks.id]));
          setRecentlyUnlocked(new Set([unlocks.id]));
          setTimeout(() => setRecentlyUnlocked(new Set()), 1500);
          setActivePathIdx(null);
        } else {
          setActivePathIdx(newIdx);
        }
      } else if (activePathIdx !== null) {
        setPaths((prev) => {
          const next = [...prev];
          const path = { ...next[activePathIdx] };
          path.nodes = [...path.nodes, { x: gx, y: gy }];
          path.reviews = [...path.reviews, review];
          if (unlocks) {
            path.reachedChipId = unlocks.id;
          }
          next[activePathIdx] = path;
          return next;
        });

        if (unlocks) {
          setUnlockedChips((prev) => new Set([...prev, unlocks.id]));
          setRecentlyUnlocked(new Set([unlocks.id]));
          setTimeout(() => setRecentlyUnlocked(new Set()), 1500);
          setActivePathIdx(null);
        }
      }

      setPendingGhost(null);
    },
    [pendingGhost, buildingFromChip, activePathIdx, paths],
  );

  /* ── Click: placed node → view review ── */
  const handleNodeClick = useCallback(
    (pathIdx: number, nodeIdx: number) => {
      if (dragMoved.current) return;
      const path = paths[pathIdx];
      if (!path || !path.reviews[nodeIdx]) return;
      const songName =
        SONGS.find((s) => s.id === path.sourceChipId)?.label ?? "Song";
      setViewingReview({ songName, review: path.reviews[nodeIdx] });
    },
    [paths],
  );

  /* ── Click: path head (last node) to re-activate ── */
  const handleHeadClick = useCallback(
    (pathIdx: number) => {
      if (dragMoved.current) return;
      const path = paths[pathIdx];
      if (path.reachedChipId !== undefined) return; // completed, can't extend
      setBuildingFromChip(null);
      setActivePathIdx(pathIdx);
    },
    [paths],
  );

  return (
    <div
      ref={containerRef}
      className="w-screen h-screen overflow-hidden select-none"
      id="pcb-board"
      style={{ cursor: panning ? "grabbing" : "grab", touchAction: "none" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleBoardClick}
    >
      <div
        style={{
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
          transformOrigin: "0 0",
        }}
      >
        {/* CSS grid background */}
        <div
          style={{
            position: "absolute",
            left: -3200,
            top: -3200,
            width: 6400,
            height: 6400,
            backgroundImage: `linear-gradient(to right, rgba(249,206,15,0.12) 1px, transparent 1px),
               linear-gradient(to bottom, rgba(249,206,15,0.12) 1px, transparent 1px)`,
            backgroundSize: `${GRID}px ${GRID}px`,
            backgroundPosition: "0 0",
            pointerEvents: "none",
          }}
        />

        {/* SVG Wire + Node Layer */}
        <svg
          viewBox="-700 -700 1400 1400"
          style={{
            position: "absolute",
            left: -700,
            top: -700,
            width: 1400,
            height: 1400,
            pointerEvents: "none",
            overflow: "visible",
            zIndex: 20,
          }}
        >
          <defs>
            {Object.entries(WIRE_COLORS).map(([name]) => (
              <filter
                key={name}
                id={`glow-${name}`}
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur
                  in="SourceGraphic"
                  stdDeviation="4"
                  result="blur"
                />
                <feColorMatrix
                  in="blur"
                  type="matrix"
                  values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1.5 0`}
                  result="bright"
                />
                <feMerge>
                  <feMergeNode in="bright" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
          </defs>

          {/* Socket connectors temporarily disabled */}

          {/* Rendered paths (on top of sockets so nodes overlap them) */}
          {paths.map((path, idx) => (
            <PathSVG
              key={idx}
              path={path}
              pathIdx={idx}
              isActive={activePathIdx === idx}
              onHeadClick={handleHeadClick}
              onNodeClick={handleNodeClick}
              chipSource={SONGS.find((s) => s.id === path.sourceChipId)!}
            />
          ))}

          {/* Ghost nodes */}
          {ghosts.map((g) => (
            <GhostNode
              key={cellKey(g.x, g.y)}
              x={g.x}
              y={g.y}
              color={activeColor}
              unlocks={g.unlocks}
              nodeType={getNodeTypeForPosition(g.x, g.y)}
              onClick={() => handleGhostClick(g.x, g.y, g.unlocks)}
            />
          ))}
        </svg>

        {/* Song chips */}
        {SONGS.map((song) => (
          <Chip
            key={song.id}
            song={song}
            unlocked={unlockedChips.has(song.id)}
            recentlyUnlocked={recentlyUnlocked.has(song.id)}
            isBuilding={buildingFromChip === song.id}
            isPlaying={playingChip?.id === song.id && isAudioPlaying}
            onClick={() => handleChipClick(song.id)}
            onPlay={() => playAudio(song)}
            selectedReaction={chipReactions[song.id]?.selected ?? null}
            reactionCounts={chipReactions[song.id]?.counts ?? {}}
            onReaction={(reactionId) => handleReaction(song.id, reactionId)}
          />
        ))}
      </div>

      {/* Review write popup */}
      {pendingGhost && (
        <ReviewPopup
          songName={pendingSongName}
          nodeType={pendingGhost.nodeType}
          audioSrc={pendingGhost.audioSrc}
          puzzleImage={pendingGhost.puzzleImage}
          difficulty={pendingGhost.difficulty}
          onSubmit={(review: Review) => handleReviewSubmit(review)}
          onClose={() => setPendingGhost(null)}
        />
      )}

      {/* Intro panels */}
      <div
        className="fixed inset-y-0 left-0 pointer-events-none"
        style={{
          width: "50%",
          background: `#000 url(${doorLeft}) center/cover no-repeat`,
          zIndex: 200,
          transform: introOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 1.2s cubic-bezier(0.65, 0, 0.35, 1)",
        }}
      />
      <div
        className="fixed inset-y-0 right-0 pointer-events-none"
        style={{
          width: "50%",
          background: `#000 url(${doorRight}) center/cover no-repeat`,
          zIndex: 200,
          transform: introOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 1.2s cubic-bezier(0.65, 0, 0.35, 1)",
        }}
      />

      {/* Dev Tools */}
      <div
        className="fixed top-4 left-4"
        style={{
          zIndex: 100,
          background: "rgba(0,0,0,0.85)",
          border: "1px solid rgba(249,206,15,0.2)",
          borderRadius: 8,
          padding: "10px 14px",
          fontFamily: "'Barlow', sans-serif",
          fontSize: 11,
          color: "rgba(255,255,255,0.6)",
        }}
      >
        <div
          style={{
            fontSize: 9,
            color: "rgba(249,206,15,0.5)",
            marginBottom: 8,
            letterSpacing: 1,
          }}
        >
          DEV TOOLS
        </div>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={skipReview}
            onChange={(e) => setSkipReview(e.target.checked)}
            style={{ accentColor: "#f9ce0f" }}
          />
          Skip reviews
        </label>
      </div>

      {/* Stats */}
      <div
        className="fixed top-4 right-4 pointer-events-none"
        style={{
          zIndex: 100,
          fontFamily: "monospace",
          fontSize: 10,
          color: "rgba(249,206,15,0.5)",
          textAlign: "right",
          lineHeight: 1.8,
          letterSpacing: 0.5,
        }}
      >
        <div>
          CHIPS_ACTIVE: {unlockedChips.size}/{SONGS.length}
        </div>
        <div>PATHS_BUILT: {paths.length}</div>
        <div>
          NODES_TOTAL: {paths.reduce((sum, p) => sum + p.nodes.length, 0)}
        </div>
        <div>
          BOARD_STATUS:{" "}
          {unlockedChips.size === SONGS.length
            ? "COMPLETE"
            : `${Math.round((unlockedChips.size / SONGS.length) * 100)}%`}
        </div>
      </div>

      {/* Legend */}
      <div
        className="fixed bottom-4 right-4 text-white/30 pointer-events-none"
        style={{
          fontFamily: "'Barlow', sans-serif",
          fontSize: 12,
          lineHeight: 1.6,
          textAlign: "right",
          zIndex: 50,
        }}
      >
        {/* TODO create a better conceptual text */}
        <div>drag to navigate // scroll to zoom</div>
        <div>click a chip → build path → leave a node</div>
        <div>
          connect all chips to un/L0CK/ the board and r{`[AI]`}se DRANIX
        </div>
      </div>

      {/* Review read popup */}
      {viewingReview && (
        <ReviewViewer
          songName={viewingReview.songName}
          review={viewingReview.review}
          onClose={() => setViewingReview(null)}
        />
      )}

      {/* Bottom audio player bar */}
      {playingChip && (
        <AudioPlayerBar
          song={playingChip}
          isPlaying={isAudioPlaying}
          progress={audioProgress}
          duration={audioDuration}
          volume={audioVolume}
          onToggle={toggleAudioPlayback}
          onSeek={seekAudio}
          onVolumeChange={changeVolume}
          onClose={closeAudio}
        />
      )}
    </div>
  );
}

/* ───── Path SVG ───── */

function PathSVG({
  path,
  pathIdx,
  isActive,
  onHeadClick,
  onNodeClick,
  chipSource,
}: {
  path: PathData;
  pathIdx: number;
  isActive: boolean;
  onHeadClick: (idx: number) => void;
  onNodeClick: (pathIdx: number, nodeIdx: number) => void;
  chipSource: SongChip;
}) {
  const color = WIRE_COLORS[path.color];
  const nodes = path.nodes;
  if (nodes.length === 0) return null;

  // Build polyline from chip edge to all nodes
  const head = nodes[nodes.length - 1];
  const first = nodes[0];

  // Find chip edge point (on the line from chip center to first node)
  const edgePt = getChipEdgePoint(chipSource, first.x, first.y);

  // If path reached a chip, find edge point to that chip too
  let endEdgePt: { x: number; y: number } | null = null;
  if (path.reachedChipId !== undefined) {
    const targetChip = SONGS.find((s) => s.id === path.reachedChipId);
    if (targetChip) {
      endEdgePt = getChipEdgePoint(targetChip, head.x, head.y);
    }
  }

  const allPoints = [edgePt, ...nodes, ...(endEdgePt ? [endEdgePt] : [])];
  const pointsStr = allPoints.map((p) => `${p.x},${p.y}`).join(" ");

  const isComplete = path.reachedChipId !== undefined;
  const canReactivate = !isComplete && !isActive;

  return (
    <g>
      {/* Base dim wire trace */}
      <polyline
        points={pointsStr}
        fill="none"
        stroke="#1a3a28"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Glowing wire */}
      <polyline
        points={pointsStr}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#glow-${path.color})`}
        opacity={0.9}
      />

      {/* Energy flow on completed paths */}
      {isComplete && (
        <polyline
          points={pointsStr}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeDasharray="4 12"
          opacity={0.6}
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="-16"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </polyline>
      )}

      {/* Placed node circles */}
      {nodes.map((n, i) => {
        const isHead = i === nodes.length - 1 && !isComplete;
        const hasReview = !!path.reviews[i];
        const reviewType = path.reviews[i]?.type;
        return (
          <g key={i} className="node-group">
            {/* Hover ring — hidden by default, shown on hover */}
            {hasReview && (
              <circle
                className="node-hover-ring"
                cx={n.x}
                cy={n.y}
                r={13}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
              />
            )}
            <circle
              cx={n.x}
              cy={n.y}
              r={7}
              fill={color}
              filter={`url(#glow-${path.color})`}
            />
            {/* Type indicator icons */}
            {reviewType === "prompt" && (
              <text
                x={n.x}
                y={n.y + 3}
                textAnchor="middle"
                fontSize={8}
                fill="#000"
                fontFamily="monospace"
                fontWeight="bold"
                opacity={0.85}
              >
                ?
              </text>
            )}
            {reviewType === "rhythm" && (
              <g opacity={0.85}>
                {/* Rhythm bars */}
                <rect x={n.x - 3.5} y={n.y - 1} width={1.2} height={4} rx={0.4} fill="#000" />
                <rect x={n.x - 1.5} y={n.y - 3} width={1.2} height={6} rx={0.4} fill="#000" />
                <rect x={n.x + 0.5} y={n.y - 2} width={1.2} height={5} rx={0.4} fill="#000" />
                <rect x={n.x + 2.3} y={n.y} width={1.2} height={3} rx={0.4} fill="#000" />
              </g>
            )}
            {reviewType === "drawing" && (
              <g opacity={0.85}>
                {/* 2x2 pixel grid */}
                <rect x={n.x - 2.5} y={n.y - 2.5} width={2} height={2} fill="#000" />
                <rect x={n.x + 0.5} y={n.y - 2.5} width={2} height={2} fill="#000" opacity={0.5} />
                <rect x={n.x - 2.5} y={n.y + 0.5} width={2} height={2} fill="#000" opacity={0.5} />
                <rect x={n.x + 0.5} y={n.y + 0.5} width={2} height={2} fill="#000" />
              </g>
            )}
            {reviewType === "riddle" && (
              <text
                x={n.x}
                y={n.y + 3}
                textAnchor="middle"
                fontSize={7}
                fill="#000"
                fontFamily="monospace"
                fontWeight="bold"
                opacity={0.85}
              >
                ?!
              </text>
            )}
            {reviewType === "puzzle" && (
              <g opacity={0.85}>
                <rect x={n.x - 2.5} y={n.y - 2.5} width={2} height={2} rx={0.3} fill="#000" />
                <rect x={n.x + 0.5} y={n.y - 2.5} width={2} height={2} rx={0.3} fill="#000" opacity={0.5} />
                <rect x={n.x - 2.5} y={n.y + 0.5} width={2} height={2} rx={0.3} fill="#000" opacity={0.5} />
              </g>
            )}
            {reviewType === "memory" && (
              <g opacity={0.85}>
                <rect x={n.x - 2.5} y={n.y - 2} width={2} height={3} rx={0.3} fill="#000" />
                <rect x={n.x + 0.5} y={n.y - 2} width={2} height={3} rx={0.3} fill="#000" opacity={0.5} />
              </g>
            )}
            {reviewType === "wire" && (
              <path
                d={`M ${n.x - 3} ${n.y + 1} Q ${n.x} ${n.y - 3}, ${n.x + 3} ${n.y}`}
                fill="none"
                stroke="#000"
                strokeWidth={1}
                strokeLinecap="round"
                opacity={0.85}
              />
            )}
            {/* Clickable hit area for every node */}
            <circle
              cx={n.x}
              cy={n.y}
              r={16}
              fill="transparent"
              style={{
                pointerEvents: "all",
                cursor: hasReview ? "pointer" : "default",
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                if (isHead && canReactivate) {
                  onHeadClick(pathIdx);
                } else if (hasReview) {
                  onNodeClick(pathIdx, i);
                }
              }}
            />
            {/* Subtle ring on head to show it extends path */}
            {isHead && canReactivate && (
              <circle
                cx={n.x}
                cy={n.y}
                r={11}
                fill="none"
                stroke={color}
                strokeWidth={1}
                opacity={0.3}
              >
                <animate
                  attributeName="r"
                  values="11;14;11"
                  dur="2.5s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.3;0.1;0.3"
                  dur="2.5s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
          </g>
        );
      })}
    </g>
  );
}

/* ───── Ghost Node ───── */

function GhostNode({
  x,
  y,
  color,
  unlocks,
  nodeType,
  onClick,
}: {
  x: number;
  y: number;
  color: string;
  unlocks?: SongChip;
  nodeType: NodeType;
  onClick: () => void;
}) {
  return (
    <g>
      {/* Large hit area */}
      <circle
        cx={x}
        cy={y}
        r={18}
        fill="transparent"
        style={{ pointerEvents: "all", cursor: "pointer" }}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      />

      {/* Ghost dot */}
      <circle
        cx={x}
        cy={y}
        r={9}
        fill={color}
        opacity={0.3}
        style={{ pointerEvents: "none" }}
      >
        <animate
          attributeName="opacity"
          values="0.3;0.55;0.3"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Type hint icon */}
      <g opacity={0.7} style={{ pointerEvents: "none" }}>
        {nodeType === "prompt" && (
          <text
            x={x}
            y={y + 4}
            textAnchor="middle"
            fontSize={12}
            fill={color}
            fontFamily="monospace"
            fontWeight="bold"
          >
            ?
          </text>
        )}
        {nodeType === "rhythm" && (
          <>
            <rect x={x - 4.5} y={y - 1} width={2} height={5} rx={0.5} fill={color} />
            <rect x={x - 1.5} y={y - 4} width={2} height={8} rx={0.5} fill={color} />
            <rect x={x + 1.5} y={y - 2.5} width={2} height={6} rx={0.5} fill={color} />
          </>
        )}
        {nodeType === "drawing" && (
          <>
            <rect x={x - 3.5} y={y - 3.5} width={3} height={3} fill={color} />
            <rect x={x + 0.5} y={y - 3.5} width={3} height={3} fill={color} opacity={0.5} />
            <rect x={x - 3.5} y={y + 0.5} width={3} height={3} fill={color} opacity={0.5} />
            <rect x={x + 0.5} y={y + 0.5} width={3} height={3} fill={color} />
          </>
        )}
        {nodeType === "riddle" && (
          <text
            x={x}
            y={y + 4}
            textAnchor="middle"
            fontSize={10}
            fill={color}
            fontFamily="monospace"
            fontWeight="bold"
          >
            ?!
          </text>
        )}
        {nodeType === "puzzle" && (
          <>
            <rect x={x - 4} y={y - 4} width={3.5} height={3.5} rx={0.5} fill={color} />
            <rect x={x + 0.5} y={y - 4} width={3.5} height={3.5} rx={0.5} fill={color} opacity={0.6} />
            <rect x={x - 4} y={y + 0.5} width={3.5} height={3.5} rx={0.5} fill={color} opacity={0.6} />
            <rect x={x + 0.5} y={y + 0.5} width={3.5} height={3.5} rx={0.5} fill="none" stroke={color} strokeWidth={0.8} strokeDasharray="1.5 1" />
          </>
        )}
        {nodeType === "memory" && (
          <>
            <rect x={x - 4} y={y - 3.5} width={3.5} height={5} rx={0.5} fill={color} />
            <rect x={x + 0.5} y={y - 3.5} width={3.5} height={5} rx={0.5} fill={color} opacity={0.5} />
            <text x={x - 2.2} y={y + 0.5} fontSize={3.5} fill="#000" textAnchor="middle" fontWeight="bold">?</text>
            <text x={x + 2.2} y={y + 0.5} fontSize={3.5} fill="#000" textAnchor="middle" fontWeight="bold">?</text>
          </>
        )}
        {nodeType === "wire" && (
          <path
            d={`M ${x - 5} ${y + 2} Q ${x - 2} ${y - 4}, ${x + 1} ${y} Q ${x + 3} ${y + 3}, ${x + 5} ${y - 1}`}
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        )}
      </g>

      {/* Outer pulsing ring */}
      <circle
        cx={x}
        cy={y}
        r={13}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        opacity={0.45}
        style={{ pointerEvents: "none" }}
      >
        <animate
          attributeName="r"
          values="13;17;13"
          dur="1.5s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.4;0.1;0.4"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Unlock indicator — brighter if this ghost would unlock a chip */}
      {unlocks && (
        <circle
          cx={x}
          cy={y}
          r={8}
          fill={color}
          opacity={0.15}
          style={{ pointerEvents: "none" }}
        >
          <animate
            attributeName="opacity"
            values="0.15;0.35;0.15"
            dur="1s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="r"
            values="8;12;8"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      )}
    </g>
  );
}

/* ───── Lottie Reaction Button ───── */

function LottieReaction({
  path,
  flip,
  count,
  active,
  onReact,
}: {
  id: string;
  path: string;
  flip?: boolean;
  count: number;
  active: boolean;
  onReact: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<ReturnType<typeof lottie.loadAnimation> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const base = import.meta.env.BASE_URL;
    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop: false,
      autoplay: false,
      path: `${base}${path}`,
    });
    animRef.current = anim;
    return () => anim.destroy();
  }, [path]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!active) {
      animRef.current?.goToAndPlay(0, true);
    }
    onReact();
  };

  return (
    <button
      onClick={handleClick}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        padding: "1px 3px",
        background: active ? "rgba(249,206,15,0.12)" : "rgba(0,0,0,0.5)",
        border: active
          ? "1px solid rgba(249,206,15,0.25)"
          : "1px solid rgba(255,255,255,0.1)",
        borderRadius: 8,
        cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      <div
        ref={containerRef}
        style={{
          width: 14,
          height: 14,
          transform: flip ? "scaleY(-1)" : "none",
        }}
      />
      {count > 0 && (
        <span
          style={{
            fontSize: 8,
            fontFamily: "monospace",
            color: active ? "#f9ce0f" : "rgba(255,255,255,0.4)",
            fontWeight: 700,
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/* ───── Chip Component ───── */

function Chip({
  song,
  unlocked,
  recentlyUnlocked,
  isBuilding,
  isPlaying,
  onClick,
  onPlay,
  selectedReaction,
  reactionCounts,
  onReaction,
}: {
  song: SongChip;
  unlocked: boolean;
  recentlyUnlocked: boolean;
  isBuilding: boolean;
  isPlaying: boolean;
  onClick: () => void;
  onPlay: () => void;
  selectedReaction: string | null;
  reactionCounts: Record<string, number>;
  onReaction: (reactionId: string) => void;
}) {
  const size = CHIP_SIZE;

  return (
    <div
      className={`absolute flex items-center justify-center rounded-lg transition-all duration-500
        ${unlocked ? "text-black" : "text-black/50"}
        ${recentlyUnlocked ? "animate-chip-unlock" : ""}
      `}
      style={{
        left: song.x,
        top: song.y,
        width: size,
        height: size,
        transform: "translate(-50%, -50%)",
        cursor: unlocked ? "pointer" : "default",
        zIndex: 10,
        backgroundImage: `url(${chipImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        boxShadow: unlocked
          ? "0 0 20px rgba(245,197,66,0.2), 0 0 40px rgba(245,197,66,0.06), inset 0 1px 1px rgba(255,255,255,0.05)"
          : "inset 0 1px 1px rgba(255,255,255,0.03)",
        filter: unlocked ? "none" : "brightness(0.4) grayscale(0.6)",
        outline: isBuilding ? "2px solid rgba(245,197,66,0.4)" : "none",
        outlineOffset: "3px",
      }}
      onMouseDown={(e) => {
        if (unlocked) e.stopPropagation();
      }}
      onTouchStart={(e) => {
        if (unlocked) e.stopPropagation();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* Logo at top of yellow area */}
      <img
        src={dranixLogo}
        alt="Dranix"
        className="absolute"
        style={{ top: "23%", width: "25%", pointerEvents: "none" }}
      />

      {/* Song name — under logo */}
      <span
        className="absolute tracking-wide font-bold"
        style={{
          fontFamily: "'Barlow', sans-serif",
          fontSize: song.id === 5 ? 8 : 10,
          top: "29%",
        }}
      >
        {song.label}
      </span>

      {/* Play button — center of chip */}
      {unlocked && song.audioSrc && (
        <div
          className="absolute flex items-center justify-center play-btn"
          style={{
            width: 24,
            height: 24,
            background: "#000000",
            borderRadius: 5,
            cursor: "pointer",
            zIndex: 11,
            border: "1px solid rgba(249,206,15,0.3)",
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
        >
          {isPlaying ? (
            <svg width="10" height="12" viewBox="0 0 10 12" fill="#f9ce0f">
              <rect x="1" y="1" width="3" height="10" rx="0.5" />
              <rect x="6" y="1" width="3" height="10" rx="0.5" />
            </svg>
          ) : (
            <svg
              width="10"
              height="12"
              viewBox="0 0 10 12"
              fill="none"
              style={{ marginLeft: 1 }}
            >
              <path d="M1 1L9 6L1 11V1Z" fill="#f9ce0f" />
            </svg>
          )}
        </div>
      )}

      {/* Status label — bottom */}
      {!unlocked && (
        <div
          className="absolute text-[10px] text-black/40 font-semibold"
          style={{ bottom: "28%", fontFamily: "'Barlow', sans-serif" }}
        >
          LOCKED
        </div>
      )}

      {unlocked && !isBuilding && (
        <div
          className="absolute text-[10px] font-semibold animate-ctb-pulse"
          style={{ bottom: "28%", fontFamily: "'Barlow', sans-serif" }}
        >
          CLICK TO BUILD
        </div>
      )}

      {/* Reaction row under chip */}
      {unlocked && (
        <div
          className="absolute"
          style={{
            bottom: -20,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 2,
            zIndex: 12,
          }}
        >
          {[
            { id: "like", path: "lottie/like.json" },

            { id: "honka", path: "lottie/Honka.json" },
            { id: "nails", path: "lottie/Nails.json" },
            { id: "poop", path: "lottie/Poop.json" },
            { id: "pepeglasses", path: "lottie/pepeglasses.json" },
            { id: "pepehug", path: "lottie/pepeHug.json" },
            { id: "pepemusic", path: "lottie/pepeMusic.json" },
          ].map((r) => (
            <LottieReaction
              key={r.id}
              id={r.id}
              path={r.path}
              count={reactionCounts[r.id] ?? 0}
              active={selectedReaction === r.id}
              onReact={() => onReaction(r.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ───── Helpers ───── */

/** 8 fixed edge anchor points on a chip, snapped to 2×GRID from center so
 *  every wire segment (anchor→first node) is exactly one grid step */
function getChipAnchors(chip: SongChip): { x: number; y: number }[] {
  const g = GRID * 2; // 80px — sits just past chip edge, on the grid
  return [
    { x: chip.x, y: chip.y - g }, // top
    { x: chip.x + g, y: chip.y - g }, // top-right
    { x: chip.x + g, y: chip.y }, // right
    { x: chip.x + g, y: chip.y + g }, // bottom-right
    { x: chip.x, y: chip.y + g }, // bottom
    { x: chip.x - g, y: chip.y + g }, // bottom-left
    { x: chip.x - g, y: chip.y }, // left
    { x: chip.x - g, y: chip.y - g }, // top-left
  ];
}

/** Snap to nearest of the 8 fixed edge points based on direction to target */
function getChipEdgePoint(
  chip: SongChip,
  targetX: number,
  targetY: number,
): { x: number; y: number } {
  const dx = targetX - chip.x;
  const dy = targetY - chip.y;

  // Find direction index (angle → nearest of 8 dirs)
  const angle = Math.atan2(dy, dx); // -PI to PI
  // Map angle to 0-7 index: 0=top, 1=top-right, ..., 7=top-left
  // atan2 gives: right=0, down=PI/2, left=±PI, up=-PI/2
  // Remap: top=-PI/2 → idx 0
  const idx = Math.round(((angle + Math.PI / 2) / (Math.PI * 2)) * 8 + 8) % 8;

  return getChipAnchors(chip)[idx];
}

/* ───── Review Viewer (read-only, multi-type) ───── */

function ReviewViewer({
  songName,
  review,
  onClose,
}: {
  songName: string;
  review: Review;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [onClose]);

  const typeLabel =
    review.type === "prompt"
      ? "Answer"
      : review.type === "rhythm"
        ? "Rhythm pattern"
        : review.type === "drawing"
          ? "Pixel art"
          : review.type === "riddle"
            ? "Riddle"
            : review.type === "puzzle"
              ? "Puzzle"
              : review.type === "memory"
                ? "Memory game"
                : "Wire trace";

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 1000, pointerEvents: "all" }}
      onMouseDown={(e) => {
        if (!(e.target as HTMLElement).closest(".review-card")) onClose();
      }}
      onTouchStart={(e) => {
        if (!(e.target as HTMLElement).closest(".review-card")) onClose();
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="review-card review-popup-enter"
        style={{
          width: 340,
          background:
            "linear-gradient(160deg, #0c1a12 0%, #0a1510 50%, #0d1c14 100%)",
          border: "1px solid rgba(34, 197, 94, 0.25)",
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 0 40px rgba(0,0,0,0.6), 0 0 20px rgba(34,197,94,0.08)",
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 10,
              fontFamily: "monospace",
              color: "rgba(34,197,94,0.5)",
              textTransform: "uppercase",
              letterSpacing: 2,
              marginBottom: 4,
            }}
          >
            {typeLabel}
          </div>
          <div
            style={{
              fontSize: 18,
              fontFamily: "monospace",
              color: "#f5c542",
              fontWeight: 700,
            }}
          >
            {songName}
          </div>
        </div>

        {/* Author */}
        <div
          style={{
            fontSize: 12,
            fontFamily: "monospace",
            color: "rgba(34,197,94,0.6)",
            marginBottom: 12,
          }}
        >
          — {review.name}
        </div>

        {/* Content by type */}
        {review.type === "prompt" && (
          <div>
            <div
              style={{
                fontSize: 12,
                fontFamily: "monospace",
                color: "#f5c542",
                padding: "8px 12px",
                background: "rgba(245,197,66,0.06)",
                border: "1px solid rgba(245,197,66,0.12)",
                borderRadius: "8px 8px 0 0",
                borderBottom: "none",
              }}
            >
              {review.prompt}
            </div>
            <div
              style={{
                fontSize: 14,
                fontFamily: "monospace",
                color: "#d0d0d0",
                lineHeight: 1.6,
                padding: "12px 14px",
                background: "rgba(0,0,0,0.25)",
                border: "1px solid rgba(34,197,94,0.1)",
                borderRadius: "0 0 8px 8px",
              }}
            >
              "{review.text}"
            </div>
          </div>
        )}

        {review.type === "rhythm" && (
          <div
            style={{
              padding: "14px 16px",
              background: "rgba(0,0,0,0.25)",
              border: "1px solid rgba(34,197,94,0.1)",
              borderRadius: 8,
            }}
          >
            <div
              style={{
                height: 40,
                position: "relative",
                background: "rgba(0,0,0,0.2)",
                borderRadius: 6,
                overflow: "hidden",
              }}
            >
              {review.taps.map((t, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: `${(t / review.duration) * 100}%`,
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 5,
                    height: 20,
                    background: "#f5c542",
                    borderRadius: 2,
                    opacity: 0.8,
                  }}
                />
              ))}
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 11,
                fontFamily: "monospace",
                color: "rgba(255,255,255,0.3)",
                textAlign: "center",
              }}
            >
              {review.taps.length} taps · {(review.duration / 1000).toFixed(0)}s
            </div>
          </div>
        )}

        {review.type === "drawing" && (
          <div style={{ textAlign: "center" }}>
            <img
              src={review.imageDataUrl}
              alt="Pixel art"
              style={{
                width: 256,
                height: 256,
                imageRendering: "pixelated",
                borderRadius: 8,
                border: "1px solid rgba(34,197,94,0.15)",
                background: "#0a0a0a",
              }}
            />
          </div>
        )}

        {review.type === "riddle" && (
          <div
            style={{
              padding: "16px",
              background: "rgba(0,0,0,0.25)",
              border: "1px solid rgba(34,197,94,0.1)",
              borderRadius: 8,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>{review.correct ? "🧠" : "❌"}</div>
            <div
              style={{
                fontSize: 14,
                fontFamily: "monospace",
                color: review.correct ? "#22c55e" : "#ff3b5c",
              }}
            >
              {review.correct ? "Guessed correctly!" : "Wrong answer"}
            </div>
          </div>
        )}

        {review.type === "puzzle" && (
          <div
            style={{
              padding: "16px",
              background: "rgba(0,0,0,0.25)",
              border: "1px solid rgba(34,197,94,0.1)",
              borderRadius: 8,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>🧩</div>
            <div
              style={{
                fontSize: 14,
                fontFamily: "monospace",
                color: "#d0d0d0",
              }}
            >
              Solved in <span style={{ color: "#f5c542" }}>{review.moves}</span> moves
            </div>
          </div>
        )}

        {review.type === "memory" && (
          <div
            style={{
              padding: "16px",
              background: "rgba(0,0,0,0.25)",
              border: "1px solid rgba(34,197,94,0.1)",
              borderRadius: 8,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>🃏</div>
            <div
              style={{
                fontSize: 14,
                fontFamily: "monospace",
                color: "#d0d0d0",
              }}
            >
              Solved in <span style={{ color: "#f5c542" }}>{review.flips}</span> flips
            </div>
          </div>
        )}

        {review.type === "wire" && (
          <div
            style={{
              padding: "16px",
              background: "rgba(0,0,0,0.25)",
              border: "1px solid rgba(34,197,94,0.1)",
              borderRadius: 8,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>⚡</div>
            <div
              style={{
                fontSize: 14,
                fontFamily: "monospace",
                color: "#d0d0d0",
              }}
            >
              Connected in <span style={{ color: "#f5c542" }}>{review.lines}</span> lines
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ───── Audio Player Bar (fixed bottom) ───── */

function AudioPlayerBar({
  song,
  isPlaying,
  progress,
  duration,
  volume,
  onToggle,
  onSeek,
  onVolumeChange,
  onClose,
}: {
  song: SongChip;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  onToggle: () => void;
  onSeek: (fraction: number) => void;
  onVolumeChange: (vol: number) => void;
  onClose: () => void;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const volRef = useRef<HTMLDivElement>(null);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e: React.MouseEvent) => {
    const bar = barRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const fraction = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width),
    );
    onSeek(fraction);
  };

  const volFractionFromEvent = (e: MouseEvent | React.MouseEvent) => {
    const bar = volRef.current;
    if (!bar) return null;
    const rect = bar.getBoundingClientRect();
    return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  };

  const handleVolMouseDown = (e: React.MouseEvent) => {
    const f = volFractionFromEvent(e);
    if (f !== null) onVolumeChange(f);

    const onMove = (ev: MouseEvent) => {
      const fr = volFractionFromEvent(ev);
      if (fr !== null) onVolumeChange(fr);
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div
      className="fixed"
      style={{
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        width: "30%",
        minWidth: 280,
        zIndex: 1100,
        background: "rgba(0,0,0,0.55)",
        border: "1px solid rgba(249,206,15,0.15)",
        borderRadius: 12,
        padding: "10px 14px",
        backdropFilter: "blur(16px)",
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Progress bar — full width, clickable */}
      <div
        ref={barRef}
        onClick={handleSeek}
        style={{
          width: "100%",
          height: 3,
          background: "rgba(255,255,255,0.1)",
          cursor: "pointer",
          marginBottom: 10,
          position: "relative",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: "#f9ce0f",
            borderRadius: 1,
            transition: "width 0.15s linear",
          }}
        />
        {/* Seek dot */}
        <div
          style={{
            position: "absolute",
            left: `${pct}%`,
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#f9ce0f",
            boxShadow: "0 0 6px rgba(249,206,15,0.5)",
          }}
        />
      </div>

      {/* Controls row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* Play/Pause */}
        <button
          onClick={onToggle}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "rgba(249,206,15,0.1)",
            border: "1px solid rgba(249,206,15,0.3)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "all 0.15s",
          }}
        >
          {isPlaying ? (
            <svg width="12" height="14" viewBox="0 0 12 14" fill="#f9ce0f">
              <rect x="0" y="0" width="4" height="14" rx="1" />
              <rect x="8" y="0" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg width="12" height="14" viewBox="0 0 12 14" fill="#f9ce0f">
              <path d="M1 0.5L11 7L1 13.5V0.5Z" />
            </svg>
          )}
        </button>

        {/* Song label */}
        <div
          style={{
            flex: 1,
            fontFamily: "monospace",
            fontSize: 13,
            color: "#f9ce0f",
            fontWeight: 700,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {song.label}
        </div>

        {/* Time */}
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 11,
            color: "rgba(255,255,255,0.4)",
            flexShrink: 0,
          }}
        >
          {fmt(progress)} / {fmt(duration)}
        </div>

        {/* Volume */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            flexShrink: 0,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="rgba(255,255,255,0.35)"
          >
            <path d="M2 5.5h2.5L8 2v12L4.5 10.5H2a1 1 0 01-1-1v-3a1 1 0 011-1z" />
            {volume > 0.01 && (
              <path
                d="M10 5.5a3.5 3.5 0 010 5"
                fill="none"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="1.3"
              />
            )}
            {volume > 0.5 && (
              <path
                d="M11.5 3.5a6 6 0 010 9"
                fill="none"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="1.3"
              />
            )}
          </svg>
          <div
            ref={volRef}
            onMouseDown={handleVolMouseDown}
            style={{
              width: 50,
              height: 3,
              background: "rgba(255,255,255,0.1)",
              borderRadius: 2,
              cursor: "pointer",
              position: "relative",
            }}
          >
            <div
              style={{
                width: `${volume * 100}%`,
                height: "100%",
                background: "rgba(255,255,255,0.4)",
                borderRadius: 2,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: `${volume * 100}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.6)",
              }}
            />
          </div>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            width: 28,
            height: 28,
            borderRadius: 4,
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.1)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: "rgba(255,255,255,0.4)",
            fontSize: 16,
            lineHeight: 1,
          }}
        >
          &times;
        </button>
      </div>
    </div>
  );
}
