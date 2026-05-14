import { useState, useCallback, useEffect, useRef } from "react";

const COLS = 3;
const ROWS = 3;
const TOTAL = COLS * ROWS;
const GRID_W = 330; // max width in popup

interface SlidingPuzzleProps {
  imageSrc: string;
  onSolved: (moves: number) => void;
}

/** Generate a solvable shuffle by making random moves from solved state */
function generateShuffle(): number[] {
  const tiles = Array.from({ length: TOTAL }, (_, i) => i);
  let emptyIdx = TOTAL - 1;

  const getNeighbors = (idx: number): number[] => {
    const r = Math.floor(idx / COLS);
    const c = idx % COLS;
    const n: number[] = [];
    if (r > 0) n.push(idx - COLS);
    if (r < ROWS - 1) n.push(idx + COLS);
    if (c > 0) n.push(idx - 1);
    if (c < COLS - 1) n.push(idx + 1);
    return n;
  };

  for (let i = 0; i < 150; i++) {
    const neighbors = getNeighbors(emptyIdx);
    const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
    tiles[emptyIdx] = tiles[pick];
    tiles[pick] = TOTAL - 1;
    emptyIdx = pick;
  }

  if (tiles.every((t, i) => t === i)) {
    const neighbors = getNeighbors(emptyIdx);
    const a = neighbors[0];
    tiles[emptyIdx] = tiles[a];
    tiles[a] = TOTAL - 1;
  }

  return tiles;
}

export default function SlidingPuzzle({ imageSrc, onSolved }: SlidingPuzzleProps) {
  const [tiles, setTiles] = useState<number[]>(() => generateShuffle());
  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState(false);
  const [ratio, setRatio] = useState(1); // height / width
  const imgLoaded = useRef(false);

  // Load image to get aspect ratio
  useEffect(() => {
    if (imgLoaded.current) return;
    const img = new Image();
    img.onload = () => {
      setRatio(img.height / img.width);
      imgLoaded.current = true;
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const tileW = Math.floor(GRID_W / COLS);
  const tileH = Math.floor((GRID_W * ratio) / ROWS);
  const gridW = tileW * COLS;
  const gridH = tileH * ROWS;

  const emptyIdx = tiles.indexOf(TOTAL - 1);

  const canMove = useCallback(
    (idx: number): boolean => {
      if (solved) return false;
      const er = Math.floor(emptyIdx / COLS);
      const ec = emptyIdx % COLS;
      const tr = Math.floor(idx / COLS);
      const tc = idx % COLS;
      return (
        (Math.abs(er - tr) === 1 && ec === tc) ||
        (Math.abs(ec - tc) === 1 && er === tr)
      );
    },
    [emptyIdx, solved],
  );

  const handleClick = useCallback(
    (idx: number) => {
      if (!canMove(idx)) return;
      setTiles((prev) => {
        const next = [...prev];
        next[emptyIdx] = next[idx];
        next[idx] = TOTAL - 1;

        const newMoves = moves + 1;
        setMoves(newMoves);

        if (next.every((t, i) => t === i)) {
          setSolved(true);
          onSolved(newMoves);
        }

        return next;
      });
    },
    [canMove, emptyIdx, moves, onSolved],
  );

  return (
    <div>
      <div
        style={{
          width: gridW,
          height: gridH,
          position: "relative",
          margin: "0 auto",
          border: "1px solid rgba(34,197,94,0.2)",
          borderRadius: 4,
          overflow: "hidden",
          background: "#0a0a0a",
        }}
      >
        {tiles.map((tile, idx) => {
          if (tile === TOTAL - 1 && !solved) return null;
          const row = Math.floor(idx / COLS);
          const col = idx % COLS;
          const origRow = Math.floor(tile / COLS);
          const origCol = tile % COLS;
          const movable = canMove(idx);

          return (
            <div
              key={tile}
              onClick={() => handleClick(idx)}
              style={{
                position: "absolute",
                left: col * tileW,
                top: row * tileH,
                width: tileW,
                height: tileH,
                backgroundImage: `url(${imageSrc})`,
                backgroundSize: `${gridW}px ${gridH}px`,
                backgroundPosition: `-${origCol * tileW}px -${origRow * tileH}px`,
                cursor: movable ? "pointer" : "default",
                transition: "left 0.15s, top 0.15s",
                outline: solved ? "none" : "1px solid rgba(0,0,0,0.4)",
                opacity: movable && !solved ? 1 : solved ? 1 : 0.85,
                filter: movable && !solved ? "brightness(1.15)" : "none",
              }}
            />
          );
        })}
      </div>

      <div
        style={{
          marginTop: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 11,
          fontFamily: "monospace",
        }}
      >
        <span style={{ color: "rgba(255,255,255,0.3)" }}>
          Moves: {moves}
        </span>
        <span
          style={{
            color: solved ? "rgba(34,197,94,0.7)" : "rgba(255,255,255,0.2)",
          }}
        >
          {solved ? "Solved!" : "Swap tiles to restore the image"}
        </span>
      </div>
    </div>
  );
}
