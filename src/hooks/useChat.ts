import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage } from "../components/livechat/types";
import { socket } from "../services/socket";

// Tracks chat messages synced over the websocket. Optimistic sends are
// reconciled with the server echo via message id; remote messages from other
// clients arrive through `chat:new`.
export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const ownIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const onHistory = (history: ChatMessage[]) => {
      setMessages((prev) => {
        const knownIds = new Set(history.map((m) => m.id));
        // Preserve any in-flight optimistic messages not yet acknowledged.
        const inflight = prev.filter(
          (m) => m.status === "sending" && !knownIds.has(m.id),
        );
        const hydrated = history.map((m) => ({
          ...m,
          isOwn: ownIds.current.has(m.id),
        }));
        return [...hydrated, ...inflight];
      });
    };

    const onNew = (msg: ChatMessage) => {
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.id === msg.id);
        if (idx !== -1) {
          // Server echo of our own optimistic message — confirm as sent.
          const next = [...prev];
          next[idx] = { ...next[idx], ...msg, isOwn: true, status: "sent" };
          return next;
        }
        return [...prev, { ...msg, isOwn: ownIds.current.has(msg.id) }];
      });
    };

    socket.on("chat:history", onHistory);
    socket.on("chat:new", onNew);
    return () => {
      socket.off("chat:history", onHistory);
      socket.off("chat:new", onNew);
    };
  }, []);

  const sendMessage = useCallback((msg: ChatMessage) => {
    ownIds.current.add(msg.id);
    setMessages((prev) => [...prev, msg]);
    socket.emit("chat:message", {
      id: msg.id,
      author: msg.author,
      text: msg.text,
      ts: msg.ts,
    });
  }, []);

  return { messages, sendMessage };
}
