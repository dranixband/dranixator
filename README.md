# DRANIX // dranixator

Interactive PCB-style board for **DRANIX** — a band that fuses music with IT/AI aesthetics. Each song is a microchip on the board. Listeners build connections between chips by leaving reviews, unlocking new tracks along the way.

## How it works

- The board starts with one unlocked chip
- Click a chip to start building a path
- Place nodes in 8 directions — each node requires a short review
- When a path reaches a locked chip, it unlocks
- Connect all 9 chips to complete the board

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

## Features

- Pan & zoom (mouse drag + scroll wheel)
- Touch support (single-finger pan, pinch-to-zoom)
- SVG wire rendering with glow effects and energy flow animations
- Review system (write & read reviews on each node)
- Chip unlock animations
- Custom PCB chip artwork with DRANIX branding
