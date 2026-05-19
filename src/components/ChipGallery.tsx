import { useState, useRef, useEffect } from "react";
import type { SongLabel } from "../constants/songs";
import { SONG_GALLERY, type SongGallery } from "../constants/gallery";

type Tab = "AUDIO" | "PHOTO_LOG" | "VIDEO_FEED";

interface Props {
  songLabel: SongLabel;
  onClose: () => void;
}

export default function ChipGallery({ songLabel, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("AUDIO");
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  const gallery = SONG_GALLERY[songLabel];

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (lightboxPhoto) setLightboxPhoto(null);
        else onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxPhoto, onClose]);

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
            width: "min(92vw, 880px)",
            height: "min(88vh, 660px)",
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
                style={{ fontFamily: "monospace", fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
              >
                <span style={{ color: "rgba(249,206,15,0.3)" }}>&gt;&gt; </span>
                <span style={{ color: "rgba(249,206,15,0.45)" }}>CHIP_DATA /</span>
                <span style={{ color: "#f9ce0f", marginLeft: 6 }}>{songLabel}</span>
              </div>
              <button className="gallery-btn-close shrink-0" onClick={onClose}>
                × DISC
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
            {tab === "AUDIO" && (
              <AudioTab gallery={gallery} />
            )}
            {tab === "PHOTO_LOG" && (
              <PhotoTab
                gallery={gallery}
                onLightbox={setLightboxPhoto}
              />
            )}
            {tab === "VIDEO_FEED" && <VideoTab gallery={gallery} />}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-[600] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.96)" }}
          onClick={() => setLightboxPhoto(null)}
        >
          <img
            src={lightboxPhoto}
            alt=""
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              objectFit: "contain",
              border: "1px solid rgba(249,206,15,0.2)",
            }}
          />
          <div
            className="absolute top-6 right-8"
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
    return () => { audioRef.current?.pause(); };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  function togglePlay() {
    const a = audioRef.current;
    if (!a) return;
    if (isPlaying) { a.pause(); setIsPlaying(false); }
    else { a.play(); setIsPlaying(true); }
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
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Player */}
      <div
        style={{
          background: "rgba(249,206,15,0.03)",
          border: "1px solid rgba(249,206,15,0.12)",
          padding: "10px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {/* Label above progress bar */}
        <span style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(249,206,15,0.35)", letterSpacing: 2 }}>
          DEMO_RECORDING
        </span>

        {/* Progress bar — full width */}
        <div
          onClick={handleSeek}
          style={{
            width: "100%",
            height: 8,
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

        {/* Controls row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            style={{
              width: 32,
              height: 32,
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
              <svg width="10" height="12" viewBox="0 0 10 12" fill="#f9ce0f">
                <rect x="1" y="1" width="3" height="10" rx="0.5" />
                <rect x="6" y="1" width="3" height="10" rx="0.5" />
              </svg>
            ) : (
              <svg width="10" height="12" viewBox="0 0 10 12" fill="#f9ce0f" style={{ marginLeft: 1 }}>
                <path d="M1 1L9 6L1 11V1Z" />
              </svg>
            )}
          </button>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Time */}
          <span style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(249,206,15,0.45)", flexShrink: 0 }}>
            {fmt(currentTime)} / {duration > 0 ? fmt(duration) : "--:--"}
          </span>

          {/* Volume */}
          <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="rgba(249,206,15,0.35)">
              <path d="M2 5.5h2.5L8 2v12L4.5 10.5H2a1 1 0 01-1-1v-3a1 1 0 011-1z" />
              {volume > 0.01 && (
                <path d="M10 5.5a3.5 3.5 0 010 5" fill="none" stroke="rgba(249,206,15,0.35)" strokeWidth="1.3" />
              )}
              {volume > 0.5 && (
                <path d="M11.5 3.5a6 6 0 010 9" fill="none" stroke="rgba(249,206,15,0.2)" strokeWidth="1.3" />
              )}
            </svg>
            <div
              ref={volBarRef}
              onMouseDown={handleVolMouseDown}
              style={{ width: 50, height: 3, background: "rgba(249,206,15,0.1)", borderRadius: 2, cursor: "pointer", position: "relative" }}
            >
              <div style={{ width: `${volume * 100}%`, height: "100%", background: "rgba(249,206,15,0.5)", borderRadius: 2 }} />
              <div
                style={{
                  position: "absolute",
                  left: `${volume * 100}%`,
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#f9ce0f",
                }}
              />
            </div>
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
          onEnded={() => { setIsPlaying(false); setProgress(0); setCurrentTime(0); }}
        />
      </div>

      {/* Instrumental download */}
      <div
        style={{
          background: "rgba(249,206,15,0.03)",
          border: "1px solid rgba(249,206,15,0.12)",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 10,
              color: "rgba(249,206,15,0.3)",
              letterSpacing: 2,
              marginBottom: 4,
            }}
          >
            INSTRUMENTAL
          </div>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 12,
              color: gallery.instrumental ? "rgba(249,206,15,0.7)" : "rgba(249,206,15,0.2)",
            }}
          >
            {gallery.instrumental ? "instrumental.wav" : "// not_available_yet"}
          </div>
        </div>
        {gallery.instrumental ? (
          <a
            href={gallery.instrumental}
            download
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              color: "#f9ce0f",
              border: "1px solid rgba(249,206,15,0.4)",
              padding: "6px 16px",
              textDecoration: "none",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "rgba(249,206,15,0.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
            }}
          >
            ⬇ DOWNLOAD
          </a>
        ) : (
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              color: "rgba(249,206,15,0.15)",
              border: "1px solid rgba(249,206,15,0.08)",
              padding: "6px 16px",
            }}
          >
            ⬇ DOWNLOAD
          </div>
        )}
      </div>

      {/* 3D spinning DRANIX */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 120,
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
            textShadow: "0 0 24px rgba(249,206,15,0.5), 0 0 60px rgba(249,206,15,0.15)",
          }}
        >
          DRANIX
        </span>
      </div>

      {/* ASCII chip spin */}
      {/* SpinningChip available as standalone component — not shown here */}
    </div>
  );
}

/* ───── ASCII Spinning Chip ───── */

// Each frame: 5 lines. Perspective from top-right: front face + top slant (╱) + right side (║).
// Front face width shrinks/grows. At 90°/270° only the side face is visible.
const CHIP_FRAMES: string[] = [
  // 0° — full front + thin top + thin side
  " ╔════════════╗ \n╱░░░░░░░░░░░░╱║\n║░◈ DRANIX ◈░║║\n║░░░░░░░░░░░░║║\n╚════════════╝╱",
  // 30°
  " ╔══════════╗  \n╱░░░░░░░░░░╱║ \n║░◈DRANIX◈░║║ \n║░░░░░░░░░░║║ \n╚══════════╝╱ ",
  // 60°
  " ╔═══════╗    \n╱░░░░░░░╱║   \n║◈DRANIX◈║║  \n║░░░░░░░║║   \n╚═══════╝╱   ",
  // 80° — almost edge, side growing
  " ╔════╗       \n╱░░░░╱║║     \n║◈DRN◈║║║    \n║░░░░║║║     \n╚════╝╱║     ",
  // 90° — edge, side face is main view
  "  ╔══╗╔╗     \n  ║░░║║║     \n  ║░░║║║     \n  ║░░║║║     \n  ╚══╝╚╝     ",
  // 100° — back side appears, side shrinking
  " ╔════╗       \n╱░░░░╱║║     \n║◈XND◈║║║    \n║░░░░║║║     \n╚════╝╱║     ",
  // 120° — back face growing
  " ╔═══════╗    \n╱░░░░░░░╱║   \n║◈XINARD◈║║  \n║░░░░░░░║║   \n╚═══════╝╱   ",
  // 150°
  " ╔══════════╗  \n╱░░░░░░░░░░╱║ \n║░◈XINARD◈░║║ \n║░░░░░░░░░░║║ \n╚══════════╝╱ ",
  // 180° — full back + thin top + thin side
  " ╔════════════╗ \n╱░░░░░░░░░░░░╱║\n║░◈ XINARD ◈░║║\n║░░░░░░░░░░░░║║\n╚════════════╝╱",
  // 210°
  " ╔══════════╗  \n╱░░░░░░░░░░╱║ \n║░◈XINARD◈░║║ \n║░░░░░░░░░░║║ \n╚══════════╝╱ ",
  // 240°
  " ╔═══════╗    \n╱░░░░░░░╱║   \n║◈XINARD◈║║  \n║░░░░░░░║║   \n╚═══════╝╱   ",
  // 260°
  " ╔════╗       \n╱░░░░╱║║     \n║◈XND◈║║║    \n║░░░░║║║     \n╚════╝╱║     ",
  // 270° — edge
  "  ╔══╗╔╗     \n  ║░░║║║     \n  ║░░║║║     \n  ║░░║║║     \n  ╚══╝╚╝     ",
  // 280° — front returns
  " ╔════╗       \n╱░░░░╱║║     \n║◈DRN◈║║║    \n║░░░░║║║     \n╚════╝╱║     ",
  // 300°
  " ╔═══════╗    \n╱░░░░░░░╱║   \n║◈DRANIX◈║║  \n║░░░░░░░║║   \n╚═══════╝╱   ",
  // 330°
  " ╔══════════╗  \n╱░░░░░░░░░░╱║ \n║░◈DRANIX◈░║║ \n║░░░░░░░░░░║║ \n╚══════════╝╱ ",
];

function SpinningChip() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % CHIP_FRAMES.length), 110);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, paddingTop: 16, paddingBottom: 8 }}>
      <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(249,206,15,0.2)", letterSpacing: 3 }}>
        // chip_render.exe
      </div>
      <pre
        style={{
          fontFamily: "monospace",
          fontSize: "clamp(10px, 2.2vw, 13px)",
          color: "#f9ce0f",
          lineHeight: 1.5,
          margin: 0,
          textShadow: "0 0 10px rgba(249,206,15,0.35)",
          letterSpacing: "0.02em",
        }}
      >
        {CHIP_FRAMES[idx]}
      </pre>
    </div>
  );
}

/* ───── Photo Tab ───── */

function PhotoTab({
  gallery,
  onLightbox,
}: {
  gallery: SongGallery;
  onLightbox: (src: string) => void;
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
      {gallery.photos.map((src, i) => (
        <div
          key={i}
          onClick={() => onLightbox(src)}
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
            src={src}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
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
