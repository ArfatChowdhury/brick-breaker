import { LevelConfig } from './types';

export const Bangladesh: LevelConfig = {
  name: 'Bangladesh Elite',
  id: 'BD_MAZE_V2',
  backgroundColor: '#006A4E',
  circleColor: '#F42A41',
  initialBallSpeed: 9.5,
  paddleSizeMultiplier: 0.8,
  gridCols: 20,
  gridRows: 25,
  pattern: (r, c) => {
    // 1. STRICTLY SEALED PERIMETER MASK (24 Rows x 20 Cols)
    const BD_MASK = [
      "SSSSSSSSSSSSSSSSSSSS", // 0: CLOSED TOP
      "SCCCCCCCCCCCCCCCCCCS", // 1
      "SCCCCCCCCCCCCCCCCCCS", // 2
      "SCCCCCCCCCCCCCCCCCCS", // 3
      "SCCCCCCCCCCCCCCCCCCS", // 4
      "SCCCCCCCCCCCCCCCCCCS", // 5
      "SCCCCCCCCCCCCCCCCCCS", // 6
      "SCCCCCCCCCCCCCCCCCCS", // 7
      "SCCCCCCCCCCCCCCCCCCS", // 8
      "SCCCCCCCCCCCCCCCCCCS", // 9
      "SCCCCCCCCCCCCCCCCCCS", // 10
      "SCCCCCCCCCCCCCCCCCCS", // 11
      "SCCCCCCCCCCCCCCCCCCS", // 12
      "SCCCCCCCCCCCCCCCCCCS", // 13
      "SCCCCCCCCCCCCCCCCCCS", // 14
      "SSSSSSSS....SSSSSSSS", // 15: MAZE START (Gap in center)
      "S..........S.......S", // 16
      "S.SSSSSSSS..S.SSSSSS", // 17
      "S.S........S.......S", // 18
      "S.S.SSSSSSSSSSSSSS.S", // 19
      "S.S................S", // 20
      "S.SSSSSSSSSSSSSSSS.S", // 21
      "S..................S", // 22
      "SSSSSSSSSS..SSSSSSSS", // 23: MAZE START (Secondary gap in center)
      "SSSSSSSSSSSSSSSSSSSS", // 24: SEALED BOTTOM
    ];

    const maskChar = BD_MASK[r]?.[c] || 'S';

    // Stone walls - Ensure Sides are ALWAYS closed
    if (maskChar === 'S' || c === 0 || c === 19) return 'STONE3';
    // Empty space
    if (maskChar === '.') return 'NONE';
    
    // 2. FLAG COLORS (Top 15 Rows)
    if (r < 15) {
      // PROPORTIONAL CIRCLE: 
      // cx = 9/20 of 20 = 9 (slightly left of middle index 9.5)
      // cy = middle of 15 rows = 7.5
      const cx = 8.5; 
      const cy = 7.5;
      
      // Aspect ratio correction (brickHeight = 0.8 * brickWidth)
      const dy = (r - cy) * 0.8;
      const dx = (c - cx);
      const dist = Math.sqrt(dy * dy + dx * dx);
      
      if (dist < 4.2) return 'circle'; // Red circle
    }

    // Everything else is Green
    return 'background';
  }
};
