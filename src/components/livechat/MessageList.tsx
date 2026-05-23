import { useEffect, useRef } from 'react';
import MessageItem from './MessageItem';
import type { ChatMessage } from './types';

export default function MessageList({ messages }: { messages: ChatMessage[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true); // is user pinned to bottom?

  // Track whether the user has scrolled away from the bottom.
  const handleScroll = () => {
    const el = ref.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickRef.current = distance < 40;
  };

  useEffect(() => {
    const el = ref.current;
    if (el && stickRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      className="chat-scroll"
      style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '6px 0' }}
    >
      {messages.map((m) => (
        <MessageItem key={m.id} message={m} />
      ))}
    </div>
  );
}
