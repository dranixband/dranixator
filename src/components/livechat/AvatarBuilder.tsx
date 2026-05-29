import { useRef, useState } from 'react';
import Avatar from './Avatar';
import { randomSeed } from '../../lib/avatarGen';
import { AMBER, MONO } from './theme';
import type { AvatarData } from './types';

const MAX_PHOTO_BYTES = 2 * 1024 * 1024; // 2 MB

interface Props {
  value: AvatarData;
  onChange: (a: AvatarData) => void;
}

export default function AvatarBuilder({ value, onChange }: Props) {
  const [tab, setTab] = useState<'photo' | 'generated'>(value.type);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('// not_an_image');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError('// max 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange({ type: 'photo', dataUrl: String(reader.result) });
    reader.onerror = () => setError('// read_failed');
    reader.readAsDataURL(file);
  };

  const tabBtn = (id: 'photo' | 'generated', label: string) => (
    <button
      type="button"
      onClick={() => {
        setTab(id);
        if (id === 'generated' && value.type !== 'generated') {
          onChange({ type: 'generated', seed: randomSeed() });
        }
      }}
      style={{
        flex: 1,
        fontFamily: MONO,
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
        padding: '6px 0',
        cursor: 'pointer',
        background: tab === id ? 'rgba(249,206,15,0.08)' : 'transparent',
        border: '1px solid rgba(249,206,15,0.2)',
        borderBottomColor: tab === id ? AMBER : 'rgba(249,206,15,0.2)',
        color: tab === id ? AMBER : 'rgba(249,206,15,0.4)',
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {tabBtn('photo', '// photo')}
        {tabBtn('generated', '// generate')}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Avatar avatar={value} size={56} />

        {tab === 'photo' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              style={btnStyle}
            >
              UPLOAD PHOTO
            </button>
            {error && (
              <span style={{ fontFamily: MONO, fontSize: 9, color: '#df0221' }}>{error}</span>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onChange({ type: 'generated', seed: randomSeed() })}
            style={regenStyle}
            title="regenerate"
          >
            <span style={{ fontSize: 19, lineHeight: 1 }}>↻</span>
            <span style={{ fontSize: 9, letterSpacing: 1 }}>REGENERATE</span>
          </button>
        )}
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 10,
  letterSpacing: 1,
  color: AMBER,
  border: '1px solid rgba(249,206,15,0.5)',
  background: 'transparent',
  padding: '6px 12px',
  cursor: 'pointer',
};

const regenStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontFamily: MONO,
  color: AMBER,
  border: '1px solid rgba(249,206,15,0.5)',
  background: 'transparent',
  padding: '6px 12px',
  cursor: 'pointer',
};
