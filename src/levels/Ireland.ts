import { LevelConfig } from './types';

export const Ireland: LevelConfig = {
  name: 'Ireland Celtic Pillars',
  id: 'IE_ELITE_V1',
  backgroundColor: '#FFFFFF',
  initialBallSpeed: 9.6,
  paddleSizeMultiplier: 0.8,
  gridRows: 24,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. IRELAND FORTRESS MASK (Celtic Pillars)
    // Vertical columns reaching deep into the map to complement the vertical stripes.
    const IE_MASK = [
      "SSSSS..........SSSSS", // 0: TOP ENTRY
      "SS.SS..........SS.SS", // 1
      "SS.SS..........SS.SS", // 2: PILLARS
      "SS.SS..........SS.SS", // 3
      "SS.SSFFFFFFFFFFSS.SS", // 4: START OF FLAG
      "SS.SSFFFFFFFFFFSS.SS",
      "SS.SSFFFFFFFFFFSS.SS",
      "SS.SSFFFFFFFFFFSS.SS",
      "S...SFFFFFFFFFFS...S", // 8: Pillar break
      "S...SFFFFFFFFFFS...S",
      "SS.SSFFFFFFFFFFSS.SS", // 10: Pillar resume
      "SS.SSFFFFFFFFFFSS.SS",
      "SS.SSFFFFFFFFFFSS.SS",
      "SS.SSFFFFFFFFFFSS.SS",
      "S...SFFFFFFFFFFS...S", // 14: Pillar break
      "S...SFFFFFFFFFFS...S",
      "SS.SSFFFFFFFFFFSS.SS", // 16: Pillar resume
      "SS.SSFFFFFFFFFFSS.SS",
      "SS.SSFFFFFFFFFFSS.SS",
      "SS.SS..........SS.SS", // 19
      "SS.SS..........SS.SS", // 20
      "SS.SS..........SS.SS", // 21
      "SSSSS...SSSS...SSSSS", // 22: HEAVY GUARD
      "SSSSSSSSSSSSSSSSSSSS", // 23: SEALED BOTTOM
    ];

    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = IE_MASK[r]?.[mappedC] || 'S';

    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';
    if (maskChar === '.') return 'NONE'; 

    // 3. FLAG COLORS (Green, White, Orange vertical stripes)
    if (r >= 4 && r <= 18) {
      const colPercent = (c / gridCols);
      
      if (colPercent < 0.33) return '#169B62'; // Irish Green
      if (colPercent > 0.66) return '#FF883E'; // Irish Orange
      return 'WHITE';
    }

    return 'background';
  },
};
