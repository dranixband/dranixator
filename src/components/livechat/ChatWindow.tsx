import { useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { MONO, PANEL_BG, PANEL_BORDER, PANEL_SHADOW } from "./theme";
import { useDraggable } from "../../hooks/useDraggable";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useResizable } from "../../hooks/useResizable";
import { useVisualViewport } from "../../hooks/useVisualViewport";
import type { ChatMessage, ChatProfile } from "./types";

// Desktop sizing (module-level so the useResizable deps stay stable).
const DESKTOP_DEFAULT_SIZE = { width: 360, height: 560 };
const DESKTOP_MIN_SIZE = { width: 280, height: 360 };

interface Props {
  profile: ChatProfile;
  messages: ChatMessage[];
  onlineCount: number;
  collapsed: boolean;
  onToggle: () => void;
  onEditProfile: () => void;
  onSend: (text: string) => void;
}

export default function ChatWindow({
  profile,
  messages,
  onlineCount,
  collapsed,
  onToggle,
  onEditProfile,
  onSend,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const { position, onPointerDown } = useDraggable(
    ref,
    { x: 16, y: 16 },
    isMobile,
  );

  const { size, onResizeStart } = useResizable(DESKTOP_DEFAULT_SIZE, {
    min: DESKTOP_MIN_SIZE,
    disabled: isMobile,
    persistKey: "dranix_chat_size",
  });
  const vv = useVisualViewport();
  const [inputFocused, setInputFocused] = useState(false);

  // On mobile, the on-screen keyboard shrinks the usable area. A fixed top:0/70vh
  // window would leave a gap above the keyboard (Android resizes the layout
  // viewport) or slide out of view (iOS offsets the visual viewport). When a chat
  // input is focused, fill the visual viewport exactly so the input sits right
  // above the keyboard with no gap and the message list stays scrollable.
  // Focus is more reliable than a height heuristic across iOS and Android.
  const keyboardOpen = isMobile && !collapsed && inputFocused;

  // Live window height for mobile (collapses around the on-screen keyboard).
  // Used both for the panel itself and exposed as a CSS var so descendants
  // (e.g. the emoji picker) can size to the same value.
  const mobileWindowH = keyboardOpen ? `${vv.height}px` : "70vh";

  // Layout differs by device + collapsed state.
  let layout: React.CSSProperties;
  if (isMobile) {
    layout = collapsed
      ? {
          top: 8,
          left: 8,
          width: "auto",
          height: "auto",
          borderRadius: 8,
          border: PANEL_BORDER,
        }
      : {
          top: 0,
          left: 0,
          width: "100vw",
          height: mobileWindowH,
          borderRadius: 0,
          border: PANEL_BORDER,
        };
  } else {
    layout = {
      top: position.y,
      left: position.x,
      width: size.width,
      height: collapsed ? "auto" : size.height,
      maxHeight: "calc(100vh - 32px)",
      borderRadius: 8,
      border: PANEL_BORDER,
    };
  }

  const showResizeGrip = !isMobile && !collapsed;

  const cssVars = {
    "--chat-window-h": isMobile ? mobileWindowH : `${size.height}px`,
  } as React.CSSProperties;

  return (
    <div
      ref={ref}
      className="chat-boot-enter"
      onFocus={(e) => {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") setInputFocused(true);
      }}
      onBlur={(e) => {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") setInputFocused(false);
      }}
      style={{
        position: "fixed",
        ...layout,
        background: PANEL_BG,
        boxShadow: PANEL_SHADOW,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 150,
        fontFamily: MONO,
        ...cssVars,
      }}
    >
      <ChatHeader
        profile={profile}
        collapsed={collapsed}
        compact={isMobile && collapsed}
        onlineCount={onlineCount}
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
      {showResizeGrip && (
        <div
          onPointerDown={onResizeStart}
          title="resize"
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: 16,
            height: 16,
            cursor: "nwse-resize",
            color: "rgba(249,206,15,0.6)",
            fontSize: 10,
            lineHeight: "16px",
            textAlign: "center",
            userSelect: "none",
            touchAction: "none",
            zIndex: 2,
          }}
        >
          ◢
        </div>
      )}
    </div>
  );
}
