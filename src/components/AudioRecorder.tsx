import { useRef, useState, useCallback, useEffect } from "react";

const MAX_DURATION_MS = 15000; // 15 seconds

interface AudioRecorderProps {
  onDataChange: (audioUrl: string, durationMs: number) => void;
}

type RecordState = "idle" | "recording" | "recorded";

export default function AudioRecorder({ onDataChange }: AudioRecorderProps) {
  const [state, setState] = useState<RecordState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bars, setBars] = useState<number[]>(Array(12).fill(4));

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const audioUrl = useRef<string>("");
  const audioEl = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number>(0);
  const startTime = useRef(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (audioUrl.current) URL.revokeObjectURL(audioUrl.current);
    };
  }, []);

  const updateBars = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);

    // Sample 12 evenly-spaced frequency bands
    const barCount = 12;
    const step = Math.floor(data.length / barCount);
    const newBars = Array.from({ length: barCount }, (_, i) => {
      const val = data[i * step] / 255;
      return Math.max(4, val * 32);
    });
    setBars(newBars);

    animFrameRef.current = requestAnimationFrame(updateBars);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up analyser for waveform
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const recorder = new MediaRecorder(stream);
      audioChunks.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };

      recorder.onstop = () => {
        const finalDuration = Date.now() - startTime.current;
        setElapsed(finalDuration);

        const blob = new Blob(audioChunks.current, { type: "audio/webm" });
        if (audioUrl.current) URL.revokeObjectURL(audioUrl.current);
        audioUrl.current = URL.createObjectURL(blob);

        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          onDataChange(base64, finalDuration);
        };
        reader.readAsDataURL(blob);

        stream.getTracks().forEach((t) => t.stop());
        cancelAnimationFrame(animFrameRef.current);
        setState("recorded");
      };

      recorder.start();
      mediaRecorder.current = recorder;
      startTime.current = Date.now();
      setState("recording");

      // Timer
      timerRef.current = window.setInterval(() => {
        const now = Date.now() - startTime.current;
        setElapsed(now);
        if (now >= MAX_DURATION_MS) {
          recorder.stop();
          clearInterval(timerRef.current);
        }
      }, 100);

      // Start waveform animation
      updateBars();
    } catch {
      // Permission denied or not supported
      setState("idle");
    }
  }, [onDataChange, updateBars]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current?.state === "recording") {
      mediaRecorder.current.stop();
      clearInterval(timerRef.current);
    }
  }, []);

  const playPreview = useCallback(() => {
    if (!audioUrl.current) return;
    if (audioEl.current) {
      audioEl.current.pause();
      audioEl.current = null;
    }
    const audio = new Audio(audioUrl.current);
    audioEl.current = audio;
    audio.onended = () => setIsPlaying(false);
    audio.play();
    setIsPlaying(true);
  }, []);

  const stopPreview = useCallback(() => {
    if (audioEl.current) {
      audioEl.current.pause();
      audioEl.current.currentTime = 0;
      audioEl.current = null;
    }
    setIsPlaying(false);
  }, []);

  const reRecord = useCallback(() => {
    stopPreview();
    if (audioUrl.current) URL.revokeObjectURL(audioUrl.current);
    audioUrl.current = "";
    setElapsed(0);
    setBars(Array(12).fill(4));
    setState("idle");
  }, [stopPreview]);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const tenths = Math.floor((ms % 1000) / 100);
    return `${s}.${tenths}s`;
  };

  return (
    <div>
      {/* Waveform bars */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 3,
          height: 40,
          marginBottom: 12,
          padding: "0 8px",
        }}
      >
        {bars.map((h, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: h,
              borderRadius: 2,
              background:
                state === "recording"
                  ? "rgba(34,197,94,0.7)"
                  : state === "recorded"
                    ? "rgba(249,206,15,0.5)"
                    : "rgba(255,255,255,0.1)",
              transition: state === "recording" ? "none" : "height 0.3s",
            }}
          />
        ))}
      </div>

      {/* Timer */}
      <div
        style={{
          textAlign: "center",
          fontFamily: "monospace",
          fontSize: 20,
          color:
            state === "recording"
              ? "#22c55e"
              : state === "recorded"
                ? "#f5c542"
                : "rgba(255,255,255,0.3)",
          marginBottom: 12,
          letterSpacing: 1,
        }}
      >
        {formatTime(elapsed)}{" "}
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
          / {MAX_DURATION_MS / 1000}s
        </span>
      </div>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
        }}
      >
        {state === "idle" && (
          <button
            type="button"
            onClick={startRecording}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 18px",
              fontSize: 12,
              fontFamily: "monospace",
              fontWeight: 700,
              color: "#0a1510",
              background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
              border: "1px solid rgba(34,197,94,0.6)",
              borderRadius: 6,
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {/* Mic icon */}
            <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor">
              <rect x="3" y="0" width="6" height="9" rx="3" />
              <path d="M1 7v1a5 5 0 0010 0V7" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <line x1="6" y1="13" x2="6" y2="15" stroke="currentColor" strokeWidth="1.5" />
              <line x1="3" y1="15" x2="9" y2="15" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            Record
          </button>
        )}

        {state === "recording" && (
          <button
            type="button"
            onClick={stopRecording}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 18px",
              fontSize: 12,
              fontFamily: "monospace",
              fontWeight: 700,
              color: "#fff",
              background: "linear-gradient(135deg, #df0221 0%, #b91c1c 100%)",
              border: "1px solid rgba(220,38,38,0.6)",
              borderRadius: 6,
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: 1,
              animation: "ctb-pulse 1.5s ease-in-out infinite",
            }}
          >
            {/* Stop square */}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <rect x="1" y="1" width="10" height="10" rx="1" />
            </svg>
            Stop
          </button>
        )}

        {state === "recorded" && (
          <>
            <button
              type="button"
              onClick={isPlaying ? stopPreview : playPreview}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                fontSize: 12,
                fontFamily: "monospace",
                fontWeight: 700,
                color: "#f5c542",
                background: "rgba(245,197,66,0.1)",
                border: "1px solid rgba(245,197,66,0.3)",
                borderRadius: 6,
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {isPlaying ? (
                <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
                  <rect x="0" y="0" width="3" height="12" rx="1" />
                  <rect x="7" y="0" width="3" height="12" rx="1" />
                </svg>
              ) : (
                <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
                  <path d="M1 1L9 6L1 11V1Z" />
                </svg>
              )}
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              onClick={reRecord}
              style={{
                padding: "8px 14px",
                fontSize: 12,
                fontFamily: "monospace",
                color: "rgba(255,255,255,0.4)",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 6,
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Re-record
            </button>
          </>
        )}
      </div>
    </div>
  );
}
