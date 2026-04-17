import { LevelConfig } from './types';

export const Bangladesh: LevelConfig = {
  flagColors: ['#006A4E', '#F42A41'],
  flagOrientation: 'h',
  name: 'Bangladesh Elite',
  id: 'BD_MAZE_V2',
  backgroundColor: '#006A4E',
  circleColor: '#F42A41',
  initialBallSpeed: 9.5,
  paddleSizeMultiplier: 0.8,
  // gridCols is now dynamically calculated by the engine based on screen width
  gridRows: 25,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. STRICTLY SEALED PERIMETER MASK (24 Rows x 20 Cols mapped)
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

    // Map the dynamic column `c` (e.g. 0-25) into the 0-19 range of the mask
    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = BD_MASK[r]?.[mappedC] || 'S';

    // Stone walls - Ensure Sides are ALWAYS closed regardless of mapping
    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';
    // Empty space
    if (maskChar === '.') return 'NONE';
    
    // 2. FLAG COLORS (Top 15 Rows)
    if (r < 15) {
      // PROPORTIONAL CIRCLE
      // Center X is 45% across the screen (9/20)
      const cx = gridCols * 0.45; 
      const cy = 7.5;
      
      // Aspect ratio correction
      const dy = (r - cy) * 0.8;
      const dx = (c - cx);
      const dist = Math.sqrt(dy * dy + dx * dx);
      
      // Circle radius scales with screen width
      const radius = gridCols * 0.21; 
      
      if (dist < radius) return 'circle';
    }

    // Everything else is Green
    return 'background';
  }
};
