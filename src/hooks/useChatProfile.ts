import { useCallback, useState } from 'react';
import type { ChatProfile } from '../components/livechat/types';
import { randomSeed } from '../lib/avatarGen';

const KEY = 'dranix_chat_profile';

export function anonymousProfile(): ChatProfile {
  return { nickname: 'Anonymous', avatar: { type: 'generated', seed: randomSeed() } };
}

function load(): ChatProfile | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (
      p &&
      typeof p.nickname === 'string' &&
      p.avatar &&
      (p.avatar.type === 'photo' || p.avatar.type === 'generated')
    ) {
      return p as ChatProfile;
    }
    return null;
  } catch {
    return null;
  }
}

export function useChatProfile() {
  const [profile, setProfileState] = useState<ChatProfile | null>(() => load());

  const setProfile = useCallback((p: ChatProfile) => {
    setProfileState(p);
    try {
      localStorage.setItem(KEY, JSON.stringify(p));
    } catch {
      // localStorage unavailable/full → keep session-only profile.
    }
  }, []);

  return { profile, setProfile, hasProfile: profile !== null };
}
