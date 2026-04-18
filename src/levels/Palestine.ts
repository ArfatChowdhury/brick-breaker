import { LevelConfig } from './types';

export const Palestine: LevelConfig = {
  flagColors: ['#000000', '#FFFFFF', '#007A3D'],
  flagOrientation: 'h',
  isoCode: 'ps',
  name: 'Palestine Stronghold Elite',
  id: 'PS_ELITE_V1',
  backgroundColor: '#FFFFFF',
  initialBallSpeed: 9.0,
  paddleSizeMultiplier: 0.85,
  gridRows: 24,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. PALESTINE FORTRESS MASK (24 Rows x 20 Cols mapped)
    // S = STONE3, . = NONE (Gap), B/W/G = TRICOLOR, R = RED TRIANGLE
    const PS_MASK = [
      "SSSSSSSS....SSSSSSSS", // 0: TOP ENTRY
      "S..................S", // 1
      "S.SSSSSSSSSSSSSSSS.S", // 2: OUTER RING
      "S.S..............S.S", // 3
      "S.S.RRRRTTBBBBBBB.S.S", // 4: FLAG START (Top: Black)
      "S.S.RRRRRTBBBBBBB.S.S", // 5
      "S.S.RRRRRRTBBBBBB.S.S", // 6
      "S.S.RRRRRRRTBBBBB.S.S", // 7
      "S.S.RRRRRRRRWWWWW.S.S", // 8: CENTER (White)
      "S.S.RRRRRRRRRWWWW.S.S", // 9
      "S.S.RRRRRRRRRRWWW.S.S", // 10
      "S.S.RRRRRRRRRRRWW.S.S", // 11
      "S.S.RRRRRRRRRRRRG.S.S", // 12: BOTTOM (Green)
      "S.S.RRRRRRRRRRRG..S.S", // 13
      "S.S.RRRRRRRRRRG...S.S", // 14
      "S.S.RRRRRRRRG.....S.S", // 15
      "S.S.RRRRRRTG......S.S", // 16
      "S.S.RRRRRTG.......S.S", // 17
      "S.S.RRRRTG........S.S", // 18
      "S.S...............S.S", // 19
      "S.SSSSSSSS..SSSSSS.S", // 20: LOWER RING
      "S..................S", // 21
      "S........SS........S", // 22: BOTTOM GUARD
      "SSSSSSSSSSSSSSSSSSSS", // 23: SEALED BOTTOM
    ];

    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = PS_MASK[r]?.[mappedC] || 'S';

    // 2. STONE WALL LOGIC
    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';
    if (maskChar === '.') return 'NONE'; 

    // 3. FLAG COLORS (Rows 4-18)
    if (r >= 4 && r <= 18) {
      // The triangle logic is slightly complex to do in a mask, 
      // let's use the X coordinate for the red part.
      const triangleEdge = (gridCols * 0.4) * (1 - Math.abs(r - 11) / 7.5);
      if (c < triangleEdge) return 'RED';

      // Tricolor Stripes: Black (top), White (mid), Green (bottom)
      if (r < 9) return 'BLACK';
      if (r < 14) return 'WHITE';
      return 'GREEN';
    }

    return 'background';
  },
};
