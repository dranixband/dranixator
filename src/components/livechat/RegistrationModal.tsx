import { useState } from 'react';
import AvatarBuilder from './AvatarBuilder';
import { AMBER, MONO, PANEL_BG, PANEL_SHADOW } from './theme';
import type { AvatarData, ChatProfile } from './types';

interface Props {
  initial: ChatProfile | null;
  onSave: (p: ChatProfile) => void;
  onSkip: () => void;
  onClose: () => void;
}

export default function RegistrationModal({ initial, onSave, onSkip, onClose }: Props) {
  const [nickname, setNickname] = useState(
    initial && initial.nickname !== 'Anonymous' ? initial.nickname : '',
  );
  const [avatar, setAvatar] = useState<AvatarData>(
    initial ? initial.avatar : { type: 'generated', seed: nickname || 'guest' },
  );

  const handleSave = () => {
    const nick = nickname.trim();
    if (!nick) {
      onSkip();
      return;
    }
    // Default generated avatar keys off the chosen nick.
    const finalAvatar: AvatarData =
      avatar.type === 'generated' && (avatar.seed === '' || avatar.seed === 'guest')
        ? { type: 'generated', seed: nick }
        : avatar;
    onSave({ nickname: nick, avatar: finalAvatar });
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
        zIndex: 1000,
      }}
    >
      <div
        className="review-popup-enter"
        onClick={(e) => e.stopPropagation()}
        style={{
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
            fontSize: 12,
            color: AMBER,
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(249,206,15,0.3)',
            padding: '8px 10px',
            outline: 'none',
          }}
        />

        <AvatarBuilder value={avatar} onChange={setAvatar} />

        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button type="button" onClick={onSkip} style={skipStyle}>
            SKIP
          </button>
          <button type="button" onClick={handleSave} style={saveStyle}>
            SAVE
          </button>
        </div>
      </div>
    </div>
  );
}

const skipStyle: React.CSSProperties = {
  flex: 1,
  fontFamily: MONO,
  fontSize: 10,
  letterSpacing: 1,
  color: 'rgba(249,206,15,0.5)',
  border: '1px solid rgba(249,206,15,0.2)',
  background: 'transparent',
  padding: '8px 0',
  cursor: 'pointer',
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
