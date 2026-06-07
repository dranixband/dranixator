import type { AchievementDef } from '../../achievements/types';
import { TIER_XP } from '../../achievements/types';
import { MONO, PANEL_BG, PANEL_SHADOW } from '../livechat/theme';
import { TIER_COLOR } from './tokens';
import BadgeArt from './badgeArt';

interface AchievementPopoverProps {
  def: AchievementDef;
  unlockedAt?: number;
  onClose: () => void;
}

export default function AchievementPopover({ def, unlockedAt, onClose }: AchievementPopoverProps) {
  const unlocked = unlockedAt != null;
  const hiddenLocked = !unlocked && def.hidden;
  const color = TIER_COLOR[def.tier];
  const xp = def.xp ?? TIER_XP[def.tier];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 320,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.55)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 320,
          padding: 18,
          fontFamily: MONO,
          color: '#e8f0ea',
          background: PANEL_BG,
          border: `1px solid ${color}`,
          borderRadius: 12,
          boxShadow: PANEL_SHADOW,
          textAlign: 'center',
        }}
      >
        <BadgeArt def={def} unlocked={unlocked} size={96} />
        <h3 style={{ margin: '10px 0 4px', color, fontSize: 16 }}>
          {hiddenLocked ? '???' : def.title}
        </h3>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7 }}>
          {def.tier} · {xp} Ω
        </div>
        <p style={{ fontSize: 12, marginTop: 10, opacity: 0.9 }}>
          {hiddenLocked ? 'Hidden achievement — keep playing to reveal it.' : def.description}
        </p>
        {unlocked && (
          <div style={{ fontSize: 11, marginTop: 8, color }}>
            Unlocked {new Date(unlockedAt).toLocaleDateString()}
          </div>
        )}
        {!unlocked && !def.hidden && (
          <div style={{ fontSize: 11, marginTop: 8, opacity: 0.6 }}>🔒 Locked — not yet earned</div>
        )}
      </div>
    </div>
  );
}
