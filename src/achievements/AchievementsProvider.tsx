import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { AchievementState } from './types';
import { CATALOG } from './catalog';
import { applyEvent } from './engine';
import { getRank } from './ranks';
import { subscribe } from './bus';
import { load, save } from './storage';
import { AchievementsContext } from './achievementsContext';
import type { AchievementsContextValue, ToastItem } from './achievementsContext';

let toastSeq = 0;

export function AchievementsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AchievementState>(() => load());
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);

  // Latest-state ref so the long-lived bus handler always reads fresh state and can chain
  // multiple events fired synchronously in one tick. Updated inside the handler — never
  // during render (initialized once from the loaded state).
  const stateRef = useRef(state);

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
