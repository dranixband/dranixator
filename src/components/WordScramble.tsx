import { useState, useCallback, useMemo } from "react";
import { WORD_SCRAMBLES } from "../constants/wordScrambles";
import type { SongLabel } from "../constants/songs";

interface Word {
  id: number;
  text: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface BoardState {
  pool: Word[];
  slots: (Word | null)[];
}

interface WordScrambleProps {
  difficulty?: number;
  songLabel: SongLabel;
  onSolved: (attempts: number) => void;
  onPlayFragment?: (startTime: number, endTime: number) => void;
}

export default function WordScramble({
  difficulty = 0,
  songLabel,
  onSolved,
  onPlayFragment,
}: WordScrambleProps) {
  const maxAttempts = Math.max(1, 5 - Math.floor(difficulty * 6));

  const [scramble] = useState(() => {
    const forSong = WORD_SCRAMBLES.filter((s) => s.songLabel === songLabel);
    if (forSong.length === 0) {
      return WORD_SCRAMBLES[Math.floor(Math.random() * WORD_SCRAMBLES.length)];
    }
    return forSong[Math.floor(Math.random() * forSong.length)];
  });

  const correctWords = useMemo(
    () => scramble.phrase.split(" ").map((text, i) => ({ id: i, text })),
    [scramble],
  );

  const slotCount = correctWords.length;

  const [board, setBoard] = useState<BoardState>(() => ({
    pool: shuffle([...correctWords]),
    slots: Array(slotCount).fill(null),
  }));

  const [attempts, setAttempts] = useState(0);
  const [solved, setSolved] = useState(false);
  const [failed, setFailed] = useState(false);
  const [feedback, setFeedback] = useState<
    ("correct" | "wrong" | null)[] | null
  >(null);
  // Which pool word is "selected" (click-to-place mode)
  const [selectedPoolId, setSelectedPoolId] = useState<number | null>(null);
  const [dragId, setDragId] = useState<number | null>(null);
  const [dragSource, setDragSource] = useState<"pool" | "slot" | null>(null);
  const [dragSlotIdx, setDragSlotIdx] = useState<number | null>(null);

  const filledCount = board.slots.filter((s) => s !== null).length;
  const canCheck = filledCount === slotCount && !solved && !failed;

  const handleCheck = useCallback(() => {
    if (!canCheck) return;

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const fb = board.slots.map((w, i) =>
      w && w.text === correctWords[i].text
        ? ("correct" as const)
        : ("wrong" as const),
    );
    setFeedback(fb);

    if (fb.every((f) => f === "correct")) {
      setSolved(true);
      onSolved(newAttempts);
      onPlayFragment?.(scramble.startTime, scramble.endTime);
    } else if (newAttempts >= maxAttempts) {
      setFailed(true);
    }
  }, [canCheck, board.slots, correctWords, attempts, maxAttempts, onSolved, onPlayFragment, scramble]);

  const resetGame = useCallback(() => {
    setBoard({
      pool: shuffle([...correctWords]),
      slots: Array(slotCount).fill(null),
    });
    setAttempts(0);
    setSolved(false);
    setFailed(false);
    setFeedback(null);
    setSelectedPoolId(null);
    setDragId(null);
    setDragSource(null);
    setDragSlotIdx(null);
  }, [correctWords, slotCount]);

  // Click pool word → select it (highlight), then click a slot to place
  const handlePoolClick = useCallback(
    (wordId: number) => {
      if (solved || failed) return;
      if (selectedPoolId === wordId) {
        setSelectedPoolId(null);
        return;
      }
      setSelectedPoolId(wordId);
    },
    [solved, failed, selectedPoolId],
  );

  // Click a slot
  const handleSlotClick = useCallback(
    (slotIdx: number) => {
      if (solved || failed) return;
      setFeedback(null);

      setBoard((prev) => {
        const current = prev.slots[slotIdx];

        // If a pool word is selected and slot is empty → place it
        if (selectedPoolId !== null && current === null) {
          const poolIdx = prev.pool.findIndex((w) => w.id === selectedPoolId);
          if (poolIdx === -1) return prev;
          const newSlots = [...prev.slots];
          newSlots[slotIdx] = prev.pool[poolIdx];
          return {
            pool: prev.pool.filter((_, i) => i !== poolIdx),
            slots: newSlots,
          };
        }

        // If a pool word is selected and slot is occupied → swap: return slot word to pool, place selected
        if (selectedPoolId !== null && current !== null) {
          const poolIdx = prev.pool.findIndex((w) => w.id === selectedPoolId);
          if (poolIdx === -1) return prev;
          const newSlots = [...prev.slots];
          newSlots[slotIdx] = prev.pool[poolIdx];
          return {
            pool: [...prev.pool.filter((_, i) => i !== poolIdx), current],
            slots: newSlots,
          };
        }

        // No selection and slot is occupied → return word to pool
        if (current !== null) {
          const newSlots = [...prev.slots];
          newSlots[slotIdx] = null;
          return {
            pool: [...prev.pool, current],
            slots: newSlots,
          };
        }

        return prev;
      });

      setSelectedPoolId(null);
    },
    [solved, failed, selectedPoolId],
  );

  // Drag from pool
  const handlePoolDragStart = useCallback(
    (wordId: number) => {
      if (solved || failed) return;
      setDragId(wordId);
      setDragSource("pool");
      setDragSlotIdx(null);
      setSelectedPoolId(null);
    },
    [solved, failed],
  );

  // Drag from a slot
  const handleSlotDragStart = useCallback(
    (slotIdx: number) => {
      if (solved || failed) return;
      const word = board.slots[slotIdx];
      if (!word) return;
      setDragId(word.id);
      setDragSource("slot");
      setDragSlotIdx(slotIdx);
      setSelectedPoolId(null);
    },
    [solved, failed, board.slots],
  );

  const clearDrag = useCallback(() => {
    setDragId(null);
    setDragSource(null);
    setDragSlotIdx(null);
  }, []);

  // Drop on a slot
  const handleDropOnSlot = useCallback(
    (e: React.DragEvent, targetIdx: number) => {
      e.preventDefault();
      if (dragId === null) return;
      setFeedback(null);

      setBoard((prev) => {
        if (dragSource === "pool") {
          const poolIdx = prev.pool.findIndex((w) => w.id === dragId);
          if (poolIdx === -1) return prev;
          const word = prev.pool[poolIdx];
          const existing = prev.slots[targetIdx];
          const newSlots = [...prev.slots];
          newSlots[targetIdx] = word;
          return {
            pool: existing
              ? [...prev.pool.filter((_, i) => i !== poolIdx), existing]
              : prev.pool.filter((_, i) => i !== poolIdx),
            slots: newSlots,
          };
        }

        if (dragSource === "slot" && dragSlotIdx !== null) {
          if (dragSlotIdx === targetIdx) return prev;
          const newSlots = [...prev.slots];
          // Swap the two slots
          const temp = newSlots[targetIdx];
          newSlots[targetIdx] = newSlots[dragSlotIdx];
          newSlots[dragSlotIdx] = temp;
          return { ...prev, slots: newSlots };
        }

        return prev;
      });

      clearDrag();
    },
    [dragId, dragSource, dragSlotIdx, clearDrag],
  );

  // Drop back on pool area
  const handleDropOnPool = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (dragId === null) { clearDrag(); return; }
      setFeedback(null);

      if (dragSource === "slot" && dragSlotIdx !== null) {
        setBoard((prev) => {
          const word = prev.slots[dragSlotIdx];
          if (!word) return prev;
          const newSlots = [...prev.slots];
          newSlots[dragSlotIdx] = null;
          return { pool: [...prev.pool, word], slots: newSlots };
        });
      }

      clearDrag();
    },
    [dragId, dragSource, dragSlotIdx, clearDrag],
  );

  const tileStyle = (
    bg: string,
    border: string,
    extra?: React.CSSProperties,
  ): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px 12px",
    margin: 3,
    fontSize: 13,
    fontFamily: "monospace",
    fontWeight: 600,
    color: "#e0e0e0",
    background: bg,
    border: `1px solid ${border}`,
    borderRadius: 6,
    cursor: solved || failed ? "default" : "grab",
    userSelect: "none" as const,
    transition: "all 0.15s ease",
    ...extra,
  });

  return (
    <div>
      {/* Pool */}
      <div
        style={{
          fontSize: 10,
          fontFamily: "monospace",
          color: "rgba(255,255,255,0.3)",
          textTransform: "uppercase",
          letterSpacing: 1,
          marginBottom: 6,
        }}
      >
        Words
      </div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropOnPool}
        style={{
          minHeight: 44,
          padding: 6,
          background: "rgba(0,0,0,0.2)",
          border: "1px solid rgba(34,197,94,0.1)",
          borderRadius: 8,
          display: "flex",
          flexWrap: "wrap",
          gap: 0,
          marginBottom: 12,
        }}
      >
        {board.pool.map((word) => {
          const isSelected = selectedPoolId === word.id;
          return (
            <div
              key={word.id}
              draggable={!solved && !failed}
              onDragStart={() => handlePoolDragStart(word.id)}
              onClick={() => handlePoolClick(word.id)}
              style={tileStyle(
                isSelected ? "rgba(245,197,66,0.2)" : "rgba(245,197,66,0.08)",
                isSelected ? "rgba(245,197,66,0.6)" : "rgba(245,197,66,0.25)",
                {
                  opacity: dragId === word.id ? 0.4 : 1,
                  boxShadow: isSelected
                    ? "0 0 8px rgba(245,197,66,0.3)"
                    : "none",
                },
              )}
            >
              {word.text}
            </div>
          );
        })}
        {board.pool.length === 0 && (
          <span
            style={{
              fontSize: 11,
              fontFamily: "monospace",
              color: "rgba(255,255,255,0.15)",
              padding: "6px 12px",
            }}
          >
            All words placed
          </span>
        )}
      </div>

      {/* Answer slots */}
      <div
        style={{
          fontSize: 10,
          fontFamily: "monospace",
          color: "rgba(255,255,255,0.3)",
          textTransform: "uppercase",
          letterSpacing: 1,
          marginBottom: 6,
        }}
      >
        Your answer
      </div>
      <div
        style={{
          padding: 6,
          background: solved
            ? "rgba(34,197,94,0.06)"
            : failed
              ? "rgba(255,59,92,0.04)"
              : "rgba(0,0,0,0.25)",
          border: `1px solid ${
            solved
              ? "rgba(34,197,94,0.3)"
              : failed
                ? "rgba(255,59,92,0.2)"
                : "rgba(34,197,94,0.15)"
          }`,
          borderRadius: 8,
          display: "flex",
          flexWrap: "wrap",
          gap: 0,
          marginBottom: 12,
        }}
      >
        {board.slots.map((word, i) => {
          const fb = feedback?.[i];
          const isEmpty = word === null;

          if (isEmpty) {
            // Empty slot
            return (
              <div
                key={`slot-${i}`}
                onClick={() => handleSlotClick(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDropOnSlot(e, i)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "6px 12px",
                  margin: 3,
                  minWidth: 36,
                  minHeight: 30,
                  fontSize: 11,
                  fontFamily: "monospace",
                  color: "rgba(255,255,255,0.15)",
                  background: selectedPoolId !== null
                    ? "rgba(245,197,66,0.06)"
                    : "rgba(255,255,255,0.02)",
                  border: selectedPoolId !== null
                    ? "1px dashed rgba(245,197,66,0.35)"
                    : "1px dashed rgba(255,255,255,0.1)",
                  borderRadius: 6,
                  cursor: selectedPoolId !== null ? "pointer" : "default",
                  transition: "all 0.15s ease",
                  userSelect: "none" as const,
                }}
              >
                {i + 1}
              </div>
            );
          }

          // Filled slot
          const bg =
            fb === "correct"
              ? "rgba(34,197,94,0.2)"
              : fb === "wrong"
                ? "rgba(255,59,92,0.15)"
                : "rgba(34,197,94,0.08)";
          const borderColor =
            fb === "correct"
              ? "rgba(34,197,94,0.5)"
              : fb === "wrong"
                ? "rgba(255,59,92,0.4)"
                : "rgba(34,197,94,0.25)";

          return (
            <div
              key={`slot-${i}`}
              draggable={!solved && !failed}
              onDragStart={() => handleSlotDragStart(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDropOnSlot(e, i)}
              onClick={() => handleSlotClick(i)}
              style={tileStyle(bg, borderColor, {
                opacity: dragId === word.id ? 0.4 : 1,
              })}
            >
              {word.text}
            </div>
          );
        })}
      </div>

      {/* Status */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 11,
          fontFamily: "monospace",
          marginBottom: 10,
        }}
      >
        <span style={{ color: failed ? "#ff3b5c" : "rgba(255,255,255,0.3)" }}>
          Attempts: {attempts}/{maxAttempts}
        </span>
        <span
          style={{
            color: solved
              ? "rgba(34,197,94,0.7)"
              : failed
                ? "#ff3b5c"
                : "rgba(255,255,255,0.2)",
          }}
        >
          {solved
            ? "Correct!"
            : failed
              ? "Out of attempts!"
              : `${filledCount}/${slotCount} words placed`}
        </span>
      </div>

      {/* Check button */}
      {!solved && !failed && (
        <button
          type="button"
          disabled={!canCheck}
          onClick={handleCheck}
          style={{
            display: "block",
            width: "100%",
            padding: "8px 0",
            fontSize: 12,
            fontFamily: "monospace",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 1,
            color: canCheck ? "#0a1510" : "rgba(255,255,255,0.15)",
            background: canCheck
              ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
              : "rgba(255,255,255,0.05)",
            border: canCheck
              ? "1px solid rgba(34,197,94,0.6)"
              : "1px solid rgba(255,255,255,0.06)",
            borderRadius: 6,
            cursor: canCheck ? "pointer" : "default",
            transition: "all 0.2s",
          }}
        >
          Check
        </button>
      )}

      {failed && (
        <button
          type="button"
          onClick={resetGame}
          style={{
            display: "block",
            margin: "0 auto",
            padding: "8px 20px",
            fontSize: 12,
            fontFamily: "monospace",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 1,
            color: "#f5c542",
            background: "rgba(245,197,66,0.08)",
            border: "1px solid rgba(245,197,66,0.3)",
            borderRadius: 6,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          Try again
        </button>
      )}

      {failed && (
        <div
          style={{
            marginTop: 10,
            padding: "8px 12px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 6,
            fontSize: 12,
            fontFamily: "monospace",
            color: "rgba(255,255,255,0.4)",
            textAlign: "center",
          }}
        >
          {correctWords.map((w) => w.text).join(" ")}
        </div>
      )}
    </div>
  );
}
