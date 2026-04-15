import { LevelConfig } from './types';

export const SaudiArabia: LevelConfig = {
  name: 'Saudi Arabia Desert Elite',
  id: 'SA_ELITE_V1',
  backgroundColor: '#165D31',
  initialBallSpeed: 9.3,
  paddleSizeMultiplier: 0.8,
  gridRows: 24,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. SAUDI FORTRESS MASK (24 Rows x 20 Cols mapped)
    const SA_MASK = [
      "SSSSSSSS....SSSSSSSS", // 0: TOP ENTRY
      "S..................S", // 1
      "S.SSSSSSSSSSSSSSSS.S", // 2: OUTER RING
      "S.S..............S.S", // 3
      "S.S..B B B B B B.S.S", // 4: START OF GREEN
      "S.S..B B B B B B.S.S",
      "S.S..B B B B B B.S.S",
      "S.S..B B B B B B.S.S",
      "S.S..B B B B B B.S.S",
      "S.S..B B B B B B.S.S",
      "S.S..B B B B B B.S.S",
      "S.S..BBBBBBBBBBBB.S.S", // 11: Script Line 1
      "S.S..BBWWWBWWWBB.S.S", // 12: Script Line 2
      "S.S..BBWWWWWWWWBB.S.S", // 13: Script Line 3
      "S.S..BBBBBBBBBBBB.S.S", // 14
      "S.S..B B B B B B.S.S",
      "S.S..B B B B B B.S.S",
      "S.S..BWWWWWWWWWB.S.S", // 17: THE SWORD (White blade)
      "S.S..BBBBBBBBBBB.S.S", // 18
      "S.S..............S.S", // 19
      "S.SSSSSSSSSSSSSSSS.S", // 20: LOWER RING
      "S..................S", // 21
      "S........SS........S", // 22: BOTTOM GUARD
      "SSSSSSSSSSSSSSSSSSSS", // 23: SEALED BOTTOM
    ];

    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = SA_MASK[r]?.[mappedC] || 'S';

    // 2. STONE WALL LOGIC
    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';
    if (maskChar === '.') return 'NONE'; 

    // 3. FLAG COLORS (Rows 4-18)
    if (r >= 4 && r <= 18) {
      // THE SWORD IS PERMANENT STONE IN THIS ELITE LEVEL
      // Row 17 is the blade
      if (r === 17 && c > gridCols * 0.25 && c < gridCols * 0.75) {
        return 'STONE'; // Permanent white stone blade
      }

      // SCRIPT AREA (Rows 11-13)
      const isScript = r >= 11 && r <= 13 && c > gridCols * 0.3 && c < gridCols * 0.7;
      if (isScript) return 'WHITE';

      return 'background';
    }

    return 'background';
  },
};
