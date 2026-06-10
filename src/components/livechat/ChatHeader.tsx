import Avatar from "./Avatar";
import { AMBER, MONO } from "./theme";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { ChatProfile } from "./types";

interface Props {
  profile: ChatProfile;
  collapsed: boolean;
  compact?: boolean;
  onlineCount?: number;
  onToggle: () => void;
  onEditProfile: () => void;
  onPointerDown?: (e: ReactPointerEvent) => void;
}

export default function ChatHeader({
  profile,
  collapsed,
  compact = false,
  onlineCount,
  onToggle,
  onEditProfile,
  onPointerDown,
}: Props) {
  return (
    <div
      onPointerDown={onPointerDown}
      style={{
        display: "flex",
        alignItems: "center",
        gap: compact ? 6 : 8,
        padding: compact ? "5px 8px" : "8px 10px",
        borderBottom: collapsed ? "none" : "1px solid rgba(249,206,15,0.15)",
        fontFamily: MONO,
        cursor: compact ? "default" : "grab",
        userSelect: "none",
        touchAction: "none",
      }}
    >
      <span
        style={{
          fontSize: 11,
          color: AMBER,
          textTransform: "uppercase",
          letterSpacing: compact ? 1 : 2,
        }}
      >
        {">> live_chat"}
      </span>
      {!compact && (
        <span
          className="chat-online-dot"
          style={{ fontSize: 10, color: "#77c56e", marginRight: "auto" }}
        >
          {onlineCount && onlineCount > 0
            ? `● ${onlineCount} online`
            : "● online"}
        </span>
      )}
      {compact && (
        <span
          className="chat-online-dot"
          style={{ fontSize: 9, color: "#77c56e", marginRight: "auto" }}
        >
          ●
        </span>
      )}

      {!compact && (
        <button
          type="button"
          onClick={onEditProfile}
          title="edit profile"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <Avatar avatar={profile.avatar} size={22} />
        </button>
      )}

      <button
        type="button"
        onClick={onToggle}
        title={collapsed ? "expand" : "collapse"}
        style={{
          fontFamily: MONO,
          fontSize: 12,
          color: AMBER,
          background: "transparent",
          border: "1px solid rgba(249,206,15,0.3)",
          width: 20,
          height: 20,
          lineHeight: 1,
          cursor: "pointer",
        }}
      >
        {collapsed ? "+" : "–"}
      </button>
    </div>
  );
}
