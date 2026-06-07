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

  const nodes = cats.map((cat) => {
    const x = 60 + seed01(cat, 1) * (W - 120);
    const y = 30 + seed01(cat, 2) * (H - 60);
    const defs = catalog.filter((d) => d.category === cat);
    const lit = defs.some((d) => unlocked[d.id] != null);
    return { cat, x, y, lit, count: defs.length, got: defs.filter((d) => unlocked[d.id] != null).length };
  });

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
      <text x={cx} y={cy + 4} textAnchor="middle" fontFamily="monospace" fontSize={10} fill={TIER_COLOR.gold}>
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
            <text x={n.x} y={n.y - 10} textAnchor="middle" fontFamily="monospace" fontSize={8} fill={color}>
              {n.cat} {n.got}/{n.count}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
