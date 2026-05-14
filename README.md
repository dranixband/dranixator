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

Each node on a path requires completing one of 7 randomly assigned challenges:

| Type | Challenge | Result |
|------|-----------|--------|
| **Prompt** | Answer a random question about the song | Question + answer displayed |
| **Rhythm Tap** | Tap in rhythm to a 10-sec song fragment | Tap pattern visualized |
| **Pixel Art** | Draw pixel art on a grid | Drawing displayed |
| **Riddle** | Guess which track 3 emojis represent | Correct/wrong (must be correct to place) |
| **Puzzle** | Solve a sliding puzzle with the song's cover art | Move count |
| **Memory** | Find matching pairs of album covers | Flip count |
| **Wire Trace** | Connect numbered dots by drawing lines without crossing | Line count |

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
    songs.ts        # Single source of truth for song labels (SongLabel type)
    riddles.ts      # Emoji riddle definitions
    lyrics.ts       # Song lyrics
  components/
    Board.tsx        # Main board — state, rendering, SVG wires, chips, sockets
    ReviewPopup.tsx  # Node creation popup (routes to mini-game components)
    PixelCanvas.tsx  # Pixel art editor
    RhythmTap.tsx    # Rhythm tapping game
    EmojiRiddle.tsx  # Emoji-to-song guessing game
    SlidingPuzzle.tsx # Sliding puzzle game
    MemoryGame.tsx   # Card matching game
    WireTrace.tsx    # Connect-the-dots drawing game
public/
    songs/           # Audio files (MP3/WAV)
    puzzleImages/    # Album cover art for puzzles
    lottie/          # Reaction animations
```

## Features

- Pan & zoom (mouse drag + scroll wheel)
- Touch support (single-finger pan, pinch-to-zoom)
- SVG wire rendering with glow effects and energy flow animations
- 7 mini-game node types for interactive engagement
- Chip unlock animations
- Audio player with play/pause on chips
- Reaction system (Lottie animations) per chip
- U-shaped SVG socket connectors on chip anchor points
- Custom PCB chip artwork with DRANIX branding
- Song-specific puzzle images (album covers)
- Typed song labels — single source of truth with TypeScript enforcement
