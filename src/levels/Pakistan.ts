import { LevelConfig } from './types';

export const Pakistan: LevelConfig = {
  flagColors: ['#01411C', '#FFFFFF'],
  flagOrientation: 'v',
  name: 'Pakistan Crescent Gate',
  id: 'PK_ELITE_V1',
  backgroundColor: '#115740', // Pakistani Dark Green
  initialBallSpeed: 9.6,
  paddleSizeMultiplier: 0.8,
  gridRows: 24,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. PAKISTAN FORTRESS MASK (Crescent Gate)
    // Asymmetrical entrance favoring the right side to flow toward the star.
    const PK_MASK = [
      "SSSSS..........SSSSS", // 0: TOP ENTRY
      "SSSS............SSSS", // 1
      "SSS..............SSS", // 2
      "SS................SS", // 3: Wide opening
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
      "S..S............S..S", // 19
      "SS..S..........S..SS", // 20: Tapering base
      "SSS...S......S...SSS", // 21
      "SSSS...SSSSSS...SSSS", // 22: HEAVY GUARD
      "SSSSSSSSSSSSSSSSSSSS", // 23: SEALED BOTTOM
    ];

    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = PK_MASK[r]?.[mappedC] || 'S';

    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';
    if (maskChar === '.') return 'NONE'; 

    // 3. FLAG COLORS (Green Field, White Left Bar, Crescent & Star)
    if (r >= 4 && r <= 18) {
      const colPercent = c / gridCols;
      
      // Left vertical white band (~25%)
      if (colPercent <= 0.25) return 'WHITE';

      // Crescent Moon and Star
      const cxCrescent = 0.60;
      const cyCrescent = 11.5;
      const dxC = (colPercent - cxCrescent) * gridCols;
      const dyC = r - cyCrescent;
      const dist1 = Math.sqrt(dxC * dxC + dyC * dyC);

      // Inner eclipse for crescent
      const dxInner = (colPercent - cxCrescent - 0.05) * gridCols; // shifted right and slightly up
      const dyInner = r - (cyCrescent - 0.5);
      const dist2 = Math.sqrt(dxInner * dxInner + dyInner * dyInner);

      // It's part of the crescent if inside outer circle but outside inner circle
      if (dist1 < 3.5 && dist2 >= 3.0) return 'WHITE';

      // 5-Pointed Star (Simplified as a small cluster intersecting)
      const cxStar = cxCrescent + 0.12; // Shift up and right from crescent center
      const cyStar = cyCrescent - 2.5;
      const dxS = (colPercent - cxStar) * gridCols;
      const dyS = r - cyStar;
      if (Math.abs(dxS) + Math.abs(dyS) <= 1.5) return 'WHITE';

      return '#115740'; // Green
    }

    return 'background';
  },
};
