import { useAchievements } from '../../hooks/useAchievements';
import { MONO, AMBER } from '../livechat/theme';

export default function AchievementsButton() {
  const { openPanel, rank, state, catalog } = useAchievements();
  const unlocked = Object.keys(state.unlocked).length;

  return (
    <button
      onClick={openPanel}
      title="Achievements"
      style={{
        position: 'fixed',
        left: 16,
        bottom: 16,
        zIndex: 150,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: MONO,
        fontSize: 12,
        fontWeight: 700,
        color: AMBER,
        background: 'rgba(12,26,18,0.92)',
        border: `1px solid ${AMBER}`,
        borderRadius: 8,
        padding: '8px 12px',
        cursor: 'pointer',
        boxShadow: '0 0 20px rgba(0,0,0,0.5)',
      }}
    >
      🏆 {unlocked}/{catalog.length} · {rank.isLegend ? '★ LEGEND' : rank.rank.toUpperCase()}
    </button>
  );
}
