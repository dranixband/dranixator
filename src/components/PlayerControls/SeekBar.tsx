import { useRef, useState } from "react";

interface Props {
  progress: number; // 0-1 fraction
  duration: number; // seconds
  locked?: boolean;
  onSeek: (fraction: number) => void;
}

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function SeekBar({ progress, duration, locked = false, onSeek }: Props) {
  const barRef = useRef<HTMLDivElement>(null);
  const [hoverPct, setHoverPct] = useState<number | null>(null);

  const pct = progress * 100;

  const getFraction = (clientX: number) => {
    const bar = barRef.current;
    if (!bar) return null;
    const rect = bar.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (locked) return;
    const f = getFraction(e.clientX);
    if (f !== null) { onSeek(f); setHoverPct(f); }
    const onMove = (ev: MouseEvent) => {
      const fr = getFraction(ev.clientX);
      if (fr !== null) { onSeek(fr); setHoverPct(fr); }
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (locked) return;
    const f = getFraction(e.clientX);
    if (f !== null) setHoverPct(f);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (locked) return;
    e.preventDefault();
    const f = getFraction(e.touches[0].clientX);
    if (f !== null) { onSeek(f); setHoverPct(f); }
    const onMove = (ev: TouchEvent) => {
      ev.preventDefault();
      const fr = getFraction(ev.touches[0].clientX);
      if (fr !== null) { onSeek(fr); setHoverPct(fr); }
    };
    const onEnd = () => {
      setHoverPct(null);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
  };

  return (
    <div
      ref={barRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverPct(null)}
      onTouchStart={handleTouchStart}
      style={{
        width: "100%",
        height: hoverPct !== null ? 10 : 8,
        background: "rgba(255,255,255,0.1)",
        cursor: locked ? "default" : "pointer",
        position: "relative",
        transition: "height 0.1s ease",
        borderRadius: 2,
      }}
    >
      {/* Played fill */}
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          background: "#f9ce0f",
          borderRadius: 2,
          transition: "width 0.15s linear",
          position: "relative",
          zIndex: 2,
        }}
      />

      {/* Hover preview fill */}
      {hoverPct !== null && hoverPct * 100 > pct && (
        <div
          style={{
            position: "absolute",
            left: `${pct}%`,
            top: 0,
            width: `${hoverPct * 100 - pct}%`,
            height: "100%",
            background: "rgba(255,255,255,0.25)",
            borderRadius: 2,
            zIndex: 1,
          }}
        />
      )}

      {/* Circle at current position */}
      {hoverPct !== null && (
        <div
          style={{
            position: "absolute",
            left: `${pct}%`,
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#fff",
            zIndex: 3,
            boxShadow: "0 0 4px rgba(0,0,0,0.5)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Hover timecode tooltip */}
      {hoverPct !== null && (
        <div
          style={{
            position: "absolute",
            left: `${hoverPct * 100}%`,
            bottom: "calc(100% + 8px)",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.85)",
            color: "#fff",
            fontFamily: "monospace",
            fontSize: 11,
            padding: "2px 6px",
            borderRadius: 4,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          {fmt(hoverPct * duration)}
        </div>
      )}
    </div>
  );
}
