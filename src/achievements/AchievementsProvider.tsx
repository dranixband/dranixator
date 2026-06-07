import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { AchievementState, AchievementDef } from './types';
import { CATALOG } from './catalog';
import { applyEvent } from './engine';
import { getRank } from './ranks';
import type { RankInfo } from './ranks';
import { subscribe } from './bus';
import { load, save } from './storage';

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

let toastSeq = 0;

export function AchievementsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AchievementState>(() => load());
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);

  // Latest-state ref so the bus handler never closes over a stale value.
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const unsub = subscribe((e) => {
      const prev = stateRef.current;
      const { state: next, newlyUnlocked } = applyEvent(prev, e, CATALOG, Date.now());
      const fresh = newlyUnlocked.filter((id) => !next.seenToasts.includes(id));
      const finalState =
        fresh.length > 0 ? { ...next, seenToasts: [...next.seenToasts, ...fresh] } : next;

      stateRef.current = finalState;
      setState(finalState);
      save(finalState);

      if (fresh.length > 0) {
        setToasts((t) => [
          ...t,
          ...fresh.map((id) => {
            toastSeq += 1;
            return { key: `${id}-${toastSeq}`, def: CATALOG.find((d) => d.id === id)! };
          }),
        ]);
      }
    });
    return unsub;
  }, []);

  const rank = useMemo(
    () =>
      getRank(state.xp, {
        allChips: state.stats.totalChips > 0 && state.stats.chipsUnlocked >= state.stats.totalChips,
        allAchievements: CATALOG.every((d) => state.unlocked[d.id] != null),
      }),
    [state],
  );

  const dismissToast = useCallback((key: string) => {
    setToasts((t) => t.filter((x) => x.key !== key));
  }, []);
  const openPanel = useCallback(() => setPanelOpen(true), []);
  const closePanel = useCallback(() => setPanelOpen(false), []);

  const value = useMemo<AchievementsContextValue>(
    () => ({ state, rank, catalog: CATALOG, toasts, dismissToast, panelOpen, openPanel, closePanel }),
    [state, rank, toasts, dismissToast, panelOpen, openPanel, closePanel],
  );

  return <AchievementsContext.Provider value={value}>{children}</AchievementsContext.Provider>;
}
