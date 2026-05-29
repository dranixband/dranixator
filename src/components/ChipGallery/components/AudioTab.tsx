import { useRef, useState, useEffect } from "react";
import type { SongGallery } from "../../../constants/gallery";
import SamplerPads from "./SamplerPads";
import NoData from "./NoData";

export default function AudioTab({ gallery }: { gallery: SongGallery }) {
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
