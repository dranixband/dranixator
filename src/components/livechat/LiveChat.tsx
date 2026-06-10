import { useState } from "react";
import ChatWindow from "./ChatWindow";
import RegistrationModal from "./RegistrationModal";
import { useChatProfile, anonymousProfile } from "../../hooks/useChatProfile";
import { useChat } from "../../hooks/useChat";
import { useIsMobile } from "../../hooks/useIsMobile";
import type { ChatMessage, ChatProfile } from "./types";

let ownCounter = 0;

export default function LiveChat() {
  const { profile, setProfile, hasProfile } = useChatProfile();
  const { messages, sendMessage } = useChat();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(isMobile);
  // Auto-open registration on first visit (no stored profile).
  const [showRegistration, setShowRegistration] = useState(() => !hasProfile);

  const handleSave = (p: ChatProfile) => {
    setProfile(p);
    setShowRegistration(false);
  };

  const handleClose = () => {
    // First visit → persist Anonymous (random avatar) for a stable identity.
    // Re-opening to edit then closing must not wipe an existing identity.
    if (!hasProfile) setProfile(anonymousProfile());
    setShowRegistration(false);
  };

  const handleSend = (text: string) => {
    const active = profile ?? anonymousProfile();
    ownCounter += 1;
    const id = `own-${Date.now()}-${ownCounter}`;
    const msg: ChatMessage = {
      id,
      author: { nickname: active.nickname, avatar: active.avatar },
      text,
      ts: Date.now(),
      isOwn: true,
      status: "sending",
    };
    sendMessage(msg);
  };

  // Use a working profile for the window even before save (Anonymous preview).
  const activeProfile = profile ?? {
    nickname: "Anonymous",
    avatar: { type: "generated", seed: "guest" } as const,
  };

  return (
    <>
      {isMobile && !collapsed && (
        <div
          onClick={() => setCollapsed(true)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 149,
            background: "transparent",
          }}
        />
      )}
      <ChatWindow
        profile={activeProfile}
        messages={messages}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        onEditProfile={() => setShowRegistration(true)}
        onSend={handleSend}
      />
      {showRegistration && (
        <RegistrationModal
          initial={profile}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </>
  );
}
