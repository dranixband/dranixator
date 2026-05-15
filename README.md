# DRANIX // dranixator

https://dranixband.github.io/dranixator/

Interactive PCB-style board for **DRANIX** — a band that fuses music with IT/AI aesthetics. Each song is a microchip on the board. Listeners build connections between chips by completing mini-games, unlocking new tracks along the way.

## How it works

- The board starts with one unlocked chip
- Click a chip to start building a path
- Place nodes in 8 directions — each node is a mini-game challenge
- When a path reaches a locked chip, it unlocks
- Connect all 9 chips to complete the board

## Node types (mini-games)

Each node on a path requires completing one of 5 randomly assigned challenges:

| Type | Challenge | Result |
|------|-----------|--------|
| **Riddle** | Guess which track 3 emojis represent | Correct/wrong (must be correct to place) |
| **Puzzle** | Solve a sliding puzzle with the song's cover art | Move count |
| **Memory** | Find matching pairs of album covers | Flip count (with flip limit) |
| **Wire Trace** | Connect numbered dots by drawing lines without crossing | Line count |
| **Word Scramble** | Reorder shuffled words from song lyrics into the correct phrase | Attempt count |

## Difficulty progression

Challenges get harder the further a node is from its parent chip:

- **7 levels**: Easy -> Easy+ -> Medium -> Medium+ -> Hard -> Hard+ -> Expert
- Wire Trace scales from 4 to 10 dots
- Memory scales from 22 to 10 max flips
- Word Scramble scales from 5 to 1 max attempts
- Difficulty level displayed with color indicator (green -> yellow -> red)

## Tech stack

- React + TypeScript + Vite
- Tailwind CSS v4
- No backend — fully client-side

## Getting started

```bash
# install dependencies
npm install

# run dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

## Build for production

```bash
npm run build
```

Output goes to `dist/`.

## Project structure

```
src/
  constants/
    songs.ts           # Single source of truth for song labels (SongLabel type)
    riddles.ts         # Emoji riddle definitions
    lyrics.ts          # Song lyrics
    wordScrambles.ts   # Word scramble phrases + audio timecodes
  components/
    Board.tsx          # Main board — state, rendering, SVG wires, chips, sockets
    ReviewPopup.tsx    # Node creation popup (routes to mini-game components)
    EmojiRiddle.tsx    # Emoji-to-song guessing game
    SlidingPuzzle.tsx  # Sliding puzzle game
    MemoryGame.tsx     # Card matching game
    WireTrace.tsx      # Connect-the-dots drawing game
    WordScramble.tsx   # Word scramble (reorder lyrics) game
    PixelCanvas.tsx    # Pixel art editor (disabled)
    RhythmTap.tsx      # Rhythm tapping game (disabled)
public/
    songs/             # Audio files (MP3/WAV)
    puzzleImages/      # Album cover art for puzzles
    lottie/            # Reaction animations
```

## Features

- Pan & zoom (mouse drag + scroll wheel)
- Touch support (single-finger pan, pinch-to-zoom)
- SVG wire rendering with glow effects and energy flow animations
- 5 active mini-game node types with difficulty progression
- Chip unlock animations
- Global audio player with play/pause, seek, volume
- Fragment playback with fade-in/out on Word Scramble success
- Player lock during reward fragments
- Reaction system (Lottie animations) per chip
- Custom PCB chip artwork with DRANIX branding
- Song-specific puzzle images (album covers)
- Typed song labels — single source of truth with TypeScript enforcement
