import { useRef } from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { MONO, PANEL_BG, PANEL_BORDER, PANEL_SHADOW } from './theme';
import { useDraggable } from '../../hooks/useDraggable';
import { useIsMobile } from '../../hooks/useIsMobile';
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
  const isMobile = useIsMobile();
  const { position, onPointerDown } = useDraggable(ref, { x: 16, y: 16 }, isMobile);

  // Layout differs by device + collapsed state.
  let layout: React.CSSProperties;
  if (isMobile) {
    layout = collapsed
      ? { top: 8, left: 8, width: 'auto', height: 'auto', borderRadius: 8, border: PANEL_BORDER }
      : { top: 0, left: 0, width: '100vw', height: '70vh', borderRadius: 0, border: PANEL_BORDER };
  } else {
    layout = {
      top: position.y,
      left: position.x,
      width: 300,
      height: collapsed ? 'auto' : 420,
      maxHeight: 'calc(100vh - 32px)',
      borderRadius: 8,
      border: PANEL_BORDER,
    };
  }

  return (
    <div
      ref={ref}
      className="chat-boot-enter"
      style={{
        position: 'fixed',
        ...layout,
        background: PANEL_BG,
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
        compact={isMobile && collapsed}
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
