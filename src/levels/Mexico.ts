import { LevelConfig } from './types';

export const Mexico: LevelConfig = {
  flagColors: ['#006847', '#FFFFFF', '#CE1126'],
  flagOrientation: 'v',
  isoCode: 'mx',
  name: 'Mexico Tenochtitlan Bastion',
  id: 'MX_ELITE_V1',
  backgroundColor: '#FFFFFF',
  initialBallSpeed: 9.6,
  paddleSizeMultiplier: 0.8,
  gridRows: 24,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. MEXICO FORTRESS MASK (Step-Pyramid Architecture)
    const MX_MASK = [
      "SSSSSSSS....SSSSSSSS", // 0: TOP ENTRY
      "S..................S", // 1
      "SS.SSSSSSSSSSSSSS.SS", // 2: STEP 1 (Outer)
      "SSS.S..........S.SSS", // 3: STEP 2 (Inner)
      "SS.SFFFFFFFFFFFFS.SS", // 4: START OF FLAG
      "SS.SFFFFFFFFFFFFS.SS",
      "SS.SFFFFFFFFFFFFS.SS",
      "SS.SFFFFFFFFFFFFS.SS",
      "SS.SFFFFFFFFFFFFS.SS",
      "SS.SFFFFFFFFFFFFS.SS", // 9: CREST ZONE
      "SS.SFFFFFFFFFFFFS.SS",
      "SS.SFFFFFFFFFFFFS.SS",
      "SS.SFFFFFFFFFFFFS.SS",
      "SS.SFFFFFFFFFFFFS.SS",
      "SS.SFFFFFFFFFFFFS.SS", // 14: CREST ZONE END
      "SS.SFFFFFFFFFFFFS.SS",
      "SS.SFFFFFFFFFFFFS.SS",
      "SS.SFFFFFFFFFFFFS.SS",
      "SS.SFFFFFFFFFFFFS.SS",
      "SS.S............S.SS", // 19
      "SS.SSSSSSSSSSSSSS.SS", // 20: OUTER STEP
      "S..................S", // 21
      "S...SSSS....SSSS...S", // 22: TEMPLE ENTRANCE
      "SSSSSSSSSSSSSSSSSSSS", // 23: SEALED BOTTOM
    ];

    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = MX_MASK[r]?.[mappedC] || 'S';

    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';
    if (maskChar === '.') return 'NONE'; 

    // 3. FLAG COLORS (Green, White, Red)
    if (r >= 4 && r <= 18) {
      const colPercent = (c / gridCols);
      
      if (colPercent < 0.33) return '#006847'; // Mexican Green
      if (colPercent > 0.66) return '#CE1126'; // Mexican Red
      
      // WHITE BAND WITH EAGLE CREST
      const cx = gridCols / 2;
      const cy = 11.5;
      const dx = Math.abs(c - cx);
      const dy = Math.abs(r - cy);
      
      // Eagle/Snake/Cactus simplified logic
      if (r >= 10 && r <= 13 && dx < gridCols * 0.08) {
          if (r === 13) return '#663300'; // Cactus base (Brown)
          if (r < 13) return '#5D4037';  // Eagle body
      }
      
      return 'WHITE';
    }

    return 'background';
  },
};
