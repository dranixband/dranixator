import { useState, useRef, useCallback, useEffect } from "react";

const FRAGMENT_DURATION = 10_000; // ms
const MIN_TAPS = 5;

interface RhythmTapProps {
  audioSrc: string;
  onDataChange: (taps: number[], duration: number) => void;
}

type Phase = "ready" | "playing" | "done";

export default function RhythmTap({ audioSrc, onDataChange }: RhythmTapProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [progress, setProgress] = useState(0);
  const [taps, setTaps] = useState<number[]>([]);
  const [flash, setFlash] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startTimeRef = useRef(0);
  const rafRef = useRef(0);
  const tapsRef = useRef<number[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const tick = useCallback(() => {
    const elapsed = Date.now() - startTimeRef.current;
    const pct = Math.min(elapsed / FRAGMENT_DURATION, 1);
    setProgress(pct);

    if (pct >= 1) {
      // Done
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPhase("done");
      onDataChange(tapsRef.current, FRAGMENT_DURATION);
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [onDataChange]);

  const start = useCallback(() => {
    const audio = new Audio(audioSrc);
    audioRef.current = audio;

    // Pick a random start point (avoid last 12s to ensure 10s plays)
    audio.addEventListener("loadedmetadata", () => {
      const maxStart = Math.max(0, audio.duration - 12);
      const randomStart = Math.random() * maxStart;
      audio.currentTime = randomStart;
      audio.play();

      startTimeRef.current = Date.now();
      tapsRef.current = [];
      setTaps([]);
      setPhase("playing");
      rafRef.current = requestAnimationFrame(tick);

      // Auto-stop after fragment duration
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      }, FRAGMENT_DURATION + 100);
    }, { once: true });

    // Fallback if metadata doesn't load
    audio.addEventListener("error", () => {
      // Still start — just from beginning
      audio.currentTime = 0;
      audio.play();
      startTimeRef.current = Date.now();
      tapsRef.current = [];
      setTaps([]);
      setPhase("playing");
      rafRef.current = requestAnimationFrame(tick);
    }, { once: true });

    audio.load();
  }, [audioSrc, tick]);

  const handleTap = useCallback(() => {
    if (phase !== "playing") return;
    const t = Date.now() - startTimeRef.current;
    tapsRef.current.push(t);
    setTaps([...tapsRef.current]);
    setFlash(true);
    setTimeout(() => setFlash(false), 100);
  }, [phase]);

  const retry = useCallback(() => {
    tapsRef.current = [];
    setTaps([]);
    setProgress(0);
    setPhase("ready");
    onDataChange([], 0);
  }, [onDataChange]);

  const isValid = taps.length >= MIN_TAPS;

  return (
    <div>
      {/* Progress bar */}
      <div
        style={{
          height: 6,
          background: "rgba(0,0,0,0.3)",
          borderRadius: 3,
          marginBottom: 10,
          overflow: "hidden",
          border: "1px solid rgba(34,197,94,0.1)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            background: phase === "done"
              ? (isValid ? "rgba(34,197,94,0.6)" : "rgba(255,59,92,0.6)")
              : "rgba(245,197,66,0.6)",
            borderRadius: 3,
            transition: phase === "done" ? "background 0.3s" : "none",
          }}
        />
      </div>

      {/* Tap visualization — dots on timeline */}
      <div
        style={{
          height: 32,
          position: "relative",
          background: "rgba(0,0,0,0.2)",
          borderRadius: 6,
          marginBottom: 12,
          border: "1px solid rgba(34,197,94,0.1)",
          overflow: "hidden",
        }}
      >
        {taps.map((t, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${(t / FRAGMENT_DURATION) * 100}%`,
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: 6,
              height: 16,
              background: "#f5c542",
              borderRadius: 2,
              opacity: 0.8,
            }}
          />
        ))}
        {/* Playhead */}
        {phase === "playing" && (
          <div
            style={{
              position: "absolute",
              left: `${progress * 100}%`,
              top: 0,
              bottom: 0,
              width: 1,
              background: "rgba(255,255,255,0.3)",
            }}
          />
        )}
      </div>

      {/* Main button area */}
      {phase === "ready" && (
        <button
          type="button"
          onClick={start}
          style={{
            width: "100%",
            padding: "20px 0",
            fontSize: 13,
            fontFamily: "monospace",
            fontWeight: 700,
            color: "#f5c542",
            background: "rgba(245,197,66,0.08)",
            border: "1px dashed rgba(245,197,66,0.3)",
            borderRadius: 8,
            cursor: "pointer",
            textTransform: "uppercase",
            letterSpacing: 2,
            transition: "all 0.2s",
          }}
        >
          ▶ Start listening
        </button>
      )}

      {phase === "playing" && (
        <button
          type="button"
          onClick={handleTap}
          onTouchStart={(e) => {
            e.preventDefault();
            handleTap();
          }}
          style={{
            width: "100%",
            padding: "32px 0",
            fontSize: 18,
            fontFamily: "monospace",
            fontWeight: 700,
            color: flash ? "#0a1510" : "#f5c542",
            background: flash
              ? "rgba(245,197,66,0.9)"
              : "rgba(245,197,66,0.08)",
            border: `2px solid ${flash ? "rgba(245,197,66,0.8)" : "rgba(245,197,66,0.25)"}`,
            borderRadius: 10,
            cursor: "pointer",
            textTransform: "uppercase",
            letterSpacing: 3,
            transition: "all 0.08s",
            userSelect: "none",
            WebkitUserSelect: "none",
            touchAction: "manipulation",
          }}
        >
          TAP
        </button>
      )}

      {phase === "done" && (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 12,
              fontFamily: "monospace",
              color: isValid ? "rgba(34,197,94,0.7)" : "rgba(255,59,92,0.7)",
              marginBottom: 8,
            }}
          >
            {isValid
              ? `${taps.length} taps recorded`
              : `Need at least ${MIN_TAPS} taps (got ${taps.length})`}
          </div>
          {!isValid && (
            <button
              type="button"
              onClick={retry}
              style={{
                padding: "8px 20px",
                fontSize: 11,
                fontFamily: "monospace",
                fontWeight: 700,
                color: "#f5c542",
                background: "rgba(245,197,66,0.08)",
                border: "1px solid rgba(245,197,66,0.3)",
                borderRadius: 6,
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Try again
            </button>
          )}
        </div>
      )}

      {/* Tap counter */}
      {phase === "playing" && (
        <div
          style={{
            marginTop: 8,
            fontSize: 10,
            fontFamily: "monospace",
            color: "rgba(255,255,255,0.25)",
            textAlign: "center",
          }}
        >
          {taps.length} tap{taps.length !== 1 ? "s" : ""}
          {taps.length < MIN_TAPS && ` (need ${MIN_TAPS})`}
        </div>
      )}
    </div>
  );
}
