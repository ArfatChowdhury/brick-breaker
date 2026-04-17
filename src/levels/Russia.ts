import { LevelConfig } from './types';

export const Russia: LevelConfig = {
  flagColors: ['#FFFFFF', '#0032A0', '#DA291C'],
  flagOrientation: 'h',
  name: 'Russia Siberian Bastion',
  id: 'RU_ELITE_V1',
  backgroundColor: '#FFFFFF',
  initialBallSpeed: 9.7,
  paddleSizeMultiplier: 0.8,
  gridRows: 24,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. RUSSIA FORTRESS MASK (Siberian Bastion)
    const RU_MASK = [
      "SSSSS..........SSSSS", // 0: TOP ENTRY
      "SSSS............SSSS", // 1
      "SSS.SSSSSSSSSSSS.SSS", // 2: OUTER TOWER
      "SS.S............S.SS", // 3
      "SS.S.WWWWWWWWWW.S.SS", // 4: START OF FLAG (White)
      "SS.S.WWWWWWWWWW.S.SS",
      "SS.S.WWWWWWWWWW.S.SS",
      "SS.S.WWWWWWWWWW.S.SS",
      "SS.S.WWWWWWWWWW.S.SS",
      "SS.S.BBBBBBBBBB.S.SS", // 9: START OF BLUE
      "SS.S.BBBBBBBBBB.S.SS",
      "SS.S.BBBBBBBBBB.S.SS",
      "SS.S.BBBBBBBBBB.S.SS",
      "SS.S.BBBBBBBBBB.S.SS",
      "SS.S.RRRRRRRRRR.S.SS", // 14: START OF RED
      "SS.S.RRRRRRRRRR.S.SS",
      "SS.S.RRRRRRRRRR.S.SS",
      "SS.S.RRRRRRRRRR.S.SS",
      "SS.S.RRRRRRRRRR.S.SS",
      "SS.S............S.SS", // 19
      "SSS.SSSSSSSSSSSS.SSS", // 20: LOWER TOWER
      "SSSS............SSSS", // 21
      "SSSSS...SSSS...SSSSS", // 22: HEAVY GUARD
      "SSSSSSSSSSSSSSSSSSSS", // 23: SEALED BOTTOM
    ];

    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = RU_MASK[r]?.[mappedC] || 'S';

    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';
    if (maskChar === '.') return 'NONE'; 

    // 3. FLAG COLORS (White, Blue, Red)
    if (r >= 4 && r <= 18) {
      if (r <= 8) return 'WHITE';
      if (r <= 13) return '#0033A0'; // Russian Blue
      return '#DA291C'; // Russian Red
    }

    return 'background';
  },
};
