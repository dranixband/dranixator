import { useCallback, useEffect, useRef, useState } from "react";
import { socket } from "../services/socket";
import { getClientId } from "../lib/clientId";

// Mirror of the backend Claim shape.
export interface Claim {
  chipId: number;
  clientId: string;
  nickname: string;
  ts: number;
}

type ClaimsState = Record<number, Claim>;

/**
 * Subscribes to server-broadcast claims (who's currently building from which
 * chip), and exposes helpers to acquire / release a claim for the local user.
 *
 * Acquire requests can lose a race against another client — the server is the
 * source of truth, so callers should re-check `getClaim(chipId)` after the
 * next `claims:update` to confirm ownership. Releases are best-effort and
 * idempotent (server ignores release for a claim owned by someone else).
 */
export function useClaims() {
  const [claims, setClaims] = useState<Map<number, Claim>>(new Map());
  const myIdRef = useRef<string>(getClientId());

  useEffect(() => {
    const onUpdate = (state: ClaimsState) => {
      const next = new Map<number, Claim>();
      for (const [chipIdStr, claim] of Object.entries(state)) {
        next.set(Number(chipIdStr), claim);
      }
      setClaims(next);
    };
    socket.on("claims:update", onUpdate);
    return () => {
      socket.off("claims:update", onUpdate);
    };
  }, []);

  const acquire = useCallback((chipId: number, nickname: string) => {
    socket.emit("claim:acquire", {
      chipId,
      clientId: myIdRef.current,
      nickname,
    });
  }, []);

  const release = useCallback((chipId: number) => {
    socket.emit("claim:release", {
      chipId,
      clientId: myIdRef.current,
    });
  }, []);

  /**
   * Returns a claim if the chip is currently held by someone other than the
   * local user. Returns null if the chip is free or claimed by the local user.
   */
  const getOtherClaim = useCallback(
    (chipId: number): Claim | null => {
      const c = claims.get(chipId);
      if (!c) return null;
      if (c.clientId === myIdRef.current) return null;
      return c;
    },
    [claims],
  );

  return { claims, acquire, release, getOtherClaim, myId: myIdRef.current };
}
