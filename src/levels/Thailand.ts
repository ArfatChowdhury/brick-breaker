import { LevelConfig } from './types';

export const Thailand: LevelConfig = {
  name: 'Thailand Pagoda Gate',
  id: 'TH_ELITE_V1',
  backgroundColor: '#FFFFFF',
  initialBallSpeed: 9.6,
  paddleSizeMultiplier: 0.8,
  gridRows: 24,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. THAILAND FORTRESS MASK (Pagoda Gate)
    // Layered, tiered roof at the top mimicking Asian pagoda architecture.
    const TH_MASK = [
      "SSSSSSSS....SSSSSSSS", // 0: TIER 1
      "SSSSSS........SSSSSS", // 1
      "SSSSSSSS....SSSSSSSS", // 2: TIER 2
      "SSSS............SSSS", // 3
      "SSSSSS........SSSSSS", // 4: TIER 3
      "S.SFFFFFFFFFFFFFFS.S", // 5: START OF FLAG
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S", // 10
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S", // 15
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.S..............S.S", // 19
      "SSSS............SSSS", // 20: TAPER BASE
      "SSS..............SSS", // 21
      "SSSSSS...SS...SSSSSS", // 22: HEAVY GUARD
      "SSSSSSSSSSSSSSSSSSSS", // 23: SEALED BOTTOM
    ];

    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = TH_MASK[r]?.[mappedC] || 'S';

    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';
    if (maskChar === '.') return 'NONE'; 

    // 3. FLAG COLORS (Red, White, Blue, White, Red in 1:1:2:1:1 ratio)
    // Spans rows 5 to 18 (14 total rows used for the flag)
    // Ratios: Total 6 units. 
    // 14 / 6 = ~2.33 rows per unit.
    // Let's manually map them for crisp horizontal lines:
    // Red: 5-6 (2 rows)
    // White: 7-8 (2 rows)
    // Blue: 9-14 (6 rows)
    // White: 15-16 (2 rows)
    // Red: 17-18 (2 rows)
    if (r >= 5 && r <= 18) {
      if (r <= 6) return '#ED1C24'; // Red
      if (r <= 8) return 'WHITE';
      if (r <= 14) return '#241D4F'; // Deep Blue
      if (r <= 16) return 'WHITE';
      return '#ED1C24'; // Red
    }

    return 'background';
  },
};
