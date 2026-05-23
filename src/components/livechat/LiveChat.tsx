import { useState } from 'react';
import ChatWindow from './ChatWindow';
import RegistrationModal from './RegistrationModal';
import { useChatProfile, anonymousProfile } from '../../hooks/useChatProfile';
import { useSimulatedChat } from '../../hooks/useSimulatedChat';
import type { ChatMessage, ChatProfile } from './types';

let ownCounter = 0;

export default function LiveChat() {
  const { profile, setProfile, hasProfile } = useChatProfile();
  const { messages, pushMessage } = useSimulatedChat();
  const [collapsed, setCollapsed] = useState(false);
  // Auto-open registration on first visit (no stored profile).
  const [showRegistration, setShowRegistration] = useState(() => !hasProfile);

  const handleSave = (p: ChatProfile) => {
    setProfile(p);
    setShowRegistration(false);
  };

  const handleSkip = () => {
    setProfile(anonymousProfile());
    setShowRegistration(false);
  };

  const handleSend = (text: string) => {
    const active = profile ?? anonymousProfile();
    ownCounter += 1;
    const msg: ChatMessage = {
      id: `own-${Date.now()}-${ownCounter}`,
      author: { nickname: active.nickname, avatar: active.avatar },
      text,
      ts: Date.now(),
      isOwn: true,
    };
    pushMessage(msg);
  };

  // Use a working profile for the window even before save (Anonymous preview).
  const activeProfile = profile ?? { nickname: 'Anonymous', avatar: { type: 'generated', seed: 'guest' } as const };

  return (
    <>
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
          onSkip={handleSkip}
          onClose={() => {
            // Closing without choosing on first visit → treat as skip.
            if (!hasProfile) handleSkip();
            else setShowRegistration(false);
          }}
        />
      )}
    </>
  );
}
