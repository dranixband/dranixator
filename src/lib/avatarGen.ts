import { WIRE_COLORS } from '../components/livechat/theme';

// FNV-1a 32-bit hash → deterministic uint32 from a seed string.
export function hashSeed(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// Pick an accent color from the wire palette, deterministically.
export function avatarColor(seed: string): string {
  return WIRE_COLORS[hashSeed(seed) % WIRE_COLORS.length];
}

// 5x5 left-right symmetric grid (GitHub-identicon style).
// Returns a boolean[5][5]; `true` = lit cell.
export function avatarCells(seed: string): boolean[][] {
  const h = hashSeed(seed);
  const cells: boolean[][] = [];
  for (let y = 0; y < 5; y++) {
    const row: boolean[] = [false, false, false, false, false];
    for (let x = 0; x < 3; x++) {
      const bit = (h >> ((y * 3 + x) % 31)) & 1;
      row[x] = bit === 1;
    }
    row[3] = row[1]; // mirror
    row[4] = row[0];
    cells.push(row);
  }
  return cells;
}

// Random seed for "regenerate" and Anonymous defaults.
export function randomSeed(): string {
  return Math.random().toString(36).slice(2, 10);
}
