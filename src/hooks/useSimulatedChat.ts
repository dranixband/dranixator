import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '../components/livechat/types';
import { makeBotMessage, seedMessages } from '../constants/chatSeed';

export function useSimulatedChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => seedMessages());
  const timerRef = useRef<number | null>(null);

  const pushMessage = useCallback((m: ChatMessage) => {
    setMessages((prev) => [...prev, m]);
  }, []);

  const updateMessage = useCallback((id: string, patch: Partial<ChatMessage>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  useEffect(() => {
    const schedule = () => {
      const delay = 4000 + Math.random() * 8000; // 4–12s
      timerRef.current = window.setTimeout(() => {
        setMessages((prev) => [...prev, makeBotMessage()]);
        schedule();
      }, delay);
    };
    schedule();
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  return { messages, pushMessage, updateMessage };
}
