import { useEffect, useRef } from 'react';
import { CHAT_EMOJI_GROUPS } from '../../constants/chatEmojis';
import { MONO, PANEL_BG, PANEL_SHADOW } from './theme';

interface Props {
  onPick: (emoji: string) => void;
  onClose: () => void;
}

export default function EmojiPicker({ onPick, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click and on Escape.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="chat-scroll"
      style={{
        position: 'absolute',
        bottom: 'calc(100% + 6px)',
        left: 8,
        right: 8,
        maxHeight: 'calc(var(--chat-window-h, 420px) * 0.55)',
        background: PANEL_BG,
        border: '1px solid rgba(249,206,15,0.25)',
        borderRadius: 8,
        boxShadow: PANEL_SHADOW,
        padding: 8,
        fontFamily: MONO,
        zIndex: 10,
      }}
    >
      {CHAT_EMOJI_GROUPS.map((group) => (
        <div key={group.label} style={{ marginBottom: 8 }}>
          <div
            style={{
              fontSize: 9,
              color: 'rgba(249,206,15,0.5)',
              letterSpacing: 1,
              marginBottom: 4,
            }}
          >
            // {group.label}
          </div>
          <div className="chat-emoji-grid">
            {group.emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onPick(emoji)}
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
