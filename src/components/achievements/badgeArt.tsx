import type { AchievementDef } from '../../achievements/types';
import { TIER_COLOR, TIER_GLOW } from './tokens';

interface BadgeArtProps {
  def: AchievementDef;
  unlocked: boolean;
  size?: number;
}

/** Pure SVG IC-chip badge. Locked -> grayscale + 🔒. Hidden & locked -> ???. */
export default function BadgeArt({ def, unlocked, size = 72 }: BadgeArtProps) {
  const color = unlocked ? TIER_COLOR[def.tier] : '#3a4a40';
  const glow = unlocked ? TIER_GLOW[def.tier] : 'none';
  const hiddenLocked = !unlocked && def.hidden;
  const glyph = hiddenLocked ? '???' : def.glyph;
  const pin = '#5a6a5e';
  const pins = [0.28, 0.5, 0.72];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={hiddenLocked ? 'Hidden achievement' : def.title}
      style={{ filter: glow === 'none' ? undefined : `drop-shadow(${glow})`, opacity: unlocked ? 1 : 0.55 }}
    >
      {/* side pins */}
      {pins.map((p) => (
        <g key={p}>
          <rect x={6} y={p * 100 - 4} width={10} height={8} rx={2} fill={pin} />
          <rect x={84} y={p * 100 - 4} width={10} height={8} rx={2} fill={pin} />
        </g>
      ))}
      {/* chip body */}
      <rect x={18} y={14} width={64} height={72} rx={10} fill="#0c1a12" stroke={color} strokeWidth={3} />
      <rect x={24} y={20} width={52} height={60} rx={6} fill="none" stroke={color} strokeWidth={1} opacity={0.4} />
      {/* glyph */}
      <text
        x={50}
        y={hiddenLocked ? 56 : 58}
        textAnchor="middle"
        fontSize={hiddenLocked ? 22 : 34}
        fontFamily="monospace"
        fill={color}
      >
        {glyph}
      </text>
      {/* lock overlay */}
      {!unlocked && !def.hidden && (
        <text x={50} y={92} textAnchor="middle" fontSize={16}>
          🔒
        </text>
      )}
    </svg>
  );
}
