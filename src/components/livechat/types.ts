export type AvatarData =
  | { type: 'photo'; dataUrl: string }
  | { type: 'generated'; seed: string };

export interface ChatAuthor {
  nickname: string;
  avatar: AvatarData;
  rank?: string; // present only for the local user (v1)
  rankTier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legend';
}

export interface ChatProfile {
  nickname: string;
  avatar: AvatarData;
}

export interface ChatMessage {
  id: string;
  author: ChatAuthor;
  text: string;
  ts: number;
  isOwn?: boolean;
  isBot?: boolean;
  status?: 'sending' | 'sent'; // absence = 'sent' (bots & seed messages)
}
