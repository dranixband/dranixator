import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import type { Review, NodeType } from "./Board";
import type { SongLabel } from "../constants/songs";
import PixelCanvas from "./PixelCanvas";
import EmojiRiddle from "./EmojiRiddle";
import RhythmTap from "./RhythmTap";
import SlidingPuzzle from "./SlidingPuzzle";
import MemoryGame from "./MemoryGame";
import WireTrace from "./WireTrace";
import WordScramble from "./WordScramble";

const MIN_CHARS = 5;
const MAX_CHARS = 150;

const PROMPTS = [
  "Describe this song in 3 words",
  "What color is this track?",
  "In what movie could this track play?",
  "One word — association",
  "What time of day does this song sound like?",
  "What weather matches this track?",
  "What animal is this song?",
  "Describe the mood in one sentence",
  "What would you do while listening to this?",
  "If this song were a place — where?",
  "Rate this track with a metaphor",
  "What does the vocalist's voice remind you of?",
  "What emotion hits hardest in this track?",
  "Describe this song to someone who hasn't heard it",
  "What genre would you invent for this track?",
];

interface ReviewPopupProps {
  songName: string;
  nodeType: NodeType;
  audioSrc?: string;
  puzzleImage?: string;
  difficulty?: number;
  onSubmit: (review: Review) => void;
  onClose: () => void;
  onPlayFragment?: (startTime: number, endTime: number) => void;
}

const NODE_TYPE_LABELS: Record<NodeType, string> = {
  prompt: "Answer a question",
  rhythm: "Tap the rhythm",
  drawing: "Draw pixel art",
  riddle: "Guess the track",
  puzzle: "Solve the puzzle",
  memory: "Find all pairs",
  wire: "Trace the wire",
  wordScramble: "Unscramble lyrics",
};

export default function ReviewPopup({
  songName,
  nodeType,
  audioSrc,
  puzzleImage,
  difficulty = 0,
  onSubmit,
  onClose,
  onPlayFragment,
}: ReviewPopupProps) {
  const [name, setName] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  // Prompt state
  const currentPrompt = useMemo(
    () => PROMPTS[Math.floor(Math.random() * PROMPTS.length)],
    [],
  );
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Riddle state
  const [riddleCorrect, setRiddleCorrect] = useState<boolean | null>(null);

  // Rhythm state
  const [rhythmData, setRhythmData] = useState<{
    taps: number[];
    duration: number;
  } | null>(null);

  // Drawing state
  const [drawingDataUrl, setDrawingDataUrl] = useState<string>("");

  // Puzzle state
  const [puzzleMoves, setPuzzleMoves] = useState<number | null>(null);

  // Memory state
  const [memoryFlips, setMemoryFlips] = useState<number | null>(null);

  // Wire state
  const [wireLines, setWireLines] = useState<number | null>(null);

  // WordScramble state
  const [scrambleAttempts, setScrambleAttempts] = useState<number | null>(null);

  const charCount = text.length;
  const isTextValid = charCount >= MIN_CHARS && charCount <= MAX_CHARS;
  const isOverLimit = charCount > MAX_CHARS;

  const isValid =
    nodeType === "prompt"
      ? isTextValid
      : nodeType === "rhythm"
        ? !!(rhythmData && rhythmData.taps.length >= 5)
        : nodeType === "drawing"
          ? !!drawingDataUrl
          : nodeType === "riddle"
            ? riddleCorrect === true
            : nodeType === "puzzle"
              ? puzzleMoves !== null
              : nodeType === "memory"
                ? memoryFlips !== null
                : nodeType === "wire"
                  ? wireLines !== null
                  : nodeType === "wordScramble"
                    ? scrambleAttempts !== null
                    : false;

  // Focus textarea for prompt
  useEffect(() => {
    if (nodeType === "prompt") {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [nodeType]);

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Outside click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [onClose],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!isValid) return;

      const authorName = name.trim() || "Anonymous";

      switch (nodeType) {
        case "prompt":
          onSubmit({
            type: "prompt",
            name: authorName,
            prompt: currentPrompt,
            text: text.trim(),
          });
          break;
        case "rhythm":
          if (rhythmData) {
            onSubmit({
              type: "rhythm",
              name: authorName,
              taps: rhythmData.taps,
              duration: rhythmData.duration,
            });
          }
          break;
        case "drawing":
          onSubmit({
            type: "drawing",
            name: authorName,
            imageDataUrl: drawingDataUrl,
          });
          break;
        case "riddle":
          if (riddleCorrect !== null) {
            onSubmit({
              type: "riddle",
              name: authorName,
              correct: riddleCorrect,
            });
          }
          break;
        case "puzzle":
          if (puzzleMoves !== null) {
            onSubmit({
              type: "puzzle",
              name: authorName,
              moves: puzzleMoves,
            });
          }
          break;
        case "memory":
          if (memoryFlips !== null) {
            onSubmit({
              type: "memory",
              name: authorName,
              flips: memoryFlips,
            });
          }
          break;
        case "wire":
          if (wireLines !== null) {
            onSubmit({
              type: "wire",
              name: authorName,
              lines: wireLines,
            });
          }
          break;
        case "wordScramble":
          if (scrambleAttempts !== null) {
            onSubmit({
              type: "wordScramble",
              name: authorName,
              attempts: scrambleAttempts,
            });
          }
          break;
      }
    },
    [name, text, nodeType, isValid, rhythmData, drawingDataUrl, riddleCorrect, puzzleMoves, memoryFlips, wireLines, scrambleAttempts, currentPrompt, onSubmit],
  );

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 1000, pointerEvents: "all" }}
      onMouseDown={handleBackdropClick}
      onClick={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div
        ref={cardRef}
        className="review-popup-enter"
        style={{
          position: "relative",
          width: 380,
          maxHeight: "90vh",
          overflowY: "auto",
          background:
            "linear-gradient(160deg, #0c1a12 0%, #0a1510 50%, #0d1c14 100%)",
          border: "1px solid rgba(34, 197, 94, 0.25)",
          borderRadius: 12,
          padding: 24,
          boxShadow: `
            0 0 40px rgba(0,0,0,0.6),
            0 0 20px rgba(34,197,94,0.08),
            inset 0 1px 0 rgba(255,255,255,0.04)
          `,
          pointerEvents: "all",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 6,
            color: "rgba(255,255,255,0.4)",
            fontSize: 16,
            fontFamily: "monospace",
            cursor: "pointer",
            transition: "all 0.2s",
            padding: 0,
            lineHeight: 1,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,59,92,0.15)";
            e.currentTarget.style.borderColor = "rgba(255,59,92,0.3)";
            e.currentTarget.style.color = "#ff3b5c";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            e.currentTarget.style.color = "rgba(255,255,255,0.4)";
          }}
        >
          &times;
        </button>

        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 10,
              fontFamily: "monospace",
              color: "rgba(34,197,94,0.5)",
              textTransform: "uppercase",
              letterSpacing: 2,
              marginBottom: 4,
            }}
          >
            {NODE_TYPE_LABELS[nodeType]}
          </div>
          {(() => {
            const level = Math.round(difficulty * 6);
            const label = ["Easy", "Easy+", "Medium", "Medium+", "Hard", "Hard+", "Expert"][level];
            // green(0) → yellow(0.5) → red(1)
            const r = Math.round(difficulty <= 0.5 ? difficulty * 2 * 255 : 255);
            const g = Math.round(difficulty <= 0.5 ? 255 : (1 - (difficulty - 0.5) * 2) * 255);
            const color = `rgb(${r},${g},50)`;
            return (
              <div
                style={{
                  fontSize: 10,
                  fontFamily: "monospace",
                  color,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 6,
                  opacity: 0.8,
                }}
              >
                Lv.{level + 1} — {label}
              </div>
            );
          })()}
          <div
            style={{
              fontSize: 18,
              fontFamily: "monospace",
              color: "#f5c542",
              fontWeight: 700,
            }}
          >
            {songName}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name input (shared across all types) */}
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontFamily: "monospace",
                color: "rgba(255,255,255,0.35)",
                marginBottom: 5,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Your name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Anonymous"
              maxLength={30}
              style={{
                width: "100%",
                padding: "8px 12px",
                fontSize: 14,
                fontFamily: "monospace",
                color: "#e0e0e0",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(34,197,94,0.15)",
                borderRadius: 6,
                outline: "none",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "rgba(34,197,94,0.4)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(34,197,94,0.15)")
              }
            />
          </div>

          {/* === PROMPT FORM === */}
          {nodeType === "prompt" && (
            <div style={{ marginBottom: 16 }}>
              {/* The random prompt */}
              <div
                style={{
                  padding: "10px 14px",
                  marginBottom: 10,
                  background: "rgba(245,197,66,0.06)",
                  border: "1px solid rgba(245,197,66,0.15)",
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: "monospace",
                  color: "#f5c542",
                  lineHeight: 1.4,
                }}
              >
                {currentPrompt}
              </div>
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS + 10))}
                placeholder="Your answer..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  fontSize: 14,
                  fontFamily: "monospace",
                  color: "#e0e0e0",
                  background: "rgba(0,0,0,0.3)",
                  border: `1px solid ${isOverLimit ? "rgba(255,59,92,0.5)" : "rgba(34,197,94,0.15)"}`,
                  borderRadius: 6,
                  outline: "none",
                  resize: "none",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
                  lineHeight: 1.5,
                }}
                onFocus={(e) => {
                  if (!isOverLimit)
                    e.target.style.borderColor = "rgba(34,197,94,0.4)";
                }}
                onBlur={(e) => {
                  if (!isOverLimit)
                    e.target.style.borderColor = "rgba(34,197,94,0.15)";
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 5,
                  fontSize: 11,
                  fontFamily: "monospace",
                }}
              >
                <span
                  style={{
                    color:
                      charCount < MIN_CHARS
                        ? "rgba(255,255,255,0.25)"
                        : "rgba(34,197,94,0.5)",
                  }}
                >
                  {charCount < MIN_CHARS
                    ? `${MIN_CHARS - charCount} more chars needed`
                    : "Ready"}
                </span>
                <span
                  style={{
                    color: isOverLimit
                      ? "#ff3b5c"
                      : charCount > MAX_CHARS - 20
                        ? "#f5c542"
                        : "rgba(255,255,255,0.2)",
                  }}
                >
                  {charCount}/{MAX_CHARS}
                </span>
              </div>
            </div>
          )}

          {/* === RHYTHM FORM === */}
          {nodeType === "rhythm" && (
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontFamily: "monospace",
                  color: "rgba(255,255,255,0.35)",
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Tap along to the beat
              </label>
              {audioSrc ? (
                <RhythmTap
                  audioSrc={audioSrc}
                  onDataChange={(taps, duration) =>
                    setRhythmData(taps.length > 0 ? { taps, duration } : null)
                  }
                />
              ) : (
                <div
                  style={{
                    padding: 16,
                    fontSize: 12,
                    fontFamily: "monospace",
                    color: "rgba(255,59,92,0.6)",
                    textAlign: "center",
                  }}
                >
                  No audio available for this chip
                </div>
              )}
            </div>
          )}

          {/* === DRAWING FORM === */}
          {nodeType === "drawing" && (
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontFamily: "monospace",
                  color: "rgba(255,255,255,0.35)",
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Pixel art
              </label>
              <PixelCanvas onDataChange={setDrawingDataUrl} />
            </div>
          )}

          {/* === RIDDLE FORM === */}
          {nodeType === "riddle" && (
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontFamily: "monospace",
                  color: "rgba(255,255,255,0.35)",
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Emoji riddle
              </label>
              <EmojiRiddle onSolved={(correct) => setRiddleCorrect(correct)} />
            </div>
          )}

          {/* === PUZZLE FORM === */}
          {nodeType === "puzzle" && (
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontFamily: "monospace",
                  color: "rgba(255,255,255,0.35)",
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Sliding puzzle
              </label>
              <SlidingPuzzle
                imageSrc={puzzleImage || "https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/puzzles/misha.png"}
                onSolved={(moves) => setPuzzleMoves(moves)}
              />
            </div>
          )}

          {/* === MEMORY FORM === */}
          {nodeType === "memory" && (
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontFamily: "monospace",
                  color: "rgba(255,255,255,0.35)",
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Memory game
              </label>
              <MemoryGame difficulty={difficulty} onSolved={(flips) => setMemoryFlips(flips)} />
            </div>
          )}

          {/* === WIRE FORM === */}
          {nodeType === "wire" && (
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontFamily: "monospace",
                  color: "rgba(255,255,255,0.35)",
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Wire trace
              </label>
              <WireTrace difficulty={difficulty} onSolved={(l) => setWireLines(l)} />
            </div>
          )}

          {/* === WORD SCRAMBLE FORM === */}
          {nodeType === "wordScramble" && (
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontFamily: "monospace",
                  color: "rgba(255,255,255,0.35)",
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Unscramble the lyrics
              </label>
              <WordScramble
                difficulty={difficulty}
                songLabel={songName as SongLabel}
                onSolved={(attempts) => setScrambleAttempts(attempts)}
                onPlayFragment={onPlayFragment}
              />
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={!isValid}
            style={{
              width: "100%",
              padding: "10px 0",
              fontSize: 13,
              fontFamily: "monospace",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 2,
              color: isValid ? "#0a1510" : "rgba(255,255,255,0.15)",
              background: isValid
                ? "linear-gradient(135deg, #f5c542 0%, #d4a030 100%)"
                : "rgba(255,255,255,0.05)",
              border: isValid
                ? "1px solid rgba(245,197,66,0.6)"
                : "1px solid rgba(255,255,255,0.06)",
              borderRadius: 6,
              cursor: isValid ? "pointer" : "default",
              transition: "all 0.3s ease",
              boxShadow: isValid
                ? "0 0 15px rgba(245,197,66,0.2), 0 0 30px rgba(245,197,66,0.05)"
                : "none",
            }}
          >
            Connect Node
          </button>
        </form>
      </div>
    </div>
  );
}
