import { LevelConfig } from './types';

export const Sweden: LevelConfig = {
  flagColors: ['#006AA7', '#FECC02'],
  flagOrientation: 'h',
  isoCode: 'se',
  name: 'Sweden Nordic Keep',
  id: 'SE_ELITE_V1',
  backgroundColor: '#005293',
  initialBallSpeed: 9.5,
  paddleSizeMultiplier: 0.85,
  gridRows: 24,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. SWEDEN FORTRESS MASK (Nordic Keep)
    // Symmetrical blocky corners.
    const SE_MASK = [
      "SSSSS..........SSSSS", // 0: TOP ENTRY
      "SSSS............SSSS", // 1
      "SSS..............SSS", // 2
      "SS................SS", // 3
      "SS.BBBBBBBBBBBBBB.SS", // 4: START OF FLAG (Blue/Yellow)
      "SS.BBBBBBBBBBBBBB.SS",
      "SS.BBBBBBBBBBBBBB.SS",
      "SS.BBBBBBBBBBBBBB.SS",
      "SS.BBBBBBBBBBBBBB.SS",
      "SS.BBBBBBBBBBBBBB.SS", // 9
      "SS.BBBBBBBBBBBBBB.SS",
      "SS.BBBBBBBBBBBBBB.SS",
      "SS.BBBBBBBBBBBBBB.SS",
      "SS.BBBBBBBBBBBBBB.SS",
      "SS.BBBBBBBBBBBBBB.SS", // 14
      "SS.BBBBBBBBBBBBBB.SS",
      "SS.BBBBBBBBBBBBBB.SS",
      "SS.BBBBBBBBBBBBBB.SS",
      "SS.BBBBBBBBBBBBBB.SS",
      "SS................SS", // 19
      "SSS..............SSS", // 20
      "SSSS............SSSS", // 21
      "SSSSS...SSSS...SSSSS", // 22: HEAVY GUARD
      "SSSSSSSSSSSSSSSSSSSS", // 23: SEALED BOTTOM
    ];

    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = SE_MASK[r]?.[mappedC] || 'S';

    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';
    if (maskChar === '.') return 'NONE'; 

    // 3. FLAG COLORS (Blue & Yellow Cross)
    if (r >= 4 && r <= 18) {
      const colPercent = c / gridCols;
      
      // Vertical bar of the Nordic cross (Shifted left to ~30-40%)
      const isVertical = colPercent > 0.30 && colPercent < 0.45;
      
      // Horizontal bar of the Nordic cross (Centered vertically in the flag area)
      const isHorizontal = r >= 10 && r <= 12;

      if (isVertical || isHorizontal) return '#FECC00'; // Swedish Yellow
      return '#005293'; // Swedish Blue
    }

    return 'background';
  },
};
