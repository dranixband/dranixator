export interface EmojiGroup {
  label: string;
  emojis: string[];
}

// Curated ~40 native unicode emojis, grouped by theme. No images, no animations.
export const CHAT_EMOJI_GROUPS: EmojiGroup[] = [
  {
    label: 'faces',
    emojis: ['😀', '😎', '😭', '🤣', '😏', '🥲', '😤', '🤯', '🙃', '😴'],
  },
  {
    label: 'tech',
    emojis: ['🤖', '⚡', '💾', '🔌', '🛸', '👾', '🕹️', '📡'],
  },
  {
    label: 'music',
    emojis: ['🎵', '🎸', '🔊', '🎧', '🥁', '🎹', '🎤'],
  },
  {
    label: 'hands',
    emojis: ['👍', '🤘', '👏', '🙌', '🔥', '🤝', '✌️'],
  },
  {
    label: 'fun',
    emojis: ['💩', '💀', '✨', '🌈', '💯', '🎉', '👽'],
  },
];
