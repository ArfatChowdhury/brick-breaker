import { LevelConfig } from './types';

export const Canada: LevelConfig = {
  name: 'Canada Maple Fortress',
  id: 'CA_ELITE_V1',
  backgroundColor: '#FFFFFF',
  initialBallSpeed: 9.7,
  paddleSizeMultiplier: 0.75,
  gridRows: 24,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. CANADA FORTRESS MASK
    const CA_MASK = [
      "SSSSSSSS....SSSSSSSS", // 0: TOP ENTRY
      "SS................SS", // 1
      "S.SSSSSSSSSSSSSSSS.S", // 2: OUTER RING
      "SS...S........S...SS", // 3: JAGGED ENTRY
      "S.S.RRRRWWWWWWWRRR.S.S", // 4: START OF FLAG
      "SS.S.RRRRWWWWWWWRRR.S.SS",
      "S..S.RRRRWWWWWWWRRR.S..S",
      "SS.S.RRRRWWWWWWWRRR.S.SS",
      "S.S..RRRRWWWWWWWRRR..S.S",
      "SS.S.RRRRWWWWWWWRRR.S.SS",
      "S..S.RRRRWWWWWWWRRR.S..S",
      "SS.S.RRRRWWWWWWWRRR.S.SS",
      "S.S..RRRRWWWWWWWRRR..S.S",
      "SS.S.RRRRWWWWWWWRRR.S.SS",
      "S..S.RRRRWWWWWWWRRR.S..S",
      "SS.S.RRRRWWWWWWWRRR.S.SS",
      "S.S..RRRRWWWWWWWRRR..S.S",
      "SS.S.RRRRWWWWWWWRRR.S.SS",
      "S..S.RRRRWWWWWWWRRR.S..S",
      "SS...S........S...SS", // 19
      "S.SSSSSSSSSSSSSSSS.S", // 20: LOWER RING
      "SS................SS", // 21
      "S..S...S....S...S..S", // 22: RUGGED GUARD
      "SSSSSSSSSSSSSSSSSSSS", // 23: SEALED BOTTOM
    ];

    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = CA_MASK[r]?.[mappedC] || 'S';

    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';
    if (maskChar === '.') return 'NONE'; 

    // 3. FLAG COLORS (Red-White-Red, 1:2:1)
    if (r >= 4 && r <= 18) {
      const colPercent = (c / gridCols);
      if (colPercent < 0.25 || colPercent > 0.75) return 'RED';

      // WHITE CENTER WITH MAPLE LEAF
      const cx = gridCols / 2;
      const cy = 11.5;
      const sx = Math.abs(c - cx);
      const sy = r - cy; // Vertical is signed

      // Stem
      if (sx < 0.8 && sy > 0 && sy < 4) return 'RED';

      // Main Leaf Body (Triangular Lobes)
      // Central Lobe
      if (sx < 2 && sy < 0 && sy > -6) return 'RED';
      if (sx < 4 && sy < -2 && sy > -5) return 'RED';
      
      // Side Lobes
      const isSideLobe = (Math.abs(sy + 1) < 2 && sx < 6) || (Math.abs(sy - 1) < 2 && sx < 4);
      if (isSideLobe) return 'RED';

      return 'WHITE';
    }

    return 'background';
  },
};
