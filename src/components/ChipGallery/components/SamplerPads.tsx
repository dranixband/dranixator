import { useState, useRef, useEffect, useMemo } from "react";
import { useIsMobile } from "../hooks/useIsMobile";

const DEFAULT_SAMPLE_PADS = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  label: `sample_0${i + 1}`,
  src: "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/audio/samples/dead/okay.mp3",
}));

export default function SamplerPads({
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
                onPointerDown={(e) => {
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
