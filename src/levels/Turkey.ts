import { LevelConfig } from './types';

export const Turkey: LevelConfig = {
  flagColors: ['#E30A17', '#FFFFFF'],
  flagOrientation: 'h',
  name: 'Turkey Crescent Elite',
  id: 'TR_ELITE_V1',
  backgroundColor: '#E30A17',
  circleColor: '#FFFFFF',
  initialBallSpeed: 9.0,
  paddleSizeMultiplier: 0.85,
  gridRows: 24,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. TURKEY FORTRESS MASK (24 Rows x 20 Cols mapped)
    // S = STONE3 (Strong Wall), . = NONE (Gap), B = BACKGROUND (Red), C = CRESCENT/STAR (White)
    const TR_MASK = [
      "SSSSSSSSS..SSSSSSSSS", // 0: TOP ENTRY
      "S..................S", // 1
      "S..................S", // 2
      "S..................S", // 3
      "SS.B B B B B B B .SS", // 4: FLAG START (Thinner walls)
      "SS.B B B B B B B .SS", // 5
      "SS.B B B B B B B .SS", // 6
      "SS.B B B B B B B .SS", // 7
      "SS.B B B B B B B .SS", // 8
      "SS.B B B B B B B .SS", // 9
      "SS.B B B B B B B .SS", // 10
      "SS.B B B B B B B .SS", // 11
      "SS.B B B B B B B .SS", // 12
      "SS.B B B B B B B .SS", // 13
      "SS.B B B B B B B .SS", // 14
      "SS.B B B B B B B .SS", // 15
      "SS.B B B B B B B .SS", // 16
      "SS.B B B B B B B .SS", // 17
      "S..................S", // 18
      "S...SSSS....SSSS...S", // 19: INNER PERIMETER
      "S..................S", // 20
      "S........SS........S", // 21: BOTTOM OBSTACLE
      "S..................S", // 22
      "SSSSSSSSSSSSSSSSSSSS", // 23: SEALED BOTTOM
    ];

    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = TR_MASK[r]?.[mappedC] || 'S';

    // 2. STONE WALL LOGIC
    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';
    if (maskChar === ' ') return 'background'; 
    if (maskChar === '.') return 'NONE'; 

    // 3. FLAG COLORS (Rows 4-17)
    if (r >= 4 && r <= 17) {
      // PROPORTIONAL CRESCENT (Refined)
      const cx = gridCols * 0.35; // Moved left half
      const cy = 10.5;
      
      const dy = (r - cy) * 0.8;
      const dx1 = (c - cx);          
      const dx2 = (c - (cx + 2.2));  // Sharper inner cut
      
      const dist1 = Math.sqrt(dy * dy + dx1 * dx1);
      const dist2 = Math.sqrt(dy * dy + dx2 * dx2);
      
      const radius = gridCols * 0.22; // Larger crescent
      const isCrescent = dist1 < radius && dist2 > radius * 0.75;

      // STAR (Refined position)
      const starCx = gridCols * 0.62;
      const starCy = 10.5;
      const sdy = Math.abs(r - starCy) * 0.8;
      const sdx = Math.abs(c - starCx);
      // Sharp star shape
      const isStar = (sdy + sdx) < 1.6;

      if (isCrescent || isStar) return 'circle';
      return 'background';
    }

    return 'background';
  },
};
