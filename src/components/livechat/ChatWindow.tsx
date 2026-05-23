import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { MONO, PANEL_BG, PANEL_BORDER, PANEL_SHADOW } from './theme';
import type { ChatMessage, ChatProfile } from './types';

interface Props {
  profile: ChatProfile;
  messages: ChatMessage[];
  collapsed: boolean;
  onToggle: () => void;
  onEditProfile: () => void;
  onSend: (text: string) => void;
}

export default function ChatWindow({
  profile,
  messages,
  collapsed,
  onToggle,
  onEditProfile,
  onSend,
}: Props) {
  return (
    <div
      className="review-popup-enter"
      style={{
        position: 'fixed',
        top: 16,
        left: 16,
        width: 300,
        height: collapsed ? 'auto' : 420,
        maxHeight: 'calc(100vh - 32px)',
        background: PANEL_BG,
        border: PANEL_BORDER,
        borderRadius: 8,
        boxShadow: PANEL_SHADOW,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 900,
        fontFamily: MONO,
      }}
    >
      <ChatHeader
        profile={profile}
        collapsed={collapsed}
        onToggle={onToggle}
        onEditProfile={onEditProfile}
      />
      {!collapsed && (
        <>
          <MessageList messages={messages} />
          <MessageInput onSend={onSend} />
        </>
      )}
    </div>
  );
}
