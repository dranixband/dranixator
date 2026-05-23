import type { ChatAuthor, ChatMessage } from '../components/livechat/types';

const BOT_AUTHORS: ChatAuthor[] = [
  { nickname: 'synth_kid', avatar: { type: 'generated', seed: 'synth_kid' } },
  { nickname: 'neon_ghost', avatar: { type: 'generated', seed: 'neon_ghost' } },
  { nickname: 'pcb_punk', avatar: { type: 'generated', seed: 'pcb_punk' } },
  { nickname: 'wire_witch', avatar: { type: 'generated', seed: 'wire_witch' } },
  { nickname: 'lo_fi_lena', avatar: { type: 'generated', seed: 'lo_fi_lena' } },
  { nickname: 'bassline_bot', avatar: { type: 'generated', seed: 'bassline_bot' } },
  { nickname: 'ritual_rat', avatar: { type: 'generated', seed: 'ritual_rat' } },
  { nickname: '404_angel', avatar: { type: 'generated', seed: '404_angel' } },
  { nickname: 'dead_inside_too', avatar: { type: 'generated', seed: 'dead_inside_too' } },
  { nickname: 'voltage_v', avatar: { type: 'generated', seed: 'voltage_v' } },
  { nickname: 'static_sam', avatar: { type: 'generated', seed: 'static_sam' } },
  { nickname: 'glitchcore_gf', avatar: { type: 'generated', seed: 'glitchcore_gf' } },
  { nickname: 'maloxima_maxi', avatar: { type: 'generated', seed: 'maloxima_maxi' } },
  { nickname: 'circuit_breaker', avatar: { type: 'generated', seed: 'circuit_breaker' } },
  { nickname: 'sad_robot_99', avatar: { type: 'generated', seed: 'sad_robot_99' } },
];

// Fan chatter for the simulated live chat. References dranix's real catalogue
// (de(A)d ins(I)de, r{IT}ual, de[AR] sinner, adam /Ai/ ve, Maloxima,
// samur<Ai/ protocol, bed rotting) and the band's AI / circuit / ritual aesthetic,
// plus the site's sampler pads. Keep these short and chat-sized.
const BOT_LINES: string[] = [
  // de(A)d ins(I)de — the one that started it all
  'de(A)d ins(I)de on repeat all night 🔁',
  'the (A) and (I) hidden in dead inside… genius naming honestly',
  'still not over the de(A)d ins(I)de demo recording',
  'dead inside but make it a banger',
  'first dranix song i ever heard was de(A)d ins(I)de, no going back',
  // r{IT}ual
  'r{IT}ual is straight up a summoning, my speakers are possessed',
  'the breakdown in r{IT}ual rewired my brain',
  'pls play r{IT}ual next i NEED it',
  // de[AR] sinner
  'de[AR] sinner got me on my knees in the pit fr',
  'de[AR] sinner > everything, fight me',
  'the [AR] in de[AR] sinner… augmented reality sinner arc',
  // adam /Ai/ ve
  'adam /Ai/ ve is such a clever title omg',
  'adam & ai-ve living rent free in my head',
  'the /Ai/ wordplay never misses with these guys',
  // samur<Ai/ protocol
  'samur<Ai/ protocol is the future, 2026 starting strong 🥷',
  'samur<Ai/ protocol intro gave me chills',
  'new drop samur<Ai/ protocol on LOOP',
  // Maloxima
  'Maloxima still undefeated in the discography',
  'put Maloxima in the setlist you cowards 😤',
  // bed rotting feat
  'bed rotting feat dranix is my whole personality now',
  'modern wendigo + dranix on bed rotting?? unreal collab',
  // sampler pads / site
  'the bass_chorus pad is UNREAL',
  'looping vox_chorus + drums_chorus = perfection',
  'stacked all 8 pads at once and ascended',
  'tapped singalong and the whole room joined in',
  'who keeps spamming the bleagh pad 😭 (it was me)',
  'the "okay" pad is weirdly addictive',
  'guitar_chorus pad on loop is therapy',
  'this whole site is a circuit board and i love it here',
  'connecting the chips like signal flow, peak interactive',
  // AI / circuit / ritual aesthetic
  'every song title is an ARG and i am NOT okay',
  'the AI-coded titles are too clever, my eng teacher could never',
  'dranix really said let’s hide words in brackets and eat',
  'synthwave + glitch + a little horror = the dranix formula',
  'their whole vibe is haunted machine and it WORKS',
  'pcb aesthetic + these basslines is criminal',
  'the neon is melting my retinas and i thank them',
  // generic hype / freshness
  'this track goes so hard 🔥',
  'dranix never misses fr',
  'turn it UP, neighbors can wait',
  'that synth tone is pure 80s heaven',
  'okay this is my new favorite band',
  'just put my whole playlist on dranix, sorry to everyone else',
  'goosebumps. actual goosebumps.',
  'how is this not on every chart already',
  'streamed it 40 times today, no regrets',
  'tell me you’re emo without telling me… *opens dranix*',
  'the production on every single is insane',
  'who is mixing these, give them a raise',
  'found them yesterday, already a lifer 🫡',
  'need a vinyl pressing IMMEDIATELY',
  'this band is gonna blow up, screenshot this',
  'concert when?? i’ll fly anywhere',
  'add merch pls i will buy all of it',
  'the lore in these songs is deeper than my degree',
  'every drop feels like an event honestly',
  'my serotonin is sponsored by dranix now',
  'instant add to the late night drive playlist 🚗💨',
  'the silence after the last note… devastating',
  'replay value is off the charts',
  'genuinely cannot pick a favorite song anymore',
  'the way the bass sits in the mix… chef’s kiss',
  'someone make a 1 hour loop of the chorus pls',
  'this is the soundtrack to my villain origin story',
  'so glad i stumbled into this chat lol',
  'lurking but had to say this slaps',
  'first time here, won’t be the last 👀',
];

let counter = 0;
function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now()}-${counter}`;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Returns up to `n` distinct random items from `arr` (order shuffled).
function pickDistinct<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(n, copy.length));
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

// Initial feed shown on mount — random distinct lines so it feels fresh each load.
export function seedMessages(): ChatMessage[] {
  const lines = pickDistinct(BOT_LINES, 4);
  const authors = pickDistinct(BOT_AUTHORS, 4);
  return lines.map((text, i) => ({
    id: nextId('seed'),
    author: authors[i % authors.length],
    text,
    ts: Date.now() - (lines.length - i) * 9000,
    isBot: true,
  }));
}
