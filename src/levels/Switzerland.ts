import { LevelConfig } from './types';

export const Switzerland: LevelConfig = {
  flagColors: ['#FF0000', '#FFFFFF'],
  flagOrientation: 'h',
  isoCode: 'ch',
  name: 'Switzerland Alpine Bunker',
  id: 'CH_ELITE_V1',
  backgroundColor: '#FF0000',
  initialBallSpeed: 9.7,
  paddleSizeMultiplier: 0.8,
  gridRows: 24,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. SWITZERLAND FORTRESS MASK (Alpine Bunker)
    // Symmetrical, dense square bunker opening.
    const CH_MASK = [
      "SSSSS..........SSSSS", // 0: TOP ENTRY
      "SSSSSS........SSSSSS", // 1
      "SSSSSSS......SSSSSSS", // 2
      "SSSSSSSS....SSSSSSSS", // 3
      "SSSS............SSSS", // 4: WIDENS
      "SSSS............SSSS", // 5
      "SSSSFFFFFFFFFFFFSSSS", // 6: START OF SQUARED FLAG
      "SSSSFFFFFFFFFFFFSSSS",
      "SSSSFFFFFFFFFFFFSSSS",
      "SSSSFFFFFFFFFFFFSSSS",
      "SSSSFFFFFFFFFFFFSSSS",
      "SSSSFFFFFFFFFFFFSSSS",
      "SSSSFFFFFFFFFFFFSSSS",
      "SSSSFFFFFFFFFFFFSSSS",
      "SSSSFFFFFFFFFFFFSSSS",
      "SSSSFFFFFFFFFFFFSSSS", // 15: END OF SQUARED FLAG
      "SSSS............SSSS", // 16
      "SSSS............SSSS", // 17
      "SSSS............SSSS", // 18
      "SSSS............SSSS", // 19
      "SSSSSSS......SSSSSSS", // 20: LOWER BUNKER
      "SSSSSSS......SSSSSSS", // 21
      "SSSSSSS......SSSSSSS", // 22: HEAVY GUARD
      "SSSSSSSSSSSSSSSSSSSS", // 23: SEALED BOTTOM
    ];

    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = CH_MASK[r]?.[mappedC] || 'S';

    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';
    if (maskChar === '.') return 'NONE'; 

    // 3. FLAG COLORS (Red square with symmetrical white cross)
    if (r >= 6 && r <= 15) {
      const colPercent = c / gridCols;
      const rowLocal = r - 6; // 0 to 9
      
      // Horizontal thick cross bar (rows 3 to 6 approx)
      const isHorizontal = rowLocal >= 3 && rowLocal <= 6 && colPercent >= 0.25 && colPercent <= 0.75;
      
      // Vertical thick cross bar
      const isVertical = rowLocal >= 1 && rowLocal <= 8 && colPercent >= 0.40 && colPercent <= 0.60;
      
      if (isHorizontal || isVertical) return 'WHITE';
      return '#FF0000'; // Swiss Red
    }

    return 'background';
  },
};
