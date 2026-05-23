import Avatar from './Avatar';
import { AMBER, MONO } from './theme';
import type { ChatProfile } from './types';

interface Props {
  profile: ChatProfile;
  collapsed: boolean;
  onToggle: () => void;
  onEditProfile: () => void;
}

export default function ChatHeader({ profile, collapsed, onToggle, onEditProfile }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 10px',
        borderBottom: collapsed ? 'none' : '1px solid rgba(249,206,15,0.15)',
        fontFamily: MONO,
      }}
    >
      <span style={{ fontSize: 11, color: AMBER, textTransform: 'uppercase', letterSpacing: 2 }}>
        {'>> live_chat'}
      </span>
      <span
        className="chat-online-dot"
        style={{ fontSize: 10, color: '#77c56e', marginRight: 'auto' }}
      >
        ● online
      </span>

      {/* Gmail-style avatar button → re-open registration */}
      <button
        type="button"
        onClick={onEditProfile}
        title="edit profile"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <Avatar avatar={profile.avatar} size={22} />
      </button>

      <button
        type="button"
        onClick={onToggle}
        title={collapsed ? 'expand' : 'collapse'}
        style={{
          fontFamily: MONO,
          fontSize: 12,
          color: AMBER,
          background: 'transparent',
          border: '1px solid rgba(249,206,15,0.3)',
          width: 20,
          height: 20,
          lineHeight: 1,
          cursor: 'pointer',
        }}
      >
        {collapsed ? '+' : '–'}
      </button>
    </div>
  );
}
