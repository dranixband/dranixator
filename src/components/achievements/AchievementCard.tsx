import type { AchievementDef } from '../../achievements/types';
import { MONO } from '../livechat/theme';
import BadgeArt from './badgeArt';

interface AchievementCardProps {
  def: AchievementDef;
  unlocked: boolean;
  onClick: () => void;
}

export default function AchievementCard({ def, unlocked, onClick }: AchievementCardProps) {
  const hiddenLocked = !unlocked && def.hidden;
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        width: 92,
        padding: 6,
        background: 'transparent',
        border: '1px solid rgba(249,206,15,0.08)',
        borderRadius: 8,
        cursor: 'pointer',
        fontFamily: MONO,
      }}
    >
      <BadgeArt def={def} unlocked={unlocked} size={64} />
      <span
        style={{
          fontSize: 10,
          color: unlocked ? '#e8f0ea' : 'rgba(232,240,234,0.5)',
          textAlign: 'center',
          lineHeight: 1.2,
        }}
      >
        {hiddenLocked ? '???' : def.title}
      </span>
    </button>
  );
}
