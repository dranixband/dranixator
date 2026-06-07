import { useContext } from 'react';
import { AchievementsContext } from '../achievements/AchievementsProvider';
import type { AchievementsContextValue } from '../achievements/AchievementsProvider';

export function useAchievements(): AchievementsContextValue {
  const ctx = useContext(AchievementsContext);
  if (!ctx) throw new Error('useAchievements must be used within <AchievementsProvider>');
  return ctx;
}
