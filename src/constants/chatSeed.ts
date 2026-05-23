import type { ChatAuthor, ChatMessage } from '../components/livechat/types';

const BOT_AUTHORS: ChatAuthor[] = [
  { nickname: 'synth_kid', avatar: { type: 'generated', seed: 'synth_kid' } },
  { nickname: 'neon_ghost', avatar: { type: 'generated', seed: 'neon_ghost' } },
  { nickname: 'pcb_punk', avatar: { type: 'generated', seed: 'pcb_punk' } },
  { nickname: 'wire_witch', avatar: { type: 'generated', seed: 'wire_witch' } },
  { nickname: 'lo_fi_lena', avatar: { type: 'generated', seed: 'lo_fi_lena' } },
  { nickname: 'bassline_bot', avatar: { type: 'generated', seed: 'bassline_bot' } },
];

const BOT_LINES: string[] = [
  'this track goes so hard 🔥',
  'de(A)d ins(I)de on repeat all night',
  'the bass_chorus pad is unreal',
  'when is the next drop?? need it now',
  'dranix never misses fr',
  'looping vox_chorus + drums = perfection',
  'first time hearing this, instant fan',
  'turn it UP, neighbors can wait',
  'that synth tone is pure 80s heaven',
  'who else is here from the demo recording',
  'okay this is my new favorite band',
  'singalong section hits different live',
];

let counter = 0;
function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now()}-${counter}`;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function makeBotMessage(): ChatMessage {
  return {
    id: nextId('bot'),
    author: pick(BOT_AUTHORS),
    text: pick(BOT_LINES),
    ts: Date.now(),
    isBot: true,
  };
}

// Initial feed shown on mount.
export function seedMessages(): ChatMessage[] {
  const picks = [BOT_LINES[0], BOT_LINES[3], BOT_LINES[7], BOT_LINES[10]];
  return picks.map((text, i) => ({
    id: nextId('seed'),
    author: BOT_AUTHORS[i % BOT_AUTHORS.length],
    text,
    ts: Date.now() - (picks.length - i) * 9000,
    isBot: true,
  }));
}
