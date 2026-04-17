import { LevelConfig } from './types';

export const Italy: LevelConfig = {
  flagColors: ['#009246', '#FFFFFF', '#CE2B37'],
  flagOrientation: 'v',
  name: 'Italy Il Tricolore Elite',
  id: 'IT_ELITE_V1',
  backgroundColor: '#FFFFFF',
  initialBallSpeed: 9.4,
  paddleSizeMultiplier: 0.85,
  gridRows: 24,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. ITALY FORTRESS MASK
    const IT_MASK = [
      "SSSSSSSS....SSSSSSSS", // 0: TOP ENTRY
      "S..................S", // 1
      "S.SSSSSSSSSSSSSSSS.S", // 2: OUTER RING
      "S.S..............S.S", // 3
      "S.SS.GGGGWWWWWRR.SS.S", // 4: FLAG START (with side ribs)
      "S.S..GGGGWWWWWRR..S.S",
      "S.SS.GGGGWWWWWRR.SS.S",
      "S.S..GGGGWWWWWRR..S.S",
      "S.SS.GGGGWWWWWRR.SS.S",
      "S.S..GGGGWWWWWRR..S.S",
      "S.SS.GGGGWWWWWRR.SS.S",
      "S.S..GGGGWWWWWRR..S.S",
      "S.SS.GGGGWWWWWRR.SS.S",
      "S.S..GGGGWWWWWRR..S.S",
      "S.SS.GGGGWWWWWRR.SS.S",
      "S.S..GGGGWWWWWRR..S.S",
      "S.SS.GGGGWWWWWRR.SS.S",
      "S.S..GGGGWWWWWRR..S.S",
      "S.SS.GGGGWWWWWRR.SS.S",
      "S.S..............S.S", // 19
      "S.SSSSSSSSSSSSSSSS.S", // 20: LOWER RING
      "S..................S", // 21
      "S.......S..S.......S", // 22: PINBALL POSTS
      "SSSSSSSSSSSSSSSSSSSS", // 23: SEALED BOTTOM
    ];

    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = IT_MASK[r]?.[mappedC] || 'S';

    // 2. STONE WALL LOGIC
    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';
    if (maskChar === '.') return 'NONE'; 

    // 3. FLAG COLORS
    if (r >= 4 && r <= 18) {
      const colPercent = (c / gridCols);
      if (colPercent < 0.33) return 'GREEN';
      if (colPercent < 0.66) return 'WHITE';
      return 'RED';
    }

    return 'background';
  },
};
