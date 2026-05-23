export type AvatarData =
  | { type: 'photo'; dataUrl: string }
  | { type: 'generated'; seed: string };

export interface ChatAuthor {
  nickname: string;
  avatar: AvatarData;
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
}
