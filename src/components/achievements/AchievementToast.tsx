import { useEffect } from 'react';
import type { AchievementDef } from '../../achievements/types';
import { TIER_XP } from '../../achievements/types';
import { MONO, PANEL_BG, PANEL_SHADOW } from '../livechat/theme';
import { TIER_COLOR } from './tokens';
import BadgeArt from './badgeArt';

interface AchievementToastProps {
  def: AchievementDef;
  onDismiss: () => void;
  onClick: () => void;
}

export default function AchievementToast({ def, onDismiss, onClick }: AchievementToastProps) {
  useEffect(() => {
    const t = window.setTimeout(onDismiss, 5000);
    return () => window.clearTimeout(t);
  }, [onDismiss]);

  const color = TIER_COLOR[def.tier];
  const xp = def.xp ?? TIER_XP[def.tier];

  return (
    <div
      className="ach-toast-in"
      onClick={onClick}
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        width: 280,
        padding: 10,
        marginTop: 10,
        cursor: 'pointer',
        fontFamily: MONO,
        color: '#e8f0ea',
        background: PANEL_BG,
        border: `1px solid ${color}`,
        borderRadius: 8,
        boxShadow: PANEL_SHADOW,
      }}
    >
      <BadgeArt def={def} unlocked size={44} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 10, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1 }}>
          {def.tier} unlocked
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color }}>{def.title}</div>
        <div style={{ fontSize: 11, color }}>+{xp} Ω</div>
      </div>
    </div>
  );
}
