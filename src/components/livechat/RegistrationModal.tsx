import { useEffect, useState } from 'react';
import AvatarBuilder from './AvatarBuilder';
import { randomSeed } from '../../lib/avatarGen';
import { useIsMobile } from '../../hooks/useIsMobile';
import { AMBER, MONO, PANEL_BG, PANEL_SHADOW } from './theme';
import type { AvatarData, ChatProfile } from './types';

interface Props {
  initial: ChatProfile | null;
  onSave: (p: ChatProfile) => void;
  onClose: () => void;
}

export default function RegistrationModal({ initial, onSave, onClose }: Props) {
  const isMobile = useIsMobile();
  const [nickname, setNickname] = useState(
    initial && initial.nickname !== 'Anonymous' ? initial.nickname : '',
  );
  // Random default preview, computed once per open (not 'guest', not from nick).
  const [avatar, setAvatar] = useState<AvatarData>(() =>
    initial ? initial.avatar : { type: 'generated', seed: randomSeed() },
  );

  // Close on Escape, matching the existing ReviewPopup modal convention.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSave = () => {
    const nick = nickname.trim();
    if (!nick) {
      onClose(); // empty nick → Anonymous branch (handled by onClose on first visit)
      return;
    }
    onSave({ nickname: nick, avatar });
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 180,
      }}
    >
      <div
        className="chat-boot-enter"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: 320,
          background: PANEL_BG,
          border: '1px solid rgba(249,206,15,0.25)',
          borderRadius: 10,
          boxShadow: PANEL_SHADOW,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          fontFamily: MONO,
        }}
      >
        {/* ✕ close — top-right, amber, hover glow */}
        <button
          type="button"
          onClick={onClose}
          title="close"
          style={closeStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.textShadow = '0 0 8px rgba(249,206,15,0.8)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.textShadow = 'none';
          }}
        >
          ✕
        </button>

        <div
          style={{
            fontSize: 11,
            color: AMBER,
            textTransform: 'uppercase',
            letterSpacing: 2,
          }}
        >
          {'>> identify_yourself'}
        </div>

        <label style={{ fontSize: 9, color: 'rgba(249,206,15,0.5)', letterSpacing: 1 }}>
          // nickname
        </label>
        <input
          value={nickname}
          maxLength={24}
          placeholder="Anonymous"
          onChange={(e) => setNickname(e.target.value)}
          style={{
            fontFamily: MONO,
            // 16px on mobile prevents iOS Safari from auto-zooming on focus.
            fontSize: isMobile ? 16 : 12,
            color: AMBER,
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(249,206,15,0.3)',
            padding: '8px 10px',
            outline: 'none',
          }}
        />

        <AvatarBuilder value={avatar} onChange={setAvatar} />

        <div style={{ display: 'flex', marginTop: 4 }}>
          <button type="button" onClick={handleSave} style={saveStyle}>
            SAVE
          </button>
        </div>
      </div>
    </div>
  );
}

const closeStyle: React.CSSProperties = {
  position: 'absolute',
  top: 10,
  right: 12,
  fontFamily: MONO,
  fontSize: 14,
  lineHeight: 1,
  color: AMBER,
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: 4,
};

const saveStyle: React.CSSProperties = {
  flex: 1,
  fontFamily: MONO,
  fontSize: 10,
  letterSpacing: 1,
  color: '#000',
  border: '1px solid #f9ce0f',
  background: '#f9ce0f',
  padding: '8px 0',
  cursor: 'pointer',
  fontWeight: 700,
};
