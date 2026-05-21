import { useState, useRef, useEffect, useMemo } from "react";
import type { SongLabel } from "../constants/songs";
import { SONG_GALLERY, type SongGallery } from "../constants/gallery";

type Tab = "AUDIO" | "PHOTO_LOG" | "VIDEO_FEED";

interface Props {
  songLabel: SongLabel;
  onClose: () => void;
}

export default function ChipGallery({ songLabel, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("AUDIO");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const gallery = SONG_GALLERY[songLabel];

  const photos = gallery.photos;

  // Close on Escape, navigate with arrows
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (lightboxIndex !== null) setLightboxIndex(null);
        else onClose();
      }
      if (lightboxIndex !== null && photos.length > 0) {
        if (e.key === "ArrowRight") {
          setLightboxIndex((i) => ((i ?? 0) + 1) % photos.length);
        } else if (e.key === "ArrowLeft") {
          setLightboxIndex((i) => ((i ?? 0) - 1 + photos.length) % photos.length);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex, onClose, photos.length]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[500]"
        style={{ background: "rgba(0,0,0,0.88)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-0 z-[501] flex items-center justify-center pointer-events-none">
        <div
          className="relative flex flex-col pointer-events-auto gallery-enter overflow-hidden"
          style={{
            width: "min(96vw, 1080px)",
            height: "min(94vh, 820px)",
            background: "#050505",
            border: "1px solid rgba(249,206,15,0.22)",
            boxShadow:
              "0 0 80px rgba(249,206,15,0.06), 0 0 1px rgba(249,206,15,0.3), inset 0 0 80px rgba(0,0,0,0.6)",
          }}
        >
          {/* Grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(rgba(249,206,15,0.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(249,206,15,0.04) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />

          {/* Scanline sweep */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="gallery-scanline" />
          </div>

          {/* Header */}
          <div
            className="relative shrink-0 px-4 py-3"
            style={{ borderBottom: "1px solid rgba(249,206,15,0.14)" }}
          >
            {/* Title row */}
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="flex-1 min-w-0"
                style={{
                  fontFamily: "monospace",
                  fontSize: 12,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                <span style={{ color: "rgba(249,206,15,0.3)" }}>&gt;&gt; </span>
                <span style={{ color: "rgba(249,206,15,0.45)" }}>
                  CHIP_DATA /
                </span>
                <span style={{ color: "#f9ce0f", marginLeft: 6 }}>
                  {songLabel}
                </span>
              </div>
              <button className="gallery-btn-close shrink-0" onClick={onClose}>
                <span style={{ fontSize: 15 }}>×</span>
                <span className="hidden sm:inline"> DISCONNECT</span>
                <span className="inline sm:hidden"> ESC</span>
              </button>
            </div>
            {/* Description — own line so it never competes for width */}
            {gallery.description && (
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  color: "rgba(249,206,15,0.22)",
                  marginTop: 4,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {gallery.description}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div
            className="gallery-tabs-row relative flex shrink-0"
            style={{ borderBottom: "1px solid rgba(249,206,15,0.14)" }}
          >
            {(["AUDIO", "PHOTO_LOG", "VIDEO_FEED"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="gallery-tab shrink-0"
                data-active={tab === t ? "true" : "false"}
              >
                // {t}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="gallery-content relative flex-1 overflow-y-auto p-6">
            {tab === "AUDIO" && <AudioTab gallery={gallery} />}
            {tab === "PHOTO_LOG" && (
              <PhotoTab gallery={gallery} onLightbox={setLightboxIndex} />
            )}
            {tab === "VIDEO_FEED" && <VideoTab gallery={gallery} />}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && photos.length > 0 && (
        <div
          className="fixed inset-0 z-[600] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.96)" }}
          onClick={() => setLightboxIndex(null)}
        >
          {/* Left arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((i) => ((i ?? 0) - 1 + photos.length) % photos.length);
            }}
            className="absolute left-4 sm:left-8 z-10"
            style={{
              background: "rgba(249,206,15,0.06)",
              border: "1px solid rgba(249,206,15,0.2)",
              color: "#f9ce0f",
              fontFamily: "monospace",
              fontSize: 24,
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "background 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(249,206,15,0.12)";
              e.currentTarget.style.borderColor = "rgba(249,206,15,0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(249,206,15,0.06)";
              e.currentTarget.style.borderColor = "rgba(249,206,15,0.2)";
            }}
          >
            ‹
          </button>

          {/* Image + info */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              maxWidth: "80vw",
              maxHeight: "90vh",
            }}
          >
            <img
              src={photos[lightboxIndex].src}
              alt={photos[lightboxIndex].title}
              style={{
                maxWidth: "80vw",
                maxHeight: "75vh",
                objectFit: "contain",
                border: "1px solid rgba(249,206,15,0.2)",
              }}
            />
            <div
              style={{
                fontFamily: "monospace",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div style={{ fontSize: 13, color: "#f9ce0f" }}>
                {photos[lightboxIndex].title}
              </div>
              <div style={{ fontSize: 10, color: "rgba(249,206,15,0.35)" }}>
                {photos[lightboxIndex].date} &nbsp;·&nbsp; {lightboxIndex + 1}/{photos.length}
              </div>
            </div>
          </div>

          {/* Right arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((i) => ((i ?? 0) + 1) % photos.length);
            }}
            className="absolute right-4 sm:right-8 z-10"
            style={{
              background: "rgba(249,206,15,0.06)",
              border: "1px solid rgba(249,206,15,0.2)",
              color: "#f9ce0f",
              fontFamily: "monospace",
              fontSize: 24,
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "background 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(249,206,15,0.12)";
              e.currentTarget.style.borderColor = "rgba(249,206,15,0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(249,206,15,0.06)";
              e.currentTarget.style.borderColor = "rgba(249,206,15,0.2)";
            }}
          >
            ›
          </button>

          {/* Close button */}
          <div
            className="absolute top-6 right-8"
            onClick={() => setLightboxIndex(null)}
            style={{
              fontFamily: "monospace",
              fontSize: 12,
              color: "rgba(249,206,15,0.4)",
              cursor: "pointer",
            }}
          >
            × CLOSE
          </div>
        </div>
      )}
    </>
  );
}

/* ───── Audio Tab ───── */

function AudioTab({ gallery }: { gallery: SongGallery }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const volBarRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio?.pause();
    };
  }, []);

  // Preload samples when gallery opens
  useEffect(() => {
    gallery.samples?.forEach((s) => {
      const a = new Audio(s.src);
      a.preload = "auto";
    });
  }, [gallery.samples]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  function togglePlay() {
    const a = audioRef.current;
    if (!a) return;
    if (isPlaying) {
      a.pause();
      setIsPlaying(false);
    } else {
      a.play();
      setIsPlaying(true);
    }
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    const a = audioRef.current;
    if (!a || !a.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    a.currentTime = ratio * a.duration;
    setProgress(ratio);
  }

  function volFraction(e: MouseEvent | React.MouseEvent) {
    const bar = volBarRef.current;
    if (!bar) return null;
    const rect = bar.getBoundingClientRect();
    return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  }

  function handleVolMouseDown(e: React.MouseEvent) {
    const f = volFraction(e);
    if (f !== null) setVolume(f);
    const onMove = (ev: MouseEvent) => {
      const fr = volFraction(ev);
      if (fr !== null) setVolume(fr);
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function fmt(s: number) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  if (!gallery.demo) {
    return <NoData label="NO_AUDIO_FEED" />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Player — compact single-row layout */}
      <div
        style={{
          background: "rgba(249,206,15,0.03)",
          border: "1px solid rgba(249,206,15,0.12)",
          padding: "8px 10px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          style={{
            width: 28,
            height: 28,
            background: "#000",
            border: "1px solid rgba(249,206,15,0.35)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            transition: "border-color 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(249,206,15,0.7)";
            e.currentTarget.style.boxShadow = "0 0 10px rgba(249,206,15,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(249,206,15,0.35)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {isPlaying ? (
            <svg width="9" height="11" viewBox="0 0 10 12" fill="#f9ce0f">
              <rect x="1" y="1" width="3" height="10" rx="0.5" />
              <rect x="6" y="1" width="3" height="10" rx="0.5" />
            </svg>
          ) : (
            <svg
              width="9"
              height="11"
              viewBox="0 0 10 12"
              fill="#f9ce0f"
              style={{ marginLeft: 1 }}
            >
              <path d="M1 1L9 6L1 11V1Z" />
            </svg>
          )}
        </button>

        {/* Label + progress bar stacked in the middle */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 9,
              color: "rgba(249,206,15,0.3)",
              letterSpacing: 2,
            }}
          >
            DEMO_RECORDING
          </span>
          <div
            onClick={handleSeek}
            style={{
              width: "100%",
              height: 4,
              background: "rgba(249,206,15,0.1)",
              cursor: "pointer",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                height: "100%",
                width: `${progress * 100}%`,
                background: "#f9ce0f",
                transition: "width 0.1s linear",
              }}
            />
          </div>
        </div>

        {/* Time */}
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 10,
            color: "rgba(249,206,15,0.45)",
            flexShrink: 0,
          }}
        >
          {fmt(currentTime)} / {duration > 0 ? fmt(duration) : "--:--"}
        </span>

        {/* Volume */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            flexShrink: 0,
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="rgba(249,206,15,0.35)"
          >
            <path d="M2 5.5h2.5L8 2v12L4.5 10.5H2a1 1 0 01-1-1v-3a1 1 0 011-1z" />
            {volume > 0.01 && (
              <path
                d="M10 5.5a3.5 3.5 0 010 5"
                fill="none"
                stroke="rgba(249,206,15,0.35)"
                strokeWidth="1.3"
              />
            )}
            {volume > 0.5 && (
              <path
                d="M11.5 3.5a6 6 0 010 9"
                fill="none"
                stroke="rgba(249,206,15,0.2)"
                strokeWidth="1.3"
              />
            )}
          </svg>
          <div
            ref={volBarRef}
            onMouseDown={handleVolMouseDown}
            style={{
              width: 44,
              height: 3,
              background: "rgba(249,206,15,0.1)",
              borderRadius: 2,
              cursor: "pointer",
              position: "relative",
            }}
          >
            <div
              style={{
                width: `${volume * 100}%`,
                height: "100%",
                background: "rgba(249,206,15,0.5)",
                borderRadius: 2,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: `${volume * 100}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#f9ce0f",
              }}
            />
          </div>
        </div>

        <audio
          ref={audioRef}
          src={gallery.demo}
          onTimeUpdate={() => {
            const a = audioRef.current;
            if (a) {
              setCurrentTime(a.currentTime);
              setProgress(a.currentTime / (a.duration || 1));
            }
          }}
          onLoadedMetadata={() => {
            if (audioRef.current) setDuration(audioRef.current.duration);
          }}
          onEnded={() => {
            setIsPlaying(false);
            setProgress(0);
            setCurrentTime(0);
          }}
        />
      </div>

      {/* Instrumental — single compact row */}
      <div
        style={{
          border: "1px solid rgba(249,206,15,0.1)",
          padding: "6px 10px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 9,
            color: "rgba(249,206,15,0.3)",
            letterSpacing: 2,
            flexShrink: 0,
          }}
        >
          INSTRUMENTAL
        </span>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 10,
            color: gallery.instrumental
              ? "rgba(249,206,15,0.55)"
              : "rgba(249,206,15,0.18)",
          }}
        >
          {gallery.instrumental ? "instrumental.wav" : "// not_available_yet"}
        </span>
        <div style={{ flex: 1 }} />
        {gallery.instrumental ? (
          <a
            href={gallery.instrumental}
            download
            style={{
              fontFamily: "monospace",
              fontSize: 10,
              color: "#f9ce0f",
              border: "1px solid rgba(249,206,15,0.4)",
              padding: "3px 10px",
              textDecoration: "none",
              flexShrink: 0,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background =
                "rgba(249,206,15,0.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background =
                "transparent";
            }}
          >
            ⬇ DL
          </a>
        ) : (
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 10,
              color: "rgba(249,206,15,0.12)",
              flexShrink: 0,
            }}
          >
            ⬇ DL
          </span>
        )}
      </div>

      {/* 3D spinning DRANIX */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 60,
          perspective: "500px",
        }}
      >
        <span
          className="dranix-spin"
          style={{
            fontFamily: "monospace",
            fontWeight: "bold",
            fontSize: "clamp(18px, 3.5vw, 32px)",
            letterSpacing: "0.18em",
            color: "#f9ce0f",
            textShadow:
              "0 0 24px rgba(249,206,15,0.5), 0 0 60px rgba(249,206,15,0.15)",
          }}
        >
          DRANIX
        </span>
      </div>

      {/* Sampler pads */}
      <SamplerPads samples={gallery.samples} />
    </div>
  );
}

/* ───── ASCII Spinning Chip ───── */

// Each frame: 5 lines. Perspective from top-right: front face + top slant (╱) + right side (║).
// Front face width shrinks/grows. At 90°/270° only the side face is visible.
// const CHIP_FRAMES: string[] = [
//   // 0° — full front + thin top + thin side
//   " ╔════════════╗ \n╱░░░░░░░░░░░░╱║\n║░◈ DRANIX ◈░║║\n║░░░░░░░░░░░░║║\n╚════════════╝╱",
//   // 30°
//   " ╔══════════╗  \n╱░░░░░░░░░░╱║ \n║░◈DRANIX◈░║║ \n║░░░░░░░░░░║║ \n╚══════════╝╱ ",
//   // 60°
//   " ╔═══════╗    \n╱░░░░░░░╱║   \n║◈DRANIX◈║║  \n║░░░░░░░║║   \n╚═══════╝╱   ",
//   // 80° — almost edge, side growing
//   " ╔════╗       \n╱░░░░╱║║     \n║◈DRN◈║║║    \n║░░░░║║║     \n╚════╝╱║     ",
//   // 90° — edge, side face is main view
//   "  ╔══╗╔╗     \n  ║░░║║║     \n  ║░░║║║     \n  ║░░║║║     \n  ╚══╝╚╝     ",
//   // 100° — back side appears, side shrinking
//   " ╔════╗       \n╱░░░░╱║║     \n║◈XND◈║║║    \n║░░░░║║║     \n╚════╝╱║     ",
//   // 120° — back face growing
//   " ╔═══════╗    \n╱░░░░░░░╱║   \n║◈XINARD◈║║  \n║░░░░░░░║║   \n╚═══════╝╱   ",
//   // 150°
//   " ╔══════════╗  \n╱░░░░░░░░░░╱║ \n║░◈XINARD◈░║║ \n║░░░░░░░░░░║║ \n╚══════════╝╱ ",
//   // 180° — full back + thin top + thin side
//   " ╔════════════╗ \n╱░░░░░░░░░░░░╱║\n║░◈ XINARD ◈░║║\n║░░░░░░░░░░░░║║\n╚════════════╝╱",
//   // 210°
//   " ╔══════════╗  \n╱░░░░░░░░░░╱║ \n║░◈XINARD◈░║║ \n║░░░░░░░░░░║║ \n╚══════════╝╱ ",
//   // 240°
//   " ╔═══════╗    \n╱░░░░░░░╱║   \n║◈XINARD◈║║  \n║░░░░░░░║║   \n╚═══════╝╱   ",
//   // 260°
//   " ╔════╗       \n╱░░░░╱║║     \n║◈XND◈║║║    \n║░░░░║║║     \n╚════╝╱║     ",
//   // 270° — edge
//   "  ╔══╗╔╗     \n  ║░░║║║     \n  ║░░║║║     \n  ║░░║║║     \n  ╚══╝╚╝     ",
//   // 280° — front returns
//   " ╔════╗       \n╱░░░░╱║║     \n║◈DRN◈║║║    \n║░░░░║║║     \n╚════╝╱║     ",
//   // 300°
//   " ╔═══════╗    \n╱░░░░░░░╱║   \n║◈DRANIX◈║║  \n║░░░░░░░║║   \n╚═══════╝╱   ",
//   // 330°
//   " ╔══════════╗  \n╱░░░░░░░░░░╱║ \n║░◈DRANIX◈░║║ \n║░░░░░░░░░░║║ \n╚══════════╝╱ ",
// ];

// TODO use in future somewhere else
// function SpinningChip() {
//   const [idx, setIdx] = useState(0);

//   useEffect(() => {
//     const id = setInterval(
//       () => setIdx((i) => (i + 1) % CHIP_FRAMES.length),
//       110,
//     );
//     return () => clearInterval(id);
//   }, []);

//   return (
//     <div
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         gap: 8,
//         paddingTop: 16,
//         paddingBottom: 8,
//       }}
//     >
//       <div
//         style={{
//           fontFamily: "monospace",
//           fontSize: 9,
//           color: "rgba(249,206,15,0.2)",
//           letterSpacing: 3,
//         }}
//       >
//         // chip_render.exe
//       </div>
//       <pre
//         style={{
//           fontFamily: "monospace",
//           fontSize: "clamp(10px, 2.2vw, 13px)",
//           color: "#f9ce0f",
//           lineHeight: 1.5,
//           margin: 0,
//           textShadow: "0 0 10px rgba(249,206,15,0.35)",
//           letterSpacing: "0.02em",
//         }}
//       >
//         {CHIP_FRAMES[idx]}
//       </pre>
//     </div>
//   );
// }

/* ───── Sampler Pads ───── */

const DEFAULT_SAMPLE_PADS = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  label: `sample_0${i + 1}`,
  src: "samples/sample.mp3",
}));

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

function SamplerPads({
  samples,
}: {
  samples?: { label: string; src: string }[];
}) {
  const isMobile = useIsMobile();
  const padSize = isMobile ? 75 : 150;
  const pads = useMemo(
    () => (samples ?? DEFAULT_SAMPLE_PADS).map((s, i) => ({ id: i + 1, ...s })),
    [samples],
  );
  const padsRef = useRef(pads);
  useEffect(() => {
    padsRef.current = pads;
  });

  // --- One-shot state ---
  const [padProgress, setPadProgress] = useState<Map<number, number>>(
    new Map(),
  );
  const intervalsRef = useRef<Map<number, ReturnType<typeof setInterval>>>(
    new Map(),
  );
  const audioInstancesRef = useRef<Map<number, HTMLAudioElement>>(new Map());

  // --- Loop state ---
  const [loopMode, setLoopMode] = useState(true);
  const [loopingPads, setLoopingPads] = useState<Set<number>>(new Set());
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioBuffersRef = useRef<Map<string, AudioBuffer>>(new Map());
  const loopNodesRef = useRef<Map<number, AudioBufferSourceNode>>(new Map());
  const loopStartTimeRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  // Sync ref so RAF tick always sees latest set without stale closure
  const loopingPadsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const intervals = intervalsRef.current;
    const nodes = loopNodesRef.current;
    return () => {
      intervals.forEach(clearInterval);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      nodes.forEach((n) => {
        try {
          n.stop();
        } catch {
          /* already stopped */
        }
      });
    };
  }, []);

  // ── Helpers ──────────────────────────────────────────────

  function getCtx(): AudioContext {
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    return audioCtxRef.current;
  }

  function resolveSrc(src: string) {
    return src.startsWith("http") ? src : `${import.meta.env.BASE_URL}${src}`;
  }

  async function loadBuffer(src: string): Promise<AudioBuffer> {
    const ctx = getCtx();
    if (audioBuffersRef.current.has(src))
      return audioBuffersRef.current.get(src)!;
    const resp = await fetch(resolveSrc(src));
    const ab = await resp.arrayBuffer();
    const buf = await ctx.decodeAudioData(ab);
    audioBuffersRef.current.set(src, buf);
    return buf;
  }

  function stopNode(id: number) {
    const n = loopNodesRef.current.get(id);
    if (n) {
      try {
        n.stop();
      } catch {
        /* already stopped */
      }
      loopNodesRef.current.delete(id);
    }
  }

  function startNode(id: number, buf: AudioBuffer, offset = 0) {
    const ctx = getCtx();
    stopNode(id);
    const n = ctx.createBufferSource();
    n.buffer = buf;
    n.loop = true;
    n.connect(ctx.destination);
    n.start(0, offset);
    loopNodesRef.current.set(id, n);
  }

  function stopAllLoops() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    loopNodesRef.current.forEach((_, id) => stopNode(id));
    loopingPadsRef.current = new Set();
    setLoopingPads(new Set());
    setPadProgress(new Map());
  }

  function runRAF() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const tick = () => {
      const ctx = audioCtxRef.current;
      if (!ctx || loopingPadsRef.current.size === 0) return;
      const elapsed = ctx.currentTime - loopStartTimeRef.current;
      const next = new Map<number, number>();
      loopingPadsRef.current.forEach((id) => {
        const pad = padsRef.current.find((p) => p.id === id);
        if (!pad) return;
        const buf = audioBuffersRef.current.get(pad.src);
        if (!buf) return;
        next.set(id, (elapsed % buf.duration) / buf.duration);
      });
      setPadProgress(next);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  // ── Loop pad toggle ───────────────────────────────────────

  async function toggleLoopPad(padId: number) {
    const ctx = getCtx();
    if (ctx.state === "suspended") await ctx.resume();

    const isRemoving = loopingPadsRef.current.has(padId);

    if (isRemoving) {
      // Stop just this pad, others continue uninterrupted
      stopNode(padId);
      const next = new Set(loopingPadsRef.current);
      next.delete(padId);
      loopingPadsRef.current = next;
      setLoopingPads(new Set(next));
      if (next.size === 0) stopAllLoops();
      return;
    }

    // Adding a new pad — load buffer and join in-phase
    const pad = padsRef.current.find((p) => p.id === padId);
    if (!pad) return;

    await loadBuffer(pad.src);
    const buf = audioBuffersRef.current.get(pad.src)!;

    const next = new Set(loopingPadsRef.current);
    next.add(padId);
    loopingPadsRef.current = next;
    setLoopingPads(new Set(next));

    if (next.size === 1) {
      // First pad: anchor the loop timeline
      loopStartTimeRef.current = ctx.currentTime;
      startNode(padId, buf, 0);
    } else {
      // Subsequent pad: start at phase offset so it aligns with running loop
      const elapsed = ctx.currentTime - loopStartTimeRef.current;
      startNode(padId, buf, elapsed % buf.duration);
    }

    runRAF();
  }

  // ── One-shot trigger (unchanged) ──────────────────────────

  function triggerPad(id: number, src: string) {
    const existing = intervalsRef.current.get(id);
    if (existing) clearInterval(existing);

    const existingAudio = audioInstancesRef.current.get(id);

    // If pad is currently active — stop it
    if (existingAudio && !existingAudio.paused && !existingAudio.ended) {
      existingAudio.pause();
      existingAudio.currentTime = 0;
      intervalsRef.current.delete(id);
      setPadProgress((prev) => {
        const n = new Map(prev);
        n.delete(id);
        return n;
      });
      return;
    }

    let audio: HTMLAudioElement;
    if (existingAudio) {
      existingAudio.currentTime = 0;
      audio = existingAudio;
    } else {
      audio = new Audio(resolveSrc(src));
      audioInstancesRef.current.set(id, audio);
    }
    audio.play();

    setPadProgress((prev) => new Map(prev).set(id, 0));

    const interval = setInterval(() => {
      if (!audio.duration) return;
      const progress = audio.currentTime / audio.duration;
      setPadProgress((prev) => new Map(prev).set(id, progress));
      if (audio.ended || progress >= 1) {
        clearInterval(interval);
        intervalsRef.current.delete(id);
        setPadProgress((prev) => {
          const n = new Map(prev);
          n.delete(id);
          return n;
        });
      }
    }, 30);

    intervalsRef.current.set(id, interval);
  }

  function handlePadPress(padId: number, padSrc: string) {
    if (loopMode) toggleLoopPad(padId);
    else triggerPad(padId, padSrc);
  }

  function toggleLoopMode() {
    if (loopMode) stopAllLoops();
    setLoopMode((m) => !m);
  }

  // ── Render ────────────────────────────────────────────────

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        alignItems: "center",
      }}
    >
      {/* Header + grid constrained to pad grid width */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          width: `${padSize * 4 + 6 * 3}px`,
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 10,
              color: "rgba(249,206,15,0.3)",
              letterSpacing: 2,
            }}
          >
            SAMPLER_PADS
          </div>
          <button
            onClick={toggleLoopMode}
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              letterSpacing: 1.5,
              padding: "5px 13px",
              background: loopMode ? "rgba(249,206,15,0.1)" : "transparent",
              border: `1px solid ${loopMode ? "rgba(249,206,15,0.5)" : "rgba(249,206,15,0.2)"}`,
              color: loopMode ? "#f9ce0f" : "rgba(249,206,15,0.35)",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            <span style={{ fontSize: 16 }}>↺</span> LOOP{" "}
            <span
              style={{
                display: "inline-block",
                width: "2.2ch",
                textAlign: "left",
              }}
            >
              {loopMode ? "ON" : "OFF"}
            </span>
          </button>
        </div>

        {/* Hint */}
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 9,
            color: "rgba(249,206,15,0.2)",
            letterSpacing: 1,
            lineHeight: 1.7,
          }}
        >
          {loopMode ? (
            <>// tap pad — add to loop &nbsp;·&nbsp; tap again — remove</>
          ) : (
            <>// tap pad — play &nbsp;·&nbsp; tap again — stop</>
          )}
        </div>

        {/* Pads grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(4, ${padSize}px)`,
            gap: 6,
          }}
        >
          {pads.map((pad) => {
            const progress = padProgress.get(pad.id);
            const isLooping = loopingPads.has(pad.id);
            const isActive = progress !== undefined;
            const fillPct = isActive ? `${(progress ?? 0) * 100}%` : "0%";

            const borderColor = isLooping
              ? "rgba(249,206,15,0.65)"
              : isActive
                ? "rgba(249,206,15,0.5)"
                : loopMode
                  ? "rgba(249,206,15,0.2)"
                  : "rgba(249,206,15,0.14)";

            return (
              <button
                key={pad.id}
                onMouseDown={() => handlePadPress(pad.id, pad.src)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handlePadPress(pad.id, pad.src);
                }}
                style={{
                  width: padSize,
                  height: padSize,
                  position: "relative",
                  overflow: "hidden",
                  background: isLooping
                    ? "rgba(249,206,15,0.04)"
                    : "rgba(249,206,15,0.02)",
                  border: `1px solid ${borderColor}`,
                  borderRadius: 6,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  padding: "0 6px 6px",
                  boxShadow: isLooping
                    ? "0 0 20px rgba(249,206,15,0.18)"
                    : isActive
                      ? "0 0 14px rgba(249,206,15,0.15)"
                      : "inset 0 0 20px rgba(0,0,0,0.4)",
                  transition: "border-color 0.08s, box-shadow 0.08s",
                }}
              >
                {/* Loop indicator */}
                {isLooping && (
                  <div
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 5,
                      fontFamily: "monospace",
                      fontSize: 15,
                      color: "rgba(249,206,15,0.55)",
                      pointerEvents: "none",
                    }}
                  >
                    ↺
                  </div>
                )}

                {/* Progress fill — bottom to top */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: fillPct,
                    background: isLooping
                      ? "rgba(249,206,15,0.18)"
                      : "rgba(249,206,15,0.13)",
                    borderTop: isActive
                      ? "1px solid rgba(249,206,15,0.35)"
                      : "none",
                    pointerEvents: "none",
                  }}
                />
                <span
                  style={{
                    position: "relative",
                    fontFamily: "monospace",
                    fontSize: 8,
                    color: isActive
                      ? "rgba(249,206,15,0.7)"
                      : "rgba(249,206,15,0.22)",
                    letterSpacing: 1,
                    textAlign: "center",
                    wordBreak: "break-all",
                    lineHeight: 1.3,
                    transition: "color 0.08s",
                  }}
                >
                  {pad.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ───── Photo Tab ───── */

function PhotoTab({
  gallery,
  onLightbox,
}: {
  gallery: SongGallery;
  onLightbox: (index: number) => void;
}) {
  if (gallery.photos.length === 0) {
    return <NoData label="NO_PHOTO_LOG" />;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: 8,
      }}
    >
      {gallery.photos.map((photo, i) => (
        <div
          key={i}
          onClick={() => onLightbox(i)}
          style={{
            aspectRatio: "1",
            overflow: "hidden",
            cursor: "pointer",
            border: "1px solid rgba(249,206,15,0.1)",
            transition: "border-color 0.15s, transform 0.15s",
            position: "relative",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(249,206,15,0.45)";
            e.currentTarget.style.transform = "scale(1.02)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(249,206,15,0.1)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <img
            src={photo.src}
            alt={photo.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
          {/* Title + date overlay */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "16px 8px 6px",
              background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
              fontFamily: "monospace",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <div style={{ fontSize: 11, color: "#f9ce0f", lineHeight: 1.3 }}>
              {photo.title}
            </div>
            <div style={{ fontSize: 9, color: "rgba(249,206,15,0.35)" }}>
              {photo.date}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ───── Video Tab ───── */

function VideoTab({ gallery }: { gallery: SongGallery }) {
  if (gallery.videos.length === 0) {
    return <NoData label="NO_SIGNAL" />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {gallery.videos.map((src, i) => (
        <div
          key={i}
          style={{
            position: "relative",
            paddingBottom: "56.25%",
            height: 0,
            border: "1px solid rgba(249,206,15,0.12)",
          }}
        >
          <iframe
            src={src}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              border: "none",
            }}
          />
        </div>
      ))}
    </div>
  );
}

/* ───── Empty state ───── */

function NoData({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: 200,
        gap: 12,
      }}
    >
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 11,
          color: "rgba(249,206,15,0.18)",
          letterSpacing: 3,
        }}
      >
        // {label}
      </div>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 10,
          color: "rgba(249,206,15,0.1)",
        }}
      >
        data will be uploaded soon
      </div>
    </div>
  );
}
