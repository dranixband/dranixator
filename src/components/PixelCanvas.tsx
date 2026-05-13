import { useRef, useState, useCallback, useEffect } from "react";

const GRID_SIZE = 48;
const CELL_PX = 6; // display size per cell
const CANVAS_PX = GRID_SIZE * CELL_PX; // 288px

const PALETTE = [
  "#000000", // black
  "#ffffff", // white
  "#f9ce0f", // yellow (wire)
  "#1ba6c4", // cyan (wire)
  "#df0221", // red (wire)
  "#77c56e", // green (PCB)
  "#e9691a", // orange (wire)
  "#f5c542", // gold (accent)
];

interface PixelCanvasProps {
  onDataChange: (dataUrl: string) => void;
}

type Tool = "brush" | "eraser";
const SIZES = [1, 2, 4] as const;
type BrushSize = (typeof SIZES)[number];

export default function PixelCanvas({ onDataChange }: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const exportRef = useRef<HTMLCanvasElement>(null);
  const [selectedColor, setSelectedColor] = useState(PALETTE[2]); // yellow default
  const [tool, setTool] = useState<Tool>("brush");
  const [brushSize, setBrushSize] = useState<BrushSize>(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hoverCell, setHoverCell] = useState<{ cx: number; cy: number } | null>(null);
  const pixelsRef = useRef<(string | null)[][]>(
    Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null)),
  );

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const pixels = pixelsRef.current;

    // Clear
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, CANVAS_PX, CANVAS_PX);

    // Draw grid cells
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (pixels[y][x]) {
          ctx.fillStyle = pixels[y][x]!;
          ctx.fillRect(x * CELL_PX, y * CELL_PX, CELL_PX, CELL_PX);
        }
      }
    }

    // Draw grid lines
    ctx.strokeStyle = "rgba(249,206,15,0.08)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_PX, 0);
      ctx.lineTo(i * CELL_PX, CANVAS_PX);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_PX);
      ctx.lineTo(CANVAS_PX, i * CELL_PX);
      ctx.stroke();
    }
  }, []);

  const exportData = useCallback(() => {
    const exp = exportRef.current;
    if (!exp) return;
    const ctx = exp.getContext("2d")!;
    const pixels = pixelsRef.current;

    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, GRID_SIZE, GRID_SIZE);

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (pixels[y][x]) {
          ctx.fillStyle = pixels[y][x]!;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    onDataChange(exp.toDataURL("image/png"));
  }, [onDataChange]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const getCellFromEvent = (
    e: React.MouseEvent | React.TouchEvent,
  ): { cx: number; cy: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
    const clientY = "touches" in e ? e.touches[0]?.clientY ?? 0 : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const cx = Math.floor((x / rect.width) * GRID_SIZE);
    const cy = Math.floor((y / rect.height) * GRID_SIZE);
    if (cx < 0 || cx >= GRID_SIZE || cy < 0 || cy >= GRID_SIZE) return null;
    return { cx, cy };
  };

  const paint = (cx: number, cy: number) => {
    const r = brushSize;
    for (let dy = -r + 1; dy < r; dy++) {
      for (let dx = -r + 1; dx < r; dx++) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
          pixelsRef.current[ny][nx] = tool === "eraser" ? null : selectedColor;
        }
      }
    }
    redraw();
    exportData();
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const cell = getCellFromEvent(e);
    if (cell) {
      setHoverCell(cell);
      paint(cell.cx, cell.cy);
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    const cell = getCellFromEvent(e);
    setHoverCell(cell);
    if (!isDrawing) return;
    e.preventDefault();
    if (cell) paint(cell.cx, cell.cy);
  };

  const handleEnd = () => {
    setIsDrawing(false);
  };

  const handleLeave = () => {
    setIsDrawing(false);
    setHoverCell(null);
  };

  const handleClear = () => {
    pixelsRef.current = Array.from({ length: GRID_SIZE }, () =>
      Array(GRID_SIZE).fill(null),
    );
    redraw();
    exportData();
  };

  // Cursor size as percentage of canvas (for the overlay)
  const cursorCells = brushSize * 2 - 1; // 1→1, 2→3, 4→7 cells
  const cursorPct = (cursorCells / GRID_SIZE) * 100;

  // Cursor position as percentage (top-left corner of brush area)
  const cursorLeft = hoverCell
    ? ((hoverCell.cx - brushSize + 1) / GRID_SIZE) * 100
    : 0;
  const cursorTop = hoverCell
    ? ((hoverCell.cy - brushSize + 1) / GRID_SIZE) * 100
    : 0;

  return (
    <div>
      {/* Canvas with cursor overlay */}
      <div style={{ position: "relative", marginBottom: 10 }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_PX}
          height={CANVAS_PX}
          style={{
            display: "block",
            width: "100%",
            aspectRatio: "1 / 1",
            borderRadius: 6,
            border: "1px solid rgba(34,197,94,0.15)",
            cursor: "none",
            touchAction: "none",
          }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleLeave}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />
        {/* Brush/eraser cursor overlay */}
        {hoverCell && (
          <div
            style={{
              position: "absolute",
              left: `${cursorLeft}%`,
              top: `${cursorTop}%`,
              width: `${cursorPct}%`,
              height: `${cursorPct}%`,
              border: tool === "eraser"
                ? "1.5px solid rgba(255,255,255,0.5)"
                : `1.5px solid ${selectedColor}`,
              background: tool === "eraser"
                ? "rgba(255,255,255,0.08)"
                : `${selectedColor}22`,
              pointerEvents: "none",
              boxSizing: "border-box",
            }}
          />
        )}
      </div>

      {/* Hidden export canvas */}
      <canvas
        ref={exportRef}
        width={GRID_SIZE}
        height={GRID_SIZE}
        style={{ display: "none" }}
      />

      {/* Palette row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 8,
          flexWrap: "wrap",
        }}
      >
        {PALETTE.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => { setSelectedColor(color); setTool("brush"); }}
            style={{
              width: 22,
              height: 22,
              borderRadius: 4,
              background: color,
              border:
                tool === "brush" && selectedColor === color
                  ? "2px solid #f5c542"
                  : "1px solid rgba(255,255,255,0.15)",
              cursor: "pointer",
              boxShadow:
                tool === "brush" && selectedColor === color
                  ? "0 0 6px rgba(245,197,66,0.4)"
                  : "none",
              transition: "all 0.15s",
            }}
          />
        ))}
      </div>

      {/* Tools row: Eraser + Size selector + Clear */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {/* Eraser toggle */}
        <button
          type="button"
          onClick={() => setTool(tool === "eraser" ? "brush" : "eraser")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "4px 10px",
            fontSize: 10,
            fontFamily: "monospace",
            color: tool === "eraser" ? "#f5c542" : "rgba(255,255,255,0.4)",
            background: tool === "eraser" ? "rgba(245,197,66,0.1)" : "rgba(255,255,255,0.05)",
            border: tool === "eraser"
              ? "1px solid rgba(245,197,66,0.35)"
              : "1px solid rgba(255,255,255,0.1)",
            borderRadius: 4,
            cursor: "pointer",
            textTransform: "uppercase",
            letterSpacing: 1,
            transition: "all 0.15s",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M8.5 2L10 3.5L5.5 8L3 9L4 6.5Z" />
            <line x1="2" y1="10" x2="10" y2="10" />
          </svg>
          Eraser
        </button>

        {/* Size selector (always visible, shared for brush & eraser) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            marginLeft: 2,
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontFamily: "monospace",
              color: "rgba(255,255,255,0.25)",
              textTransform: "uppercase",
              letterSpacing: 1,
              marginRight: 2,
            }}
          >
            Size
          </span>
          {SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setBrushSize(size)}
              style={{
                width: 22,
                height: 22,
                borderRadius: 4,
                background: brushSize === size
                  ? "rgba(245,197,66,0.15)"
                  : "rgba(255,255,255,0.05)",
                border: brushSize === size
                  ? "1px solid rgba(245,197,66,0.35)"
                  : "1px solid rgba(255,255,255,0.1)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
              }}
            >
              <div
                style={{
                  width: 4 + size * 3,
                  height: 4 + size * 3,
                  borderRadius: 1,
                  background: brushSize === size ? "#f5c542" : "rgba(255,255,255,0.3)",
                }}
              />
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <button
          type="button"
          onClick={handleClear}
          style={{
            padding: "4px 10px",
            fontSize: 10,
            fontFamily: "monospace",
            color: "rgba(255,255,255,0.4)",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 4,
            cursor: "pointer",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
