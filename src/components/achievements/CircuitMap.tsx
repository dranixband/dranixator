import type { AchievementCategory, AchievementDef } from '../../achievements/types';
import { TIER_COLOR } from './tokens';

interface CircuitMapProps {
  catalog: AchievementDef[];
  unlocked: Record<string, number>;
  onSelectCategory: (cat: AchievementCategory) => void;
}

// Deterministic pseudo-random in [0,1) from a string seed (stable across reloads).
function seed01(str: string, salt: number): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

export default function CircuitMap({ catalog, unlocked, onSelectCategory }: CircuitMapProps) {
  const cats = Array.from(new Set(catalog.map((d) => d.category)));
  const W = 600;
  const H = 200;
  const cx = W / 2;
  const cy = H / 2;

  const MIN_DIST = 80; // keep nodes clear of the RESISTANCE CORE rect

  const nodes = cats.map((cat) => {
    let x = 60 + seed01(cat, 1) * (W - 120);
    let y = 30 + seed01(cat, 2) * (H - 60);
    // push node away from center if too close
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < MIN_DIST) {
      const scale = MIN_DIST / (dist || 1);
      x = Math.max(40, Math.min(W - 40, cx + dx * scale));
      y = Math.max(20, Math.min(H - 15, cy + dy * scale));
    }
    const defs = catalog.filter((d) => d.category === cat);
    const lit = defs.some((d) => unlocked[d.id] != null);
    return { cat, x, y, lit, count: defs.length, got: defs.filter((d) => unlocked[d.id] != null).length };
  });

  // Snap nodes that share the same side of center and are close in x → clean vertical traces
  const SNAP_X = 30;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const sameSide = (a.x < cx) === (b.x < cx);
      if (sameSide && Math.abs(a.x - b.x) < SNAP_X) {
        const snapped = (a.x + b.x) / 2;
        a.x = snapped;
        b.x = snapped;
      }
    }
  }

  // Separate nodes that are too close in y (after snapping may end up stacked)
  const MIN_Y_GAP = 32;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      if (Math.abs(a.x - b.x) < SNAP_X && Math.abs(a.y - b.y) < MIN_Y_GAP) {
        const mid = (a.y + b.y) / 2;
        const half = MIN_Y_GAP / 2;
        a.y = Math.max(20, mid - half);
        b.y = Math.min(H - 15, mid + half);
      }
    }
  }

  // Pin firstSteps x between social and collection
  const socialNode = nodes.find((n) => n.cat === 'social');
  const collectionNode = nodes.find((n) => n.cat === 'collection');
  const firstStepsNode = nodes.find((n) => n.cat === 'firstSteps');
  if (firstStepsNode && socialNode && collectionNode) {
    firstStepsNode.x = (socialNode.x + collectionNode.x) / 2;
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      {/* Manhattan-routed traces from core to each category chip */}
      {nodes.map((n) => {
        const color = n.lit ? TIER_COLOR.gold : '#2a3a30';
        return (
          <polyline
            key={`t-${n.cat}`}
            points={`${cx},${cy} ${n.x},${cy} ${n.x},${n.y}`}
            fill="none"
            stroke={color}
            strokeWidth={2}
            className={n.lit ? 'ach-trace-lit' : undefined}
          />
        );
      })}

      {/* central RESISTANCE CORE */}
      <rect x={cx - 44} y={cy - 14} width={88} height={28} rx={5} fill="#0c1a12" stroke={TIER_COLOR.gold} strokeWidth={2} />
      <text x={cx} y={cy + 4} textAnchor="middle" fontFamily="monospace" fontSize={8} fill={TIER_COLOR.gold}>
        RESISTANCE CORE
      </text>

      {/* category chips */}
      {nodes.map((n) => {
        const color = n.lit ? TIER_COLOR.gold : '#3a4a40';
        return (
          <g
            key={`c-${n.cat}`}
            onClick={() => onSelectCategory(n.cat)}
            className={n.got > 0 ? 'ach-powerup' : undefined}
            style={{ cursor: 'pointer' }}
          >
            <circle cx={n.x} cy={n.y} r={6} fill={n.lit ? color : '#0c1a12'} stroke={color} strokeWidth={2} />
            <text
              x={n.x}
              y={n.y < cy ? n.y - 10 : n.y + 18}
              textAnchor="middle"
              fontFamily="monospace"
              fontSize={8}
              fill={color}
            >
              {n.cat} {n.got}/{n.count}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
