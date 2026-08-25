import { useAchievements } from '../../hooks/useAchievements';
import AchievementToast from './AchievementToast';

export default function AchievementToaster() {
  const { toasts, dismissToast, openPanel } = useAchievements();
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <div key={t.key} style={{ pointerEvents: 'auto' }}>
          <AchievementToast
            def={t.def}
            onDismiss={() => dismissToast(t.key)}
            onClick={() => {
              dismissToast(t.key);
              openPanel();
            }}
          />
        </div>
      ))}
    </div>
  );
}
