import { LevelConfig } from './types';

export const Egypt: LevelConfig = {
  flagColors: ['#CE1126', '#FFFFFF', '#000000'],
  flagOrientation: 'h',
  name: 'Egypt Pyramid Core',
  id: 'EG_ELITE_V1',
  backgroundColor: '#FFFFFF',
  initialBallSpeed: 9.6,
  paddleSizeMultiplier: 0.8,
  gridRows: 24,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. EGYPT FORTRESS MASK (Pyramid Base)
    // Pyramid cut-out at the top, widening out to the base.
    const EG_MASK = [
      "SSSSSS........SSSSSS", // 0: PYRAMID APEX (Wide to allow ball entry)
      "SSSSS..........SSSSS", // 1
      "SSSS............SSSS", // 2
      "SSS..............SSS", // 3
      "SSS.RRRRRRRRRRRR.SSS", // 4: START OF FLAG (Red)
      "SS..RRRRRRRRRRRR..SS",
      "SS..RRRRRRRRRRRR..SS",
      "SS..RRRRRRRRRRRR..SS",
      "S...RRRRRRRRRRRR...S",
      "S...WWWWWWWWWWWW...S", // 9: START OF WHITE
      "S...WWWWWWWWWWWW...S",
      "S...WWWWWWWWWWWW...S",
      "....WWWWWWWWWWWW....",
      "....WWWWWWWWWWWW....",
      "....BBBBBBBBBBBB....", // 14: START OF BLACK
      "....BBBBBBBBBBBB....",
      "....BBBBBBBBBBBB....",
      "S...BBBBBBBBBBBB...S",
      "S...BBBBBBBBBBBB...S",
      "SS................SS", // 19
      "SS.SSSSSSSSSSSSSS.SS", // 20: INNER SANCTUM BARRIER
      "SSS..............SSS", // 21
      "SSSS...SSSSSSSS...SSSS", // 22: HEAVY TOMB DOOR
      "SSSSSSSSSSSSSSSSSSSS", // 23: SEALED BOTTOM
    ];

    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = EG_MASK[r]?.[mappedC] || 'S';

    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';
    if (maskChar === '.') return 'NONE'; 

    // 3. FLAG COLORS (Red, White, Black)
    if (r >= 4 && r <= 18) {
      if (r <= 8) return '#CE1126'; // Egyptian Red
      if (r >= 14) return '#000000'; // Black
      
      // WHITE BAND WITH GOLDEN EAGLE OF SALADIN
      const cx = gridCols / 2;
      const cy = 11.0;
      const dx = Math.abs(c - cx);
      const dy = Math.abs(r - cy);
      
      // Abstract Eagle Shape
      if (dy <= 2.5 && dx <= 2.5) {
          // Inner Shield Details
          if (dy < 1 && dx < 0.5) return '#C09300';
          return '#D4AF37'; // Shiny Gold
      }

      return 'WHITE';
    }

    return 'background';
  },
};
