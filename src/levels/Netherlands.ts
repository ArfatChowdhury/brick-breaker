import { LevelConfig } from './types';

export const Netherlands: LevelConfig = {
  flagColors: ['#AE1C28', '#FFFFFF', '#21468B'],
  flagOrientation: 'h',
  isoCode: 'nl',
  name: 'Netherlands Windmill Core',
  id: 'NL_ELITE_V1',
  backgroundColor: '#FFFFFF',
  initialBallSpeed: 9.6,
  paddleSizeMultiplier: 0.8,
  gridRows: 24,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. NETHERLANDS FORTRESS MASK (Windmill Core)
    // Protrusions that look like 4 windmill blades cutting in
    const NL_MASK = [
      "SSSSSSSS....SSSSSSSS", // 0: TOP ENTRY
      "S..................S", // 1
      "S.SSSSSSSSSSSSSSSS.S", // 2
      "S.S..............S.S", // 3
      "S.SFFFFFFFFFFFFFFS.S", // 4: START OF FLAG (Red)
      "S.SFFFFFFFFFFFFFFS.S", // 5
      "SSSSSSFFFFFFFFSSSSSS", // 6: BLADE 1 & 2
      "SSSSSSFFFFFFFFSSSSSS", // 7
      "S.SFFFFFFFFFFFFFFS.S", // 8
      "S.SFFFFFFFFFFFFFFS.S", // 9: (White)
      "S.SFFFFFFFFFFFFFFS.S", // 10
      "S.SFFFFFFFFFFFFFFS.S", // 11
      "S.SFFFFFFFFFFFFFFS.S", // 12
      "S.SFFFFFFFFFFFFFFS.S", // 13
      "S.SFFFFFFFFFFFFFFS.S", // 14: (Blue)
      "SSSSSSFFFFFFFFSSSSSS", // 15: BLADE 3 & 4
      "SSSSSSFFFFFFFFSSSSSS", // 16
      "S.SFFFFFFFFFFFFFFS.S", // 17
      "S.SFFFFFFFFFFFFFFS.S", // 18
      "S.S..............S.S", // 19
      "S.SSSSSSSSSSSSSSSS.S", // 20
      "S..................S", // 21
      "SSSSSS...SS...SSSSSS", // 22: HEAVY GUARD
      "SSSSSSSSSSSSSSSSSSSS", // 23: SEALED BOTTOM
    ];

    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = NL_MASK[r]?.[mappedC] || 'S';

    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';
    if (maskChar === '.') return 'NONE'; 

    // 3. FLAG COLORS (Red, White, Blue horizontal tricolor)
    if (r >= 4 && r <= 18) {
      if (r <= 8) return '#AE1C28'; // Dutch Red
      if (r <= 13) return 'WHITE'; // White
      return '#21468B'; // Dutch Blue
    }

    return 'background';
  },
};
