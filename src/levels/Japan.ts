import { LevelConfig } from './types';

export const Japan: LevelConfig = {
  flagColors: ['#FFFFFF'],
  flagOrientation: 'h',
  flagSymbol: 'circle',
  flagSymbolColor: '#BC002D',
  isoCode: 'jp',
  name: 'Japan Zen Elite',
  id: 'JP_ELITE_V1',
  backgroundColor: '#FFFFFF',
  circleColor: '#BC002D',
  initialBallSpeed: 8.8,
  paddleSizeMultiplier: 0.9,
  // gridCols is strictly dynamic now
  gridRows: 24,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. JAPAN FORTRESS MASK (24 Rows x 20 Cols mapped)
    // S = STONE3 (Strong Wall), . = NONE (Gap), B = BACKGROUND (White), C = CIRCLE (Red)
    const JP_MASK = [
      "SSSSSSSS....SSSSSSSS", // 0: TORII GATE TOP (Entrance)
      "S..................S", // 1
      "S.SSSSSSSSSSSSSSSS.S", // 2: TORII CROSSBAR
      "S.S..............S.S", // 3
      "S.S..B B B B B B.S.S", // 4: START OF FLAG
      "S.S..B B B B B B.S.S", // 5
      "S.S..B B B B B B.S.S", // 6
      "S.S..B B B B B B.S.S", // 7
      "S.S..B B B B B B.S.S", // 8
      "S.S..B B B B B B.S.S", // 9
      "S.S..B B B B B B.S.S", // 10
      "S.S..B B B B B B.S.S", // 11
      "S.S..B B B B B B.S.S", // 12
      "S.S..B B B B B B.S.S", // 13
      "S.S..B B B B B B.S.S", // 14
      "S.S..B B B B B B.S.S", // 15
      "S.S..B B B B B B.S.S", // 16
      "S.S..B B B B B B.S.S", // 17
      "S.S..B B B B B B.S.S", // 18
      "S.S..............S.S", // 19
      "S.SSSSSS....SSSSSS.S", // 20: INNER PERIMETER
      "S..................S", // 21
      "S........SS........S", // 22: BOTTOM OBSTACLE
      "SSSSSSSSSSSSSSSSSSSS", // 23: SEALED BOTTOM
    ];

    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = JP_MASK[r]?.[mappedC] || 'S';

    // 2. STONE WALL LOGIC (Perimeter and Internal structure)
    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';
    if (maskChar === ' ') return 'background'; // Spaces in mask mean background
    if (maskChar === '.') return 'NONE'; // Empty space for ball travel

    // 3. FLAG COLORS (Only inside the "flag area")
    // Let's define the flag bounds: rows 4 to 18
    if (r >= 4 && r <= 18) {
      // PROPORTIONAL CIRCLE
      // Center X is middle of the screen
      const cx = gridCols / 2;
      // Center Y is middle of row 11
      const cy = 11;
      
      // Aspect ratio correction (brickHeight = 0.8 * brickWidth)
      const dy = (r - cy) * 0.8;
      const dx = (c - cx);
      const dist = Math.sqrt(dy * dy + dx * dx);
      
      // Circle radius (about 1/3 of the height of the flag block)
      const radius = gridCols * 0.18; 
      
      if (dist < radius) return 'circle';
      return 'background';
    }

    // Default to background for inner parts of the gate
    return 'background';
  },
};
