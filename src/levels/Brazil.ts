import { LevelConfig } from './types';

export const Brazil: LevelConfig = {
  name: 'Brazil Ordem Elite',
  id: 'BR_ELITE_V2', // Refined version
  backgroundColor: '#00B32C', 
  initialBallSpeed: 9.3,
  paddleSizeMultiplier: 0.8,
  gridRows: 26,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. BRAZIL FORTRESS MASK (Rainforest Canopy)
    const BR_MASK = [
      "SSSSSSSS....SSSSSSSS", // 0: TOP CANOPY
      "SSSSSS........SSSSSS", // 1: DESCENDING ROOF
      "SSSS............SSSS", // 2: LEAVES
      "SS................SS", // 3: OPENING
      "S.SFFFFFFFFFFFFFFS.S", // 4: START OF FLAG
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S", // 19
      "SS................SS", // 20: TAPER IN
      "SSSS............SSSS", // 21: JUNGLE FLOOR 
      "SSSSSS...SS...SSSSSS", // 22: GUARD
      "SSSSSSSSSSSSSSSSSSSS", // 23: SEALED
      "SSSSSSSSSSSSSSSSSSSS", // 24: SEALED
      "SSSSSSSSSSSSSSSSSSSS", // 25: SEALED
    ];

    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = BR_MASK[r]?.[mappedC] || 'S';

    // 2. STONE WALL LOGIC
    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';
    if (maskChar === '.') return 'NONE'; 


    // 3. FLAG GEOMETRY (Rows 4-20)
    if (r >= 4 && r <= 20) {
      const cx = gridCols / 2;
      const cy = 12.0; // Center of the flag
      
      const dx = Math.abs(c - cx);
      const dy = Math.abs(r - cy);

      // BLUE CIRCLE (Vibrant Blue)
      // Base radius tied to gridCols
      const circleRadius = gridCols * 0.16;
      // Adjust dy to make a perfect circle visually (since bricks are rectangular)
      const dist = Math.sqrt(Math.pow(dy * 1.25, 2) + Math.pow(dx, 2));
      const isCircle = dist < circleRadius;

      // WHITE SLOGAN ARC (Upward curving smile)
      // Center of the arc's curvature is below the circle
      const arcCenterY = cy + 5;
      const distToArc = Math.sqrt(Math.pow(dx, 2) + Math.pow(Math.abs(r - arcCenterY) * 1.2, 2));
      const isSlogan = isCircle && distToArc > 4.5 && distToArc < 5.8;

      // YELLOW DIAMOND (Large & Bold, 1 tile of green padding)
      const maxDx = (gridCols / 2) - 2.5; 
      const maxDy = 7.5; // Leaves rows 4 and 20 as mostly green
      const diamondVal = (dy / maxDy) + (dx / maxDx);
      const isDiamond = diamondVal <= 1.0;

      if (isSlogan) return 'WHITE';
      if (isCircle) return '#002271';
      if (isDiamond) return '#FFD700'; // Vibrant Gold
      return 'background';
    }

    return 'background';
  },
};
