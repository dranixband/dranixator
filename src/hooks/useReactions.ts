import { useCallback, useEffect, useMemo, useState } from "react";
import { socket } from "../services/socket";
import { getClientId } from "../lib/clientId";

// chipId → clientId → reactionId
type ReactionsState = Record<number, Record<string, string>>;

interface ChipReactionView {
  selected: string | null;
  counts: Record<string, number>;
}

// Syncs chip reactions over the websocket. Each browser has a stable
// `clientId` (localStorage) so a reload restores its own selection, and
// counts are derived by tallying entries per reactionId.
export function useReactions() {
  const [state, setState] = useState<ReactionsState>({});
  const clientId = useMemo(() => getClientId(), []);

  useEffect(() => {
    const onUpdate = (next: ReactionsState) => setState(next ?? {});
    socket.on("reactions:update", onUpdate);
    return () => {
      socket.off("reactions:update", onUpdate);
    };
  }, []);

  const setReaction = useCallback(
    (chipId: number, reactionId: string | null) => {
      // Optimistic update so the UI feels instant; server echo overwrites it.
      setState((prev) => {
        const perChip = { ...(prev[chipId] ?? {}) };
        if (reactionId === null) {
          delete perChip[clientId];
        } else {
          perChip[clientId] = reactionId;
        }
        const next = { ...prev };
        if (Object.keys(perChip).length === 0) {
          delete next[chipId];
        } else {
          next[chipId] = perChip;
        }
        return next;
      });
      socket.emit("reaction:set", { clientId, chipId, reactionId });
    },
    [clientId],
  );

  const getChip = useCallback(
    (chipId: number): ChipReactionView => {
      const perChip = state[chipId];
      if (!perChip) return { selected: null, counts: {} };
      const counts: Record<string, number> = {};
      let selected: string | null = null;
      for (const [cid, rid] of Object.entries(perChip)) {
        counts[rid] = (counts[rid] ?? 0) + 1;
        if (cid === clientId) selected = rid;
      }
      return { selected, counts };
    },
    [state, clientId],
  );

  // Toggle: clicking the currently selected reaction clears it.
  const toggleReaction = useCallback(
    (chipId: number, reactionId: string) => {
      const current = state[chipId]?.[clientId] ?? null;
      setReaction(chipId, current === reactionId ? null : reactionId);
    },
    [state, clientId, setReaction],
  );

  return { getChip, toggleReaction };
}
