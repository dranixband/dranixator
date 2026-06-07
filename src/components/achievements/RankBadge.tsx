import { MONO } from '../livechat/theme';
import { TIER_COLOR } from './tokens';
import type { RankTier } from '../../achievements/types';

interface RankBadgeProps {
  rank: string;
  tier?: RankTier;
  compact?: boolean;
}

export default function RankBadge({ rank, tier = 'bronze', compact = false }: RankBadgeProps) {
  const color = TIER_COLOR[tier];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        fontFamily: MONO,
        fontSize: compact ? 9 : 11,
        fontWeight: 700,
        letterSpacing: 0.5,
        color,
        border: `1px solid ${color}`,
        borderRadius: 4,
        padding: compact ? '0 4px' : '1px 6px',
        lineHeight: 1.4,
        background: 'rgba(0,0,0,0.25)',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      ★ {rank}
    </span>
  );
}
