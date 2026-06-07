import { useState } from 'react';
import ChatWindow from './ChatWindow';
import RegistrationModal from './RegistrationModal';
import { useChatProfile, anonymousProfile } from '../../hooks/useChatProfile';
import { useSimulatedChat } from '../../hooks/useSimulatedChat';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useAchievements } from '../../hooks/useAchievements';
import { track } from '../../achievements/bus';
import type { ChatMessage, ChatProfile } from './types';

const containsEmoji = (s: string) => /\p{Extended_Pictographic}/u.test(s);

let ownCounter = 0;

export default function LiveChat() {
  const { profile, setProfile, hasProfile } = useChatProfile();
  const { rank } = useAchievements();
  const { messages, pushMessage, updateMessage } = useSimulatedChat();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(isMobile);
  // Auto-open registration on first visit (no stored profile).
  const [showRegistration, setShowRegistration] = useState(() => !hasProfile);

  const handleSave = (p: ChatProfile) => {
    setProfile(p);
    track({ kind: 'callsign_set' });
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
    const showRank = rank.isLegend || rank.index > 0; // Civilian (index 0) shows no badge
    const msg: ChatMessage = {
      id,
      author: {
        nickname: active.nickname,
        avatar: active.avatar,
        ...(showRank ? { rank: rank.rank, rankTier: rank.tier } : {}),
      },
      text,
      ts: Date.now(),
      isOwn: true,
      status: 'sending',
    };
    track({ kind: 'chat_message', hasEmoji: containsEmoji(text) });
    pushMessage(msg);
    window.setTimeout(() => updateMessage(id, { status: 'sent' }), 700);
  };

  // Use a working profile for the window even before save (Anonymous preview).
  const activeProfile = profile ?? { nickname: 'Anonymous', avatar: { type: 'generated', seed: 'guest' } as const };

  return (
    <>
      {isMobile && !collapsed && (
        <div
          onClick={() => setCollapsed(true)}
          style={{ position: 'fixed', inset: 0, zIndex: 149, background: 'transparent' }}
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
