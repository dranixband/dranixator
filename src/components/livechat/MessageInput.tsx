import { useState } from 'react';
import { useSendThrottle } from '../../hooks/useSendThrottle';
import { AMBER, MONO, MAX_MESSAGE_LEN } from './theme';

interface Props {
  onSend: (text: string) => void;
}

export default function MessageInput({ onSend }: Props) {
  const [text, setText] = useState('');
  const { canSend, secondsLeft, registerSend } = useSendThrottle();

  const submit = () => {
    const t = text.trim();
    if (!t || !canSend) return;
    onSend(t);
    registerSend();
    setText('');
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div
      style={{
        borderTop: '1px solid rgba(249,206,15,0.15)',
        padding: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          value={text}
          maxLength={MAX_MESSAGE_LEN}
          placeholder={canSend ? 'say something...' : `wait ${secondsLeft}s...`}
          disabled={!canSend}
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
            opacity: canSend ? 1 : 0.6,
          }}
        />
        <button
          type="button"
          onClick={submit}
          disabled={!canSend || !text.trim()}
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: 1,
            color: '#000',
            background: canSend && text.trim() ? AMBER : 'rgba(249,206,15,0.3)',
            border: 'none',
            padding: '0 12px',
            cursor: canSend && text.trim() ? 'pointer' : 'default',
            fontWeight: 700,
            minWidth: 56,
          }}
        >
          {canSend ? 'SEND' : `${secondsLeft}s`}
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
