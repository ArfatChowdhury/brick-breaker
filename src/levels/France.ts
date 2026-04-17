import { LevelConfig } from './types';

export const France: LevelConfig = {
  flagColors: ['#0055A4', '#FFFFFF', '#EF4135'],
  flagOrientation: 'v',
  name: 'France Tri-Colore Elite',
  id: 'FR_ELITE_V1',
  backgroundColor: '#FFFFFF',
  initialBallSpeed: 9.5,
  paddleSizeMultiplier: 0.8,
  gridRows: 24,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. FRANCE FORTRESS MASK
    const FR_MASK = [
      "SSSSS..........SSSSS", // 0: WIDE ENTRY (10 tiles)
      "SS................SS", // 1
      "SS.SSSSSSSSSSSSSS.SS", // 2: OUTER RING
      "SS.S............S.SS", // 3
      "SS.S.BBBBBWWWWWRR.S.SS", // 4: START OF FLAG
      "SS.S.BBBBBWWWWWRR.S.SS",
      "SS.S.BBBBBWWWWWRR.S.SS",
      "SS.S.BBBBBWWWWWRR.S.SS",
      "SS.S.BBBBBWWWWWRR.S.SS",
      "SS.S.BBBBBWWWWWRR.S.SS",
      "SS.S.BBBBBWWWWWRR.S.SS",
      "SS.S.BBBBBWWWWWRR.S.SS",
      "SS.S.BBBBBWWWWWRR.S.SS",
      "SS.S.BBBBBWWWWWRR.S.SS",
      "SS.S.BBBBBWWWWWRR.S.SS",
      "SS.S.BBBBBWWWWWRR.S.SS",
      "SS.S.BBBBBWWWWWRR.S.SS",
      "SS.S.BBBBBWWWWWRR.S.SS",
      "SS.S.BBBBBWWWWWRR.S.SS",
      "SS.S............S.SS", // 19
      "SS.SSSSSSSSSSSSSS.SS", // 20: LOWER RING
      "SS................SS", // 21
      "SS....SSSSSSSS....SS", // 22: ARCH BASE
      "SSSSSSSSSSSSSSSSSSSS", // 23: SEALED BOTTOM
    ];

    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = FR_MASK[r]?.[mappedC] || 'S';

    // 2. STONE WALL LOGIC
    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';
    if (maskChar === '.') return 'NONE'; 

    // 3. FLAG COLORS
    if (r >= 4 && r <= 18) {
      const colPercent = (c / gridCols);
      if (colPercent < 0.33) return 'BLUE';
      if (colPercent < 0.66) return 'WHITE';
      return 'RED';
    }

    return 'background';
  },
};
