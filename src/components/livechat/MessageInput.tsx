import { useRef, useState } from 'react';
import { useSendThrottle } from '../../hooks/useSendThrottle';
import EmojiPicker from './EmojiPicker';
import { AMBER, MONO, MAX_MESSAGE_LEN } from './theme';

interface Props {
  onSend: (text: string) => void;
}

export default function MessageInput({ onSend }: Props) {
  const [text, setText] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const { canSend, registerSend } = useSendThrottle();
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    if (!canSend) return; // silent anti-spam gate
    onSend(t);
    registerSend();
    setText('');
    inputRef.current?.focus();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handlePick = (emoji: string) => {
    setText((t) => (t + emoji).slice(0, MAX_MESSAGE_LEN));
    inputRef.current?.focus();
  };

  return (
    <div
      style={{
        position: 'relative',
        borderTop: '1px solid rgba(249,206,15,0.15)',
        padding: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      {pickerOpen && (
        <EmojiPicker onPick={handlePick} onClose={() => setPickerOpen(false)} />
      )}
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          type="button"
          onClick={() => setPickerOpen((o) => !o)}
          title="emoji"
          style={{
            fontFamily: MONO,
            fontSize: 14,
            lineHeight: 1,
            color: AMBER,
            background: 'transparent',
            border: '1px solid rgba(249,206,15,0.3)',
            padding: '0 8px',
            cursor: 'pointer',
          }}
        >
          {pickerOpen ? '☻' : '🙂'}
        </button>
        <input
          ref={inputRef}
          value={text}
          maxLength={MAX_MESSAGE_LEN}
          placeholder="say something..."
          autoFocus
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          style={{
            flex: 1,
            fontFamily: MONO,
            fontSize: 12,
            color: AMBER,
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(249,206,15,0.3)',
            padding: '6px 8px',
            outline: 'none',
          }}
        />
        <button
          type="button"
          onClick={submit}
          disabled={!text.trim()}
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: 1,
            color: '#000',
            background: text.trim() ? AMBER : 'rgba(249,206,15,0.3)',
            border: 'none',
            padding: '0 12px',
            cursor: text.trim() ? 'pointer' : 'default',
            fontWeight: 700,
            minWidth: 56,
          }}
        >
          SEND
        </button>
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 9,
          color: 'rgba(249,206,15,0.4)',
          textAlign: 'right',
        }}
      >
        {text.length}/{MAX_MESSAGE_LEN}
      </div>
    </div>
  );
}
