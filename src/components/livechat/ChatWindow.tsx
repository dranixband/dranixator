import { useRef } from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { MONO, PANEL_BG, PANEL_BORDER, PANEL_SHADOW } from './theme';
import { useDraggable } from '../../hooks/useDraggable';
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
  const ref = useRef<HTMLDivElement>(null);
  const { position, onPointerDown } = useDraggable(ref, { x: 16, y: 16 });

  return (
    <div
      ref={ref}
      className="chat-boot-enter"
      style={{
        position: 'fixed',
        top: position.y,
        left: position.x,
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
        zIndex: 150,
        fontFamily: MONO,
      }}
    >
      <ChatHeader
        profile={profile}
        collapsed={collapsed}
        onToggle={onToggle}
        onEditProfile={onEditProfile}
        onPointerDown={onPointerDown}
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
