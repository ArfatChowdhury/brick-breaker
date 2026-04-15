import { LevelConfig } from './types';

export const Colombia: LevelConfig = {
  name: 'Colombia Andean Ridge',
  id: 'CO_ELITE_V1',
  backgroundColor: '#FCD116', // Yellow primarily
  initialBallSpeed: 9.6,
  paddleSizeMultiplier: 0.8,
  gridRows: 24,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. COLOMBIA FORTRESS MASK (Andean Ridge)
    // Step-down uneven ridges on the inner walls.
    const CO_MASK = [
      "SSSSSSSS....SSSSSSSS", // 0: TOP ENTRY
      "S..................S", // 1
      "S.SSSSSSSSSSSSSSSS.S", // 2
      "S.S..............S.S", // 3: Wide start
      "S.SFFFFFFFFFFFFFFS.S", // 4: START OF FLAG
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "SS.SFFFFFFFFFFFFS.SS", // 9: Outer step
      "SS.SFFFFFFFFFFFFS.SS",
      "SS.SFFFFFFFFFFFFS.SS",
      "SSS.SFFFFFFFFFFS.SSS", // 12: Second step
      "SSS.SFFFFFFFFFFS.SSS",
      "SS.SFFFFFFFFFFFFS.SS", // 14: Step out
      "S.SFFFFFFFFFFFFFFS.S", // 15
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.S..............S.S", // 19
      "S.SSSSSSSSSSSSSSSS.S", // 20
      "SS................SS", // 21
      "SSSSSS........SSSSSS", // 22: HEAVY GUARD
      "SSSSSSSSSSSSSSSSSSSS", // 23: SEALED BOTTOM
    ];

    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = CO_MASK[r]?.[mappedC] || 'S';

    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';
    if (maskChar === '.') return 'NONE'; 

    // 3. FLAG COLORS (Unequal 2:1:1 stripes)
    // Runs from row 4 to 18 (15 total rows). 
    // 50% yellow (7.5 rows), 25% blue (3.75 rows), 25% red (3.75 rows)
    if (r >= 4 && r <= 18) {
      if (r <= 11) return '#FCD116'; // Colombian Yellow (approx Top 8 rows)
      if (r <= 15) return '#003893'; // Colombian Blue (Middle 4 rows)
      return '#CE1126'; // Colombian Red (Bottom 3 rows)
    }

    return 'background';
  },
};
