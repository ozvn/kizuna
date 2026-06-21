import { colors } from './theme';

export type MochiEvolutionTier = 'baby' | 'youth' | 'ancient';

export type MochiEyeStyle = 'sleepy' | 'normal' | 'wide';

const GRID = 16;

export function getEvolutionTier(level: number): MochiEvolutionTier {
  if (level >= 16) return 'ancient';
  if (level >= 6) return 'youth';
  return 'baby';
}

export function getTierDisplay(tier: MochiEvolutionTier): {
  cellPx: number;
  containerClass: string;
} {
  switch (tier) {
    case 'baby':
      return { cellPx: 4, containerClass: 'w-16 h-16' };
    case 'youth':
      return { cellPx: 6, containerClass: 'w-24 h-24' };
    case 'ancient':
      return { cellPx: 8, containerClass: 'w-32 h-32' };
  }
}

function emptyGrid(): (string | null)[][] {
  return Array.from({ length: GRID }, () => Array<string | null>(GRID).fill(null));
}

function paint(grid: (string | null)[][], x: number, y: number, color: string) {
  if (y >= 0 && y < GRID && x >= 0 && x < GRID) grid[y][x] = color;
}

function paintBlock(
  grid: (string | null)[][],
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      paint(grid, x + dx, y + dy, color);
    }
  }
}

export interface BuildMochiGridOptions {
  level: number;
  eyeStyle: MochiEyeStyle;
  eyeFill: string;
  mood: 'happy' | 'idle' | 'hungry' | 'sleepy' | 'lonely' | 'yawning';
  isNight: boolean;
  spookiness: number;
}

export function buildMochiPixelGrid(opts: BuildMochiGridOptions): (string | null)[][] {
  const tier = getEvolutionTier(opts.level);
  const grid = emptyGrid();
  const O = colors.ink;

  const bodyMain =
    opts.isNight && opts.spookiness > 70 ? colors.lavenderDark : colors.rose;
  const bodyLight = colors.rose;
  const bodyShadow = colors.roseDark;
  const gill = opts.mood === 'hungry' ? colors.peach : colors.peachDark;

  // ── Gövde (tüm evrimler) ──
  paintBlock(grid, 4, tier === 'baby' ? 7 : 6, 8, tier === 'baby' ? 7 : 8, bodyMain);
  paintBlock(grid, 5, tier === 'baby' ? 6 : 5, 6, 1, bodyLight);
  paint(grid, 4, 8, bodyShadow);
  paint(grid, 11, 8, bodyShadow);

  // Dış hat — üst
  for (let x = 5; x <= 10; x++) paint(grid, x, tier === 'baby' ? 5 : 4, O);
  paint(grid, 4, tier === 'baby' ? 6 : 5, O);
  paint(grid, 11, tier === 'baby' ? 6 : 5, O);
  for (let y = tier === 'baby' ? 7 : 6; y <= 13; y++) {
    paint(grid, 3, y, O);
    paint(grid, 12, y, O);
  }
  for (let x = 4; x <= 11; x++) paint(grid, x, 14, O);

  // ── Kulaklar ──
  if (tier === 'baby') {
    paint(grid, 5, 4, bodyMain);
    paint(grid, 10, 4, bodyMain);
    paint(grid, 5, 3, O);
    paint(grid, 10, 3, O);
  } else if (tier === 'youth') {
    paintBlock(grid, 4, 3, 2, 2, bodyMain);
    paintBlock(grid, 10, 3, 2, 2, bodyMain);
    paint(grid, 5, 4, colors.peach);
    paint(grid, 10, 4, colors.peach);
    paint(grid, 4, 2, O);
    paint(grid, 5, 2, O);
    paint(grid, 10, 2, O);
    paint(grid, 11, 2, O);
  } else {
    paintBlock(grid, 3, 2, 2, 3, bodyMain);
    paintBlock(grid, 11, 2, 2, 3, bodyMain);
    paint(grid, 4, 3, colors.peach);
    paint(grid, 12, 3, colors.peach);
    paint(grid, 3, 1, O);
    paint(grid, 4, 1, O);
    paint(grid, 11, 1, O);
    paint(grid, 12, 1, O);
  }

  // ── Solungaçlar (aksolotl) ──
  if (tier === 'youth') {
    paintBlock(grid, 1, 9, 2, 1, gill);
    paintBlock(grid, 13, 9, 2, 1, gill);
  } else if (tier === 'ancient') {
    paintBlock(grid, 1, 8, 2, 1, gill);
    paintBlock(grid, 0, 9, 2, 1, gill);
    paintBlock(grid, 1, 10, 2, 1, gill);
    paintBlock(grid, 13, 8, 2, 1, gill);
    paintBlock(grid, 13, 9, 2, 1, gill);
    paintBlock(grid, 13, 10, 2, 1, gill);
  }

  // ── Kuyruk (kedi) — genç ve kadim ──
  if (tier !== 'baby') {
    paintBlock(grid, 1, 12, 2, 2, bodyShadow);
    paint(grid, 0, 13, bodyMain);
    paint(grid, 0, 14, O);
  }

  // ── Ayaklar ──
  if (tier === 'baby') {
    paint(grid, 5, 14, bodyShadow);
    paint(grid, 9, 14, bodyShadow);
  } else {
    paintBlock(grid, 5, 14, 2, 1, bodyShadow);
    paintBlock(grid, 9, 14, 2, 1, bodyShadow);
  }

  // ── Aksesuar / tüy ──
  if (tier === 'youth') {
    paint(grid, 7, 2, colors.gold);
    paint(grid, 8, 2, colors.gold);
  } else if (tier === 'ancient') {
    paintBlock(grid, 6, 0, 4, 1, colors.gold);
    paint(grid, 7, 0, colors.gold);
    paint(grid, 8, 0, colors.gold);
    paint(grid, 7, 1, O);
  }

  // ── Yanak ──
  if (tier !== 'baby' || opts.mood === 'happy') {
    paint(grid, 5, 11, colors.peach);
    paint(grid, 10, 11, colors.peach);
  }

  // ── Ağız ──
  paint(grid, 7, 12, O);
  paint(grid, 8, 12, O);

  // ── Gözler ──
  const eyeY = tier === 'baby' ? 8 : 9;
  const { eyeStyle, eyeFill } = opts;

  if (eyeStyle === 'sleepy') {
    paint(grid, 5, eyeY + 1, O);
    paint(grid, 6, eyeY + 1, O);
    paint(grid, 9, eyeY + 1, O);
    paint(grid, 10, eyeY + 1, O);
  } else if (eyeStyle === 'wide' || tier === 'baby') {
    paintBlock(grid, 5, eyeY, 2, 2, O);
    paintBlock(grid, 9, eyeY, 2, 2, O);
    paint(grid, 5, eyeY, eyeFill);
    paint(grid, 6, eyeY, eyeFill);
    paint(grid, 9, eyeY, eyeFill);
    paint(grid, 10, eyeY, eyeFill);
    paint(grid, 6, eyeY, colors.cream);
    paint(grid, 10, eyeY, colors.cream);
    if (tier === 'baby') {
      paint(grid, 5, eyeY + 1, eyeFill);
      paint(grid, 9, eyeY + 1, eyeFill);
    }
  } else {
    paintBlock(grid, 5, eyeY, 2, 2, O);
    paintBlock(grid, 9, eyeY, 2, 2, O);
    paint(grid, 5, eyeY + 1, eyeFill);
    paint(grid, 6, eyeY + 1, eyeFill);
    paint(grid, 9, eyeY + 1, eyeFill);
    paint(grid, 10, eyeY + 1, eyeFill);
    paint(grid, 6, eyeY + 1, colors.cream);
    paint(grid, 10, eyeY + 1, colors.cream);
  }

  return grid;
}

export const MOCHI_GRID_SIZE = GRID;
