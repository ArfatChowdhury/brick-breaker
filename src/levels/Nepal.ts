import { LevelConfig } from './types';

export const Nepal: LevelConfig = {
  flagColors: ['#DC143C', '#003893'],
  flagOrientation: 'h',
  isoCode: 'np',
  name: 'Nepal Tri-Peak Elite',
  id: 'NP_ELITE_V1',
  backgroundColor: '#DC143C',
  initialBallSpeed: 9.5,
  paddleSizeMultiplier: 0.8,
  gridRows: 26,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. NEPAL SHAPE LOGIC
    // Two stacked triangles: Top (4-14), Bottom (14-26)
    const getFlagWidth = (row: number) => {
      if (row < 4) return 0;
      if (row <= 14) {
        // Linear growth for top peak
        return ( (row - 4) / 10 ) * (gridCols * 0.65);
      }
      if (row <= 26) {
        // Reset and growth for bottom peak
        return ( (row - 14) / 12 ) * (gridCols * 0.85);
      }
      return 0;
    };

    const flagWidth = getFlagWidth(r);
    const isInsideFlag = c <= flagWidth;
    const isAtEdge = Math.abs(c - flagWidth) < 1.1;

    // 2. STONE PERIMETER (Triangular wall)
    if (isInsideFlag && (isAtEdge || c === 0 || r === 4 || r === 25)) {
      return 'STONE3';
    }

    // 3. VOID LOGIC (Non-rectangular behavior)
    if (!isInsideFlag) return 'NONE';

    // 4. FLAG SYMBOLS
    if (r === 9 && c === Math.floor(flagWidth * 0.3)) return 'WHITE'; // Moon
    if (r === 20 && c === Math.floor(flagWidth * 0.3)) return 'WHITE'; // Sun

    return 'background';
  },
};
