import { createContext } from 'react';
import type { AchievementState, AchievementDef } from './types';
import type { RankInfo } from './ranks';

export interface ToastItem {
  key: string; // unique per toast instance
  def: AchievementDef;
}

export interface AchievementsContextValue {
  state: AchievementState;
  rank: RankInfo;
  catalog: AchievementDef[];
  toasts: ToastItem[];
  dismissToast: (key: string) => void;
  panelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
}

export const AchievementsContext = createContext<AchievementsContextValue | null>(null);
