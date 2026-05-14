import { useState, useCallback, useRef, useEffect } from "react";

const WIDTH = 330;
const HEIGHT = 220;
const DOT_COUNT = 7;
const DOT_RADIUS = 10;
const HIT_RADIUS = 20;

interface WireTraceProps {
  onSolved: (lines: number) => void;
}

type Pt = { x: number; y: number };

/** Check if a point is near any dot */
function nearAnyDot(p: Pt, dots: Pt[], radius: number): boolean {
  return dots.some((d) => Math.hypot(d.x - p.x, d.y - p.y) <= radius);
}

/** Find intersection point of two segments, or null */
function segIntersectionPt(a: Pt, b: Pt, c: Pt, d: Pt): Pt | null {
  const dx1 = b.x - a.x, dy1 = b.y - a.y;
  const dx2 = d.x - c.x, dy2 = d.y - c.y;
  const denom = dx1 * dy2 - dy1 * dx2;
  if (Math.abs(denom) < 1e-10) return null;
  const t = ((c.x - a.x) * dy2 - (c.y - a.y) * dx2) / denom;
  const u = ((c.x - a.x) * dy1 - (c.y - a.y) * dx1) / denom;
  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return { x: a.x + t * dx1, y: a.y + t * dy1 };
  }
  return null;
}

/** Check if a polyline (trail) intersects any segment of existing lines,
 *  ignoring intersections that happen inside a dot's radius */
function trailIntersectsLines(trail: Pt[], existingLines: Pt[][], dots: Pt[]): boolean {
  const safeRadius = DOT_RADIUS + 6;
  for (let t = 0; t < trail.length - 1; t++) {
    const a = trail[t];
    const b = trail[t + 1];
    for (const line of existingLines) {
      for (let s = 0; s < line.length - 1; s++) {
        const ip = segIntersectionPt(a, b, line[s], line[s + 1]);
        if (ip && !nearAnyDot(ip, dots, safeRadius)) return true;
      }
    }
  }
  return false;
}

/** Generate dots that are spread apart */
function generateDots(): Pt[] {
  const pad = 25;
  const minDist = 55;
  const dots: Pt[] = [];
  for (let attempts = 0; dots.length < DOT_COUNT && attempts < 500; attempts++) {
    const p = {
      x: pad + Math.random() * (WIDTH - 2 * pad),
      y: pad + Math.random() * (HEIGHT - 2 * pad),
    };
    if (dots.every((d) => Math.hypot(d.x - p.x, d.y - p.y) >= minDist)) {
      dots.push(p);
    }
  }
  while (dots.length < DOT_COUNT) {
    const i = dots.length;
    dots.push({
      x: pad + ((i * 43) % (WIDTH - 2 * pad)),
      y: pad + ((i * 67) % (HEIGHT - 2 * pad)),
    });
  }
  return dots;
}

function ptsToPath(pts: Pt[]): string {
  if (pts.length === 0) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) d += ` L ${pts[i].x} ${pts[i].y}`;
  return d;
}

export default function WireTrace({ onSolved }: WireTraceProps) {
  const [dots] = useState(() => generateDots());
  const [drawnLines, setDrawnLines] = useState<{ from: number; to: number; trail: Pt[] }[]>([]);
  const [currentTrail, setCurrentTrail] = useState<Pt[]>([]);
  const [fromDot, setFromDot] = useState<number | null>(null);
  const [hoverDot, setHoverDot] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const [solved, setSolved] = useState(false);
  const [failTrail, setFailTrail] = useState<Pt[] | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const isDrawingRef = useRef(false);

  const connectedDots = new Set<number>();
  for (const l of drawnLines) {
    connectedDots.add(l.from);
    connectedDots.add(l.to);
  }
  const totalLines = DOT_COUNT - 1;

  const getPos = useCallback(
    (e: React.MouseEvent | React.TouchEvent): Pt | null => {
      const svg = svgRef.current;
      if (!svg) return null;
      const rect = svg.getBoundingClientRect();
      let clientX: number, clientY: number;
      if ("touches" in e) {
        if (e.touches.length === 0) return null;
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      return {
        x: ((clientX - rect.left) / rect.width) * WIDTH,
        y: ((clientY - rect.top) / rect.height) * HEIGHT,
      };
    },
    [],
  );

  const findDotAt = useCallback(
    (pos: Pt): number | null => {
      for (let i = 0; i < dots.length; i++) {
        if (Math.hypot(dots[i].x - pos.x, dots[i].y - pos.y) <= HIT_RADIUS) return i;
      }
      return null;
    },
    [dots],
  );

  const nextFrom = drawnLines.length; // must start from dot at this index
  const nextTo = drawnLines.length + 1; // must end on dot at this index

  const startDraw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (solved || failed) return;
      e.preventDefault();
      const pos = getPos(e);
      if (!pos) return;
      const dotIdx = findDotAt(pos);
      if (dotIdx !== nextFrom) return; // only allow starting from the next dot in order

      isDrawingRef.current = true;
      setFromDot(dotIdx);
      setCurrentTrail([dots[dotIdx]]);
    },
    [solved, failed, getPos, findDotAt, dots, nextFrom],
  );

  const moveDraw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawingRef.current) return;
      e.preventDefault();
      const pos = getPos(e);
      if (!pos) return;
      setCurrentTrail((prev) => [...prev, pos]);
      setHoverDot(findDotAt(pos));
    },
    [getPos, findDotAt],
  );

  const endDraw = useCallback(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (fromDot === null || currentTrail.length < 2) {
      setCurrentTrail([]);
      setFromDot(null);
      return;
    }

    // Check if we ended on a dot
    const lastPt = currentTrail[currentTrail.length - 1];
    const toDot = findDotAt(lastPt);

    if (toDot !== nextTo) {
      // Must end on the next dot in sequence
      setCurrentTrail([]);
      setFromDot(null);
      return;
    }

    // Snap the trail end to the dot center
    const finalTrail = [...currentTrail.slice(0, -1), dots[toDot]];

    // Check if trail intersects existing drawn lines
    const existingTrails = drawnLines.map((l) => l.trail);
    if (trailIntersectsLines(finalTrail, existingTrails, dots)) {
      setFailTrail(finalTrail);
      setFailed(true);
      setCurrentTrail([]);
      setFromDot(null);
      return;
    }

    const newLines = [...drawnLines, { from: fromDot, to: toDot, trail: finalTrail }];
    setDrawnLines(newLines);
    setCurrentTrail([]);
    setFromDot(null);

    // Check solved
    const connected = new Set<number>();
    for (const l of newLines) {
      connected.add(l.from);
      connected.add(l.to);
    }
    if (connected.size === DOT_COUNT && newLines.length >= totalLines) {
      setSolved(true);
      onSolved(newLines.length);
    }
  }, [fromDot, currentTrail, findDotAt, drawnLines, dots, totalLines, onSolved]);

  const retry = useCallback(() => {
    setDrawnLines([]);
    setCurrentTrail([]);
    setFromDot(null);
    setFailed(false);
    setFailTrail(null);
    setSolved(false);
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const prevent = (e: TouchEvent) => {
      if (isDrawingRef.current) e.preventDefault();
    };
    svg.addEventListener("touchmove", prevent, { passive: false });
    return () => svg.removeEventListener("touchmove", prevent);
  }, []);

  return (
    <div>
      <svg
        ref={svgRef}
        width="100%"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{
          background: "rgba(0,0,0,0.3)",
          borderRadius: 8,
          border: "1px solid rgba(34,197,94,0.15)",
          cursor: solved || failed ? "default" : "crosshair",
          touchAction: "none",
          display: "block",
        }}
        onMouseDown={startDraw}
        onMouseMove={moveDraw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={moveDraw}
        onTouchEnd={endDraw}
      >
        {/* PCB grid */}
        <defs>
          <pattern id="pcb-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.5" fill="rgba(34,197,94,0.08)" />
          </pattern>
        </defs>
        <rect width={WIDTH} height={HEIGHT} fill="url(#pcb-grid)" />

        {/* Drawn lines (freehand trails) */}
        {drawnLines.map((l, i) => (
          <path
            key={i}
            d={ptsToPath(l.trail)}
            fill="none"
            stroke={solved ? "#22c55e" : "#f5c542"}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.8}
          />
        ))}

        {/* Failed trail */}
        {failTrail && (
          <path
            d={ptsToPath(failTrail)}
            fill="none"
            stroke="#ff3b5c"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="6 4"
            opacity={0.8}
          />
        )}

        {/* Current drawing trail */}
        {currentTrail.length > 1 && (
          <path
            d={ptsToPath(currentTrail)}
            fill="none"
            stroke="rgba(245,197,66,0.6)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Dots */}
        {dots.map((dot, i) => {
          const isConnected = connectedDots.has(i);
          const isFrom = fromDot === i;
          const isNextStart = !solved && !failed && fromDot === null && i === nextFrom;
          const isNextEnd = !solved && !failed && fromDot !== null && i === nextTo;
          const isHover = hoverDot === i && isDrawingRef.current;
          return (
            <g key={i}>
              <circle cx={dot.x} cy={dot.y} r={HIT_RADIUS} fill="transparent" />
              {(isFrom || isHover || isNextStart) && !solved && !failed && (
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r={DOT_RADIUS + 4}
                  fill="none"
                  stroke={isFrom ? "#f5c542" : isNextStart ? "rgba(245,197,66,0.4)" : "rgba(245,197,66,0.3)"}
                  strokeWidth={1.5}
                >
                  {isNextStart && (
                    <animate attributeName="r" values={`${DOT_RADIUS + 4};${DOT_RADIUS + 7};${DOT_RADIUS + 4}`} dur="1.5s" repeatCount="indefinite" />
                  )}
                </circle>
              )}
              {isNextEnd && !solved && !failed && (
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r={DOT_RADIUS + 4}
                  fill="none"
                  stroke="rgba(34,197,94,0.4)"
                  strokeWidth={1.5}
                >
                  <animate attributeName="opacity" values="0.4;0.8;0.4" dur="1s" repeatCount="indefinite" />
                </circle>
              )}
              <circle
                cx={dot.x}
                cy={dot.y}
                r={DOT_RADIUS}
                fill={
                  solved
                    ? "rgba(34,197,94,0.3)"
                    : isFrom || isNextStart
                      ? "rgba(245,197,66,0.2)"
                      : isNextEnd
                        ? "rgba(34,197,94,0.1)"
                        : isConnected
                          ? "rgba(34,197,94,0.15)"
                          : "rgba(255,255,255,0.06)"
                }
                stroke={
                  solved
                    ? "#22c55e"
                    : isFrom || isNextStart
                      ? "#f5c542"
                      : isNextEnd
                        ? "rgba(34,197,94,0.5)"
                        : isConnected
                          ? "rgba(34,197,94,0.4)"
                          : "rgba(255,255,255,0.15)"
                }
                strokeWidth={1.5}
              />
              <text
                x={dot.x}
                y={dot.y + 4}
                textAnchor="middle"
                fontSize={10}
                fontFamily="monospace"
                fontWeight="bold"
                fill={
                  solved
                    ? "#22c55e"
                    : isFrom
                      ? "#f5c542"
                      : isConnected
                        ? "rgba(34,197,94,0.6)"
                        : "rgba(255,255,255,0.3)"
                }
              >
                {i + 1}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Status */}
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
          Lines: {drawnLines.length}/{totalLines}
        </span>
        {failed ? (
          <>
            <span style={{ color: "rgba(255,59,92,0.7)" }}>Lines crossed!</span>
            <button
              type="button"
              onClick={retry}
              style={{
                padding: "4px 14px",
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
              Retry
            </button>
          </>
        ) : (
          <span
            style={{
              color: solved ? "rgba(34,197,94,0.7)" : "rgba(255,255,255,0.2)",
            }}
          >
            {solved
              ? "Connected!"
              : fromDot !== null
                ? `Draw to dot ${nextTo + 1}`
                : `Hold dot ${nextFrom + 1} & draw`}
          </span>
        )}
      </div>
    </div>
  );
}
