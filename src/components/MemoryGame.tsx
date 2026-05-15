import { useState, useCallback, useEffect, useRef } from "react";

const PAIR_COUNT = 4;
const TOTAL = PAIR_COUNT * 2;
const FLIP_DELAY = 800;

const ALL_IMAGES = [
  "puzzleImages/dead.jpg",
  "puzzleImages/sinner.jpg",
  "puzzleImages/ritual.jpg",
  "puzzleImages/adam.jpg",
  "puzzleImages/samurai.jpg",
];

interface Card {
  id: number;
  imageIdx: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(): Card[] {
  const picked = shuffle(ALL_IMAGES).slice(0, PAIR_COUNT);
  const cards: Card[] = [];
  picked.forEach((_, imgIdx) => {
    cards.push({ id: cards.length, imageIdx: imgIdx });
    cards.push({ id: cards.length, imageIdx: imgIdx });
  });
  return shuffle(cards);
}

interface MemoryGameProps {
  difficulty?: number;
  onSolved: (flips: number) => void;
}

export default function MemoryGame({ difficulty = 0, onSolved }: MemoryGameProps) {
  const maxFlips = 22 - Math.floor(difficulty * 6) * 2;
  const [cards, setCards] = useState<Card[]>(() => buildDeck());
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [flips, setFlips] = useState(0);
  const [solved, setSolved] = useState(false);
  const [failed, setFailed] = useState(false);
  const lockRef = useRef(false);

  // Pick 4 images for this game session
  const [images, setImages] = useState(() => shuffle(ALL_IMAGES).slice(0, PAIR_COUNT));
  const base = import.meta.env.BASE_URL;

  const resetGame = useCallback(() => {
    setCards(buildDeck());
    setImages(shuffle(ALL_IMAGES).slice(0, PAIR_COUNT));
    setFlipped(new Set());
    setMatched(new Set());
    setFlips(0);
    setSolved(false);
    setFailed(false);
    lockRef.current = false;
  }, []);

  const handleFlip = useCallback(
    (idx: number) => {
      if (lockRef.current || solved || failed) return;
      if (flipped.has(idx) || matched.has(idx)) return;

      const newFlips = flips + 1;
      const newFlipped = new Set(flipped);
      newFlipped.add(idx);
      setFlipped(newFlipped);
      setFlips(newFlips);

      // If this is the second card flipped
      const openCards = [...newFlipped].filter((i) => !matched.has(i));
      if (openCards.length === 2) {
        lockRef.current = true;
        const [a, b] = openCards;
        if (cards[a].imageIdx === cards[b].imageIdx) {
          // Match!
          setTimeout(() => {
            setMatched((prev) => {
              const next = new Set(prev);
              next.add(a);
              next.add(b);
              if (next.size === TOTAL) {
                setSolved(true);
                onSolved(newFlips);
              }
              return next;
            });
            setFlipped(new Set());
            lockRef.current = false;
          }, 400);
        } else {
          // No match — flip back
          setTimeout(() => {
            setFlipped(new Set());
            lockRef.current = false;
            // Check flip limit after flipping back
            if (newFlips >= maxFlips) {
              setFailed(true);
            }
          }, FLIP_DELAY);
        }
      } else if (newFlips >= maxFlips) {
        // Single card flipped and limit reached — fail after brief delay
        lockRef.current = true;
        setTimeout(() => {
          setFailed(true);
          lockRef.current = false;
        }, FLIP_DELAY);
      }
    },
    [flipped, matched, cards, flips, solved, failed, onSolved],
  );

  // Preload images
  useEffect(() => {
    images.forEach((src) => {
      const img = new Image();
      img.src = `${base}${src}`;
    });
  }, [images, base]);

  const CARD_SIZE = 74;
  const GAP = 6;

  return (
    <div>
      {/* Grid 4x2 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(4, ${CARD_SIZE}px)`,
          gap: GAP,
          justifyContent: "center",
        }}
      >
        {cards.map((card, idx) => {
          const isFlipped = flipped.has(idx);
          const isMatched = matched.has(idx);
          const showFace = isFlipped || isMatched;

          return (
            <div
              key={card.id}
              onClick={() => handleFlip(idx)}
              style={{
                width: CARD_SIZE,
                height: CARD_SIZE,
                borderRadius: 6,
                cursor: showFace || solved ? "default" : "pointer",
                perspective: 600,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  transformStyle: "preserve-3d",
                  transition: "transform 0.35s ease",
                  transform: showFace ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                {/* Back (face-down) */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backfaceVisibility: "hidden",
                    borderRadius: 6,
                    background: "linear-gradient(135deg, #0d2818 0%, #0a1f14 100%)",
                    border: "1px solid rgba(34,197,94,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 20,
                      color: "rgba(34,197,94,0.3)",
                      fontFamily: "monospace",
                      fontWeight: 700,
                    }}
                  >
                    ?
                  </span>
                </div>

                {/* Front (face-up) */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    borderRadius: 6,
                    overflow: "hidden",
                    border: isMatched
                      ? "2px solid rgba(34,197,94,0.6)"
                      : "1px solid rgba(245,197,66,0.3)",
                  }}
                >
                  <img
                    src={`${base}${images[card.imageIdx]}`}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  {isMatched && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(34,197,94,0.15)",
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status */}
      <div
        style={{
          marginTop: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 11,
          fontFamily: "monospace",
        }}
      >
        <span style={{ color: failed ? "#ff3b5c" : "rgba(255,255,255,0.3)" }}>
          Flips: {flips}/{maxFlips}
        </span>
        <span style={{ color: "rgba(255,255,255,0.3)" }}>
          Pairs: {matched.size / 2}/{PAIR_COUNT}
        </span>
        <span
          style={{
            color: solved ? "rgba(34,197,94,0.7)" : failed ? "#ff3b5c" : "rgba(255,255,255,0.2)",
          }}
        >
          {solved ? "Solved!" : failed ? "Out of flips!" : "Find all pairs"}
        </span>
      </div>

      {failed && (
        <button
          type="button"
          onClick={resetGame}
          style={{
            display: "block",
            margin: "12px auto 0",
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
    </div>
  );
}
