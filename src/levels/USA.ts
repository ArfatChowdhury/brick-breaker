import { LevelConfig } from './types';

export const USA: LevelConfig = {
  name: 'USA Star Fortress Elite',
  id: 'US_ELITE_V2', // Updated version
  backgroundColor: '#002868',
  initialBallSpeed: 9.4,
  paddleSizeMultiplier: 0.75,
  gridRows: 36,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. USA FORTRESS MASK (36 Rows x 20 Cols mapped)
    const US_MASK = [
      "SSSSSSSS....SSSSSSSS", // 0
      "S..................S", // 1
      "S.SSSSSSSSSSSSSSSS.S", // 2
      "S.S..............S.S", // 3
      "S.S.BBBBBBFFFFFFF.S.S", // 4: MASK PROTOTYPE (scaled later)
      "S.S.BBBBBBFFFFFFF.S.S",
      "S.S.BBBBBBFFFFFFF.S.S",
      "S.S.BBBBBBFFFFFFF.S.S",
      "S.S.BBBBBBFFFFFFF.S.S",
      "S.S.BBBBBBFFFFFFF.S.S",
      "S.S.BBBBBBFFFFFFF.S.S",
      "S.S.FFFFFFFFFFFFF.S.S",
      "S.S.FFFFFFFFFFFFF.S.S",
      "S.S.FFFFFFFFFFFFF.S.S",
      "S.S.FFFFFFFFFFFFF.S.S",
      "S.S.FFFFFFFFFFFFF.S.S",
      "S.S.FFFFFFFFFFFFF.S.S",
      "S.S.FFFFFFFFFFFFF.S.S",
      "S.S.FFFFFFFFFFFFF.S.S",
      "S.S.FFFFFFFFFFFFF.S.S",
      "S.S.FFFFFFFFFFFFF.S.S",
      "S.S.FFFFFFFFFFFFF.S.S",
      "S.S.FFFFFFFFFFFFF.S.S",
      "S.S.FFFFFFFFFFFFF.S.S",
      "S.S.FFFFFFFFFFFFF.S.S",
      "S.S.FFFFFFFFFFFFF.S.S",
      "S.S.FFFFFFFFFFFFF.S.S",
      "S.S.FFFFFFFFFFFFF.S.S",
      "S.S.FFFFFFFFFFFFF.S.S",
      "S.S.FFFFFFFFFFFFF.S.S", // Row 29
      "S.S..............S.S", // 30
      "S.SSSSSSSSSSSSSSSS.S", // 31
      "S..................S", // 32
      "S........SS........S", // 33
      "S..................S", // 34
      "SSSSSSSSSSSSSSSSSSSS", // 35
    ];

    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = US_MASK[r]?.[mappedC] || 'S';

    // 2. STONE WALL LOGIC
    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';
    if (maskChar === '.') return 'NONE'; 

    // 3. FLAG COLORS (Rows 4-29 = 26 rows)
    if (r >= 4 && r <= 29) {
      // 13 Stripes: 2 rows each
      const stripeIdx = Math.floor((r - 4) / 2);
      const isRed = (stripeIdx % 2 === 0);
      
      // CANTON: Top 7 stripes (14 rows), left 40% (Standard Proportion)
      const isCanton = stripeIdx < 7 && c < (gridCols * 0.4);
      
      if (isCanton) {
        // STAGGERED STAR FIELD (Elite high-density look)
        // A simple checkerboard pattern feels much better at this resolution
        const starX = (c % 3 === 1);
        const starY = (r % 2 === 0);
        const offsetStar = ( (r-4)/2 + c ) % 2 === 0;
        
        return (offsetStar) ? 'WHITE' : '#002776';
      }
      
      return isRed ? 'RED' : 'WHITE';
    }

    return 'background';
  },
};
