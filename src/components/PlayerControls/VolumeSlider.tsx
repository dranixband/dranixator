import { useRef } from "react";

interface Props {
  volume: number; // 0-1
  locked?: boolean;
  onChange: (vol: number) => void;
}

export default function VolumeSlider({
  volume,
  locked = false,
  onChange,
}: Props) {
  const barRef = useRef<HTMLDivElement>(null);
  const prevVolRef = useRef<number>(1);

  const getFraction = (clientX: number) => {
    const bar = barRef.current;
    if (!bar) return null;
    const rect = bar.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  };

  const handleMuteToggle = () => {
    if (locked) return;
    if (volume > 0.01) {
      prevVolRef.current = volume;
      onChange(0);
    } else {
      onChange(prevVolRef.current > 0.01 ? prevVolRef.current : 0.7);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (locked) return;
    const f = getFraction(e.clientX);
    if (f !== null) onChange(f);
    const onMove = (ev: MouseEvent) => {
      const fr = getFraction(ev.clientX);
      if (fr !== null) onChange(fr);
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (locked) return;
    e.preventDefault();
    const f = getFraction(e.touches[0].clientX);
    if (f !== null) onChange(f);
    const onMove = (ev: TouchEvent) => {
      ev.preventDefault();
      const fr = getFraction(ev.touches[0].clientX);
      if (fr !== null) onChange(fr);
    };
    const onEnd = () => {
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
  };

  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 16 16"
        fill="rgba(249,206,15,0.35)"
        onClick={handleMuteToggle}
        style={{ cursor: locked ? "default" : "pointer", flexShrink: 0 }}
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
        {volume <= 0.01 && (
          <path
            d="M10 6l3 3m0-3l-3 3"
            stroke="rgba(249,206,15,0.5)"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        )}
      </svg>
      <div
        ref={barRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{
          width: 60,
          height: 6,
          background: "rgba(249,206,15,0.1)",
          borderRadius: 2,
          cursor: locked ? "default" : "pointer",
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
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#f9ce0f",
          }}
        />
      </div>
    </div>
  );
}
