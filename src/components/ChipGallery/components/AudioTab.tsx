import { useRef, useState, useEffect } from "react";
import type { SongGallery } from "../../../constants/gallery";
import SamplerPads from "./SamplerPads";
import NoData from "./NoData";
import SeekBar from "../../PlayerControls/SeekBar";
import VolumeSlider from "../../PlayerControls/VolumeSlider";
import TimeDisplay from "../../PlayerControls/TimeDisplay";
import { useIsMobile } from "../../../hooks/useIsMobile";

export default function AudioTab({ gallery }: { gallery: SongGallery }) {
  const isMobile = useIsMobile();
  const audioRef = useRef<HTMLAudioElement | null>(null);
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

  function handleSeek(fraction: number) {
    const a = audioRef.current;
    if (!a || !a.duration) return;
    a.currentTime = fraction * a.duration;
    setProgress(fraction);
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

        {/* Label + progress bar */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
          <span style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(249,206,15,0.3)", letterSpacing: 2 }}>
            DEMO_RECORDING
          </span>
          <SeekBar progress={progress} duration={duration} onSeek={handleSeek} />
          {isMobile && (
            <div style={{ display: "flex", alignItems: "center", marginTop: 4 }}>
              <TimeDisplay current={currentTime} duration={duration} />
              <div style={{ flex: 1 }} />
              <VolumeSlider volume={volume} onChange={setVolume} />
            </div>
          )}
        </div>

        {!isMobile && (
          <>
            <TimeDisplay current={currentTime} duration={duration} />
            <VolumeSlider volume={volume} onChange={setVolume} />
          </>
        )}

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
