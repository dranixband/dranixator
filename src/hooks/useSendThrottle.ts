import { useCallback, useEffect, useRef, useState } from 'react';

const BASE_MS = 1000; // base cooldown
const CAP_MS = 8000; // max cooldown
const SPAM_WINDOW_EXTRA = 1500; // sending within (penalty + this) counts as spam

export function useSendThrottle() {
  const [remaining, setRemaining] = useState(0); // ms until next send allowed
  const penaltyRef = useRef(BASE_MS);
  const lastSentRef = useRef(0);

  // Tick down the visible countdown.
  useEffect(() => {
    const id = window.setInterval(() => {
      setRemaining((r) => (r <= 100 ? 0 : r - 100));
    }, 100);
    return () => window.clearInterval(id);
  }, []);

  const canSend = remaining <= 0;
  const secondsLeft = Math.ceil(remaining / 1000);

  // Call right after a successful send.
  const registerSend = useCallback(() => {
    const now = Date.now();
    const gap = now - lastSentRef.current;
    if (gap < penaltyRef.current + SPAM_WINDOW_EXTRA) {
      penaltyRef.current = Math.min(penaltyRef.current * 2, CAP_MS); // escalate
    } else {
      penaltyRef.current = BASE_MS; // cooled off
    }
    lastSentRef.current = now;
    setRemaining(penaltyRef.current);
  }, []);

  return { canSend, secondsLeft, registerSend };
}
