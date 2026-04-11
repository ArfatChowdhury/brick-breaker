import { LevelConfig } from './types';

// Bangladesh: Dense 26x22 pixel-art — "BD" stone gate, full flag below
export const Bangladesh: LevelConfig = {
  name: 'Bangladesh',
  id: 'BD',
  backgroundColor: '#006A4E',
  circleColor: '#F42A41',
  initialBallSpeed: 9,
  paddleSizeMultiplier: 0.75,
  gridCols: 26,
  gridRows: 22,
  pattern: (r, c, rows, cols) => {
    // ── ROW 1: Solid STONE3 wall, one gap at col 13 (centre-right) ──
    if (r === 1) {
      return c === 13 ? 'background' : 'STONE3';
    }

    // ── ROWS 2-9: Pixel-art "BD" in STONE3, everything else is green ──
    if (r >= 2 && r <= 9) {
      // ─── Letter "B" — cols 2–7 ───
      const isB = (
        // Left spine (full height)
        (c === 2 && r >= 2 && r <= 8) ||
        // Top bar
        (r === 2 && c >= 2 && c <= 6) ||
        // Upper-right bumps
        (r === 3 && c === 7) ||
        (r === 4 && c === 7) ||
        // Mid bar
        (r === 5 && c >= 2 && c <= 6) ||
        // Lower-right bumps
        (r === 6 && c === 7) ||
        (r === 7 && c === 7) ||
        // Bottom bar (wider — B has a larger lower lobe)
        (r === 8 && c >= 2 && c <= 7)
      );
      if (isB) return 'STONE3';

      // ─── Letter "D" — cols 11–18 ───
      const isD = (
        // Left spine (full height)
        (c === 11 && r >= 2 && r <= 8) ||
        // Top bar
        (r === 2 && c >= 11 && c <= 15) ||
        // Upper-right curve
        (r === 3 && c === 16) ||
        (r === 4 && c === 17) ||
        // Right wall
        (r === 5 && c === 18) ||
        // Lower-right curve
        (r === 6 && c === 17) ||
        (r === 7 && c === 16) ||
        // Bottom bar
        (r === 8 && c >= 11 && c <= 15)
      );
      if (isD) return 'STONE3';
    }

    // ── ROWS 9-20: Bangladesh flag — big red circle on green ──
    if (r >= 9) {
      // Large circle: centre at row 14.5, col 12.5, radius 5.2
      const distToCenter = Math.sqrt(
        Math.pow(r - 14.5, 2) + Math.pow(c - 12.5, 2)
      );
      if (distToCenter < 5.2) return 'circle'; // Red #F42A41
    }

    // Everything else = breakable green brick (no NONE — grid is fully dense)
    return 'background';
  },
};
