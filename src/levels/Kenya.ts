import { LevelConfig } from './types';

export const Kenya: LevelConfig = {
  flagColors: ['#000000', '#BB0000', '#006600'],
  flagOrientation: 'h',
  name: 'Kenya Savannah Core',
  id: 'KE_ELITE_V1',
  backgroundColor: '#FFFFFF',
  initialBallSpeed: 9.6,
  paddleSizeMultiplier: 0.8,
  gridRows: 24,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. KENYA FORTRESS MASK (Savannah Core)
    // Curving thick sides yielding heavy side-impact resistance.
    const KE_MASK = [
      "SSSSSSSS....SSSSSSSS", // 0: TOP ENTRY
      "SSSSSS........SSSSSS", // 1
      "SSSS............SSSS", // 2
      "SSS..............SSS", // 3
      "SS.SFFFFFFFFFFFFS.SS", // 4: START OF FLAG (Black)
      "SS.SFFFFFFFFFFFFS.SS",
      "S..SFFFFFFFFFFFFS..S",
      "S..SFFFFFFFFFFFFS..S",
      "S..SFFFFFFFFFFFFS..S", // 8: (White/Red boundary)
      "S.SFFFFFFFFFFFFFFS.S", // 9: Widen for shield
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S", // 11
      "S.SFFFFFFFFFFFFFFS.S", // 12
      "S.SFFFFFFFFFFFFFFS.S", // 13
      "S.SFFFFFFFFFFFFFFS.S", // 14
      "S..SFFFFFFFFFFFFS..S", // 15: (Red/White boundary)
      "S..SFFFFFFFFFFFFS..S",
      "S..SFFFFFFFFFFFFS..S", // 17
      "SS.SFFFFFFFFFFFFS.SS", // 18: (Green)
      "SS.S............S.SS", // 19
      "SSS..............SSS", // 20
      "SSSS............SSSS", // 21
      "SSSSSS........SSSSSS", // 22: HEAVY GUARD
      "SSSSSSSSSSSSSSSSSSSS", // 23: SEALED BOTTOM
    ];

    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = KE_MASK[r]?.[mappedC] || 'S';

    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';
    if (maskChar === '.') return 'NONE'; 

    // 3. FLAG COLORS (Black, White, Red, White, Green)
    if (r >= 4 && r <= 18) {
      const colPercent = (c / gridCols);
      
      // MAASAI SHIELD & SPEARS (Center)
      const cx = 0.50;
      const cy = 11.0;
      const rowLocal = r - cy; // Relative to shield center (-7 to +7)
      const dx = (colPercent - cx) * gridCols;
      const dy = rowLocal;

      // Shield Ellipse bounds: taller than it is wide
      const shieldDist = Math.pow(dx * 1.5, 2) + Math.pow(dy / 1.5, 2);
      
      if (shieldDist < 5.0) {
          // Inside the shield
          // Center vertical white band
          if (Math.abs(dx) < 0.5) return 'WHITE';
          // Two white side ovals
          if (Math.abs(dy) < 1.0 && Math.abs(dx) > 1.2) return 'WHITE';
          return '#BB0000'; // Kenyan Red (Shield base)
      }

      // Crossed Spears (behind the shield)
      if (Math.abs(Math.abs(dx) - Math.abs(dy)) < 0.5 && Math.abs(dy) < 5.0) {
          return 'WHITE'; // White spear shafts
      }

      // BACKGROUND STRIPES
      // Black (4-7), White (8), Red (9-13), White (14), Green (15-18)
      if (r <= 7) return '#000000'; // Black
      if (r === 8) return 'WHITE';
      if (r <= 13) return '#BB0000'; // Kenyan Red
      if (r === 14) return 'WHITE';
      return '#006600'; // Kenyan Green
    }

    return 'background';
  },
};
