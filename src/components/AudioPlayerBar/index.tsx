import type { SongChip } from "../Board";
import { SUBMITHUB_LINKS } from "../../constants/submithubLinks";
import { useIsMobile } from "../../hooks/useIsMobile";
import { SpotifyIcon, AppleMusicIcon, YoutubeMusicIcon } from "./StreamingIcons";
import SeekBar from "../PlayerControls/SeekBar";
import VolumeSlider from "../PlayerControls/VolumeSlider";
import TimeDisplay from "../PlayerControls/TimeDisplay";

interface Props {
  song: SongChip;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  locked?: boolean;
  style?: React.CSSProperties;
  onToggle: () => void;
  onSeek: (fraction: number) => void;
  onVolumeChange: (vol: number) => void;
  onClose: () => void;
}


export default function AudioPlayerBar({
  song,
  isPlaying,
  progress,
  duration,
  volume,
  locked = false,
  style,
  onToggle,
  onSeek,
  onVolumeChange,
  onClose,
}: Props) {
  const isMobile = useIsMobile();
  const fraction = duration > 0 ? progress / duration : 0;

  const playBtn = (
    <button
      onClick={locked ? undefined : onToggle}
      style={{
        width: 36, height: 36, borderRadius: "50%",
        background: "rgba(249,206,15,0.1)",
        border: "1px solid rgba(249,206,15,0.3)",
        cursor: locked ? "default" : "pointer",
        opacity: locked ? 0.4 : 1,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, transition: "all 0.15s",
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
  );

  const songInfo = (
    <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", gap: 2 }}>
      <div style={{ fontFamily: "monospace", fontSize: 13, color: "#f9ce0f", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {song.label}
      </div>
      {SUBMITHUB_LINKS[song.label] && (
        <a
          href={SUBMITHUB_LINKS[song.label]}
          target="_blank"
          rel="noopener noreferrer"
          className="player-listen-link"
          style={{ fontFamily: "monospace", fontSize: 10, color: "#f9ce0f", textDecoration: "none", letterSpacing: "0.04em", display: "inline-flex", alignItems: "center", gap: 5, width: "fit-content" }}
        >
          {"// listen on streaming ↗"}
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, opacity: 0.7 }}>
            <SpotifyIcon />
            <AppleMusicIcon />
            <YoutubeMusicIcon />
          </span>
        </a>
      )}
    </div>
  );

  const timeEl = <TimeDisplay current={progress} duration={duration} />;

  const closeBtn = (
    <button
      onClick={locked ? undefined : onClose}
      style={{
        width: 28, height: 28, borderRadius: 4,
        background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
        cursor: locked ? "default" : "pointer", opacity: locked ? 0.4 : 1,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, color: "rgba(255,255,255,0.4)", fontSize: 16, lineHeight: 1,
      }}
    >
      &times;
    </button>
  );

  return (
    <div
      className="fixed"
      style={{
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        width: isMobile ? "calc(100vw - 32px)" : "50%",
        minWidth: isMobile ? undefined : 360,
        zIndex: 1100,
        background: "rgba(0,0,0,0.55)",
        border: "1px solid rgba(249,206,15,0.15)",
        borderRadius: 12,
        padding: "10px 14px",
        backdropFilter: "blur(16px)",
        cursor: "default",
        ...style,
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Progress bar */}
      <div style={{ marginBottom: 10 }}>
        <SeekBar
          progress={fraction}
          duration={duration}
          locked={locked}
          onSeek={onSeek}
        />
      </div>

      {isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {playBtn}
            {songInfo}
            {closeBtn}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {timeEl}
            <div style={{ flex: 1 }} />
            <VolumeSlider volume={volume} locked={locked} onChange={onVolumeChange} />
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {playBtn}
          {songInfo}
          {timeEl}
          <VolumeSlider volume={volume} locked={locked} onChange={onVolumeChange} />
          {closeBtn}
        </div>
      )}
    </div>
  );
}
