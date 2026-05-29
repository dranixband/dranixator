import { useState } from 'react';
import ChatWindow from './ChatWindow';
import RegistrationModal from './RegistrationModal';
import { useChatProfile, anonymousProfile } from '../../hooks/useChatProfile';
import { useSimulatedChat } from '../../hooks/useSimulatedChat';
import type { ChatMessage, ChatProfile } from './types';

let ownCounter = 0;

export default function LiveChat() {
  const { profile, setProfile, hasProfile } = useChatProfile();
  const { messages, pushMessage, updateMessage } = useSimulatedChat();
  const [collapsed, setCollapsed] = useState(false);
  // Auto-open registration on first visit (no stored profile).
  const [showRegistration, setShowRegistration] = useState(() => !hasProfile);

  const handleSave = (p: ChatProfile) => {
    setProfile(p);
    setShowRegistration(false);
  };

  const handleSkip = () => {
    // First visit → become Anonymous. Re-opening to edit then skipping must
    // not wipe an existing identity, so only create a profile when none exists.
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
      status: 'sending',
    };
    pushMessage(msg);
    window.setTimeout(() => updateMessage(id, { status: 'sent' }), 700);
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
