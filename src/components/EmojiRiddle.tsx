import { useState, useCallback, useMemo } from "react";
import { RIDDLES } from "../constants/riddles";

interface EmojiRiddleProps {
  onSolved: (correct: boolean) => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function EmojiRiddle({ onSolved }: EmojiRiddleProps) {
  const [riddleIdx, setRiddleIdx] = useState(
    () => Math.floor(Math.random() * RIDDLES.length),
  );
  const riddle = RIDDLES[riddleIdx];

  const options = useMemo(
    () => shuffle([riddle.answer, ...riddle.decoys]),
    [riddle],
  );

  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handlePick = useCallback(
    (option: string) => {
      if (revealed) return;
      setSelected(option);
      setRevealed(true);
      onSolved(option === riddle.answer);
    },
    [revealed, riddle.answer, onSolved],
  );

  const isCorrect = selected === riddle.answer;

  return (
    <div>
      {/* Emoji clue */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          padding: "16px",
          marginBottom: 14,
          background: "rgba(0,0,0,0.3)",
          border: "1px solid rgba(34,197,94,0.15)",
          borderRadius: 8,
          fontSize: 36,
        }}
      >
        {riddle.emojis.map((e, i) => (
          <span key={i}>{e + "\uFE0F"}</span>
        ))}
      </div>

      {/* Question */}
      <div
        style={{
          fontSize: 12,
          fontFamily: "monospace",
          color: "rgba(255,255,255,0.4)",
          textAlign: "center",
          marginBottom: 12,
        }}
      >
        Which track is this?
      </div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {options.map((opt) => {
          const isThis = selected === opt;
          const isAnswer = opt === riddle.answer;

          let bg = "rgba(0,0,0,0.2)";
          let border = "1px solid rgba(255,255,255,0.08)";
          let color = "rgba(255,255,255,0.6)";

          if (revealed) {
            if (isAnswer) {
              bg = "rgba(34,197,94,0.15)";
              border = "1px solid rgba(34,197,94,0.5)";
              color = "#22c55e";
            } else if (isThis && !isAnswer) {
              bg = "rgba(255,59,92,0.1)";
              border = "1px solid rgba(255,59,92,0.4)";
              color = "#ff3b5c";
            } else {
              color = "rgba(255,255,255,0.2)";
            }
          }

          return (
            <button
              key={opt}
              type="button"
              onClick={() => handlePick(opt)}
              disabled={revealed}
              style={{
                padding: "10px 14px",
                fontSize: 13,
                fontFamily: "monospace",
                color,
                background: bg,
                border,
                borderRadius: 6,
                cursor: revealed ? "default" : "pointer",
                textAlign: "left",
                transition: "all 0.15s",
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Result */}
      {revealed && (
        <div
          style={{
            marginTop: 12,
            fontSize: 11,
            fontFamily: "monospace",
            textAlign: "center",
          }}
        >
          {isCorrect ? (
            <span style={{ color: "rgba(34,197,94,0.7)" }}>Correct!</span>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <span style={{ color: "rgba(255,59,92,0.7)" }}>
                Wrong — it was "{riddle.answer}"
              </span>
              <button
                type="button"
                onClick={() => {
                  // Pick a different riddle
                  let next = riddleIdx;
                  while (next === riddleIdx && RIDDLES.length > 1) {
                    next = Math.floor(Math.random() * RIDDLES.length);
                  }
                  setRiddleIdx(next);
                  setSelected(null);
                  setRevealed(false);
                }}
                style={{
                  padding: "5px 16px",
                  fontSize: 10,
                  fontFamily: "monospace",
                  fontWeight: 700,
                  color: "#f5c542",
                  background: "rgba(245,197,66,0.08)",
                  border: "1px solid rgba(245,197,66,0.3)",
                  borderRadius: 5,
                  cursor: "pointer",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Try again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
