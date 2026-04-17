import { LevelConfig } from './types';

export const Jamaica: LevelConfig = {
  flagColors: ['#FED100', '#000000', '#007A5E'],
  flagOrientation: 'h',
  name: 'Jamaica Caribbean Cove',
  id: 'JM_ELITE_V1',
  backgroundColor: '#000000',
  initialBallSpeed: 9.8,
  paddleSizeMultiplier: 0.8,
  gridRows: 24,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. JAMAICA FORTRESS MASK (Caribbean Cove)
    // Slanted edges tracking the X shape
    const JM_MASK = [
      "SSSSS..........SSSSS", // 0: TOP ENTRY
      "SSSS............SSSS", // 1
      "SSS..............SSS", // 2
      "SS.S............S.SS", // 3: Slanted opening
      "S.SFFFFFFFFFFFFFFS.S", // 4: START OF FLAG
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S", // 9
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S", // 14
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "SS.S............S.SS", // 19
      "SSS..............SSS", // 20
      "SSSS............SSSS", // 21
      "SSSSS...SSSS...SSSSS", // 22: HEAVY GUARD
      "SSSSSSSSSSSSSSSSSSSS", // 23: SEALED BOTTOM
    ];

    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = JM_MASK[r]?.[mappedC] || 'S';

    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';
    if (maskChar === '.') return 'NONE'; 

    // 3. FLAG COLORS (Diagonal Yellow Cross, Green T/B, Black L/R)
    if (r >= 4 && r <= 18) {
      const colPercent = c / gridCols;
      // Row mapped 0 to 1
      const rowPercent = (r - 4) / 14; 

      // Distance to the two diagonal lines (y = x and y = 1-x)
      const dist1 = Math.abs(rowPercent - colPercent);
      const dist2 = Math.abs(rowPercent - (1 - colPercent));

      // Thick yellow cross
      if (dist1 < 0.1 || dist2 < 0.1) return '#FFB81C'; // Jamaican Gold

      // Top and Bottom triangles (Green)
      // Top if row % < col % AND row % < 1 - col %
      if (rowPercent < colPercent && rowPercent < 1 - colPercent) return '#007749'; // Green Top
      if (rowPercent > colPercent && rowPercent > 1 - colPercent) return '#007749'; // Green Bottom

      // Left and Right triangles (Black)
      return '#000000'; // Black Left/Right
    }

    return 'background';
  },
};
