import { LevelConfig } from './types';

export const Greece: LevelConfig = {
  flagColors: ['#0D5EAF', '#FFFFFF', '#0D5EAF', '#FFFFFF', '#0D5EAF', '#FFFFFF', '#0D5EAF', '#FFFFFF', '#0D5EAF'],
  flagOrientation: 'h',
  name: 'Greece Aegean Columns',
  id: 'GR_ELITE_V1',
  backgroundColor: '#FFFFFF',
  initialBallSpeed: 9.6,
  paddleSizeMultiplier: 0.8,
  gridRows: 24,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. GREECE FORTRESS MASK (Aegean Pillars)
    const GR_MASK = [
      "SSSSSSSS....SSSSSSSS", // 0: TOP ENTRY
      "S.S.S..........S.S.S", // 1: PILLAR TOPS
      "S.S.S..........S.S.S", // 2: PILLAR GAPS
      "S.S.S..........S.S.S", // 3
      "S.S.SFFFFFFFFFFS.S.S", // 4: START OF FLAG (Stripe 1, Blue)
      "S.S.SFFFFFFFFFFS.S.S", // 5: (Stripe 2, White)
      "S.S.SFFFFFFFFFFS.S.S", // 6: (Stripe 3, Blue - CROSS BAR)
      "S.S.SFFFFFFFFFFS.S.S", // 7: (Stripe 4, White)
      "S.S.SFFFFFFFFFFS.S.S", // 8: (Stripe 5, Blue)
      "S.S.SFFFFFFFFFFS.S.S", // 9: (Stripe 6, White)
      "S.S.SFFFFFFFFFFS.S.S", // 10: (Stripe 7, Blue)
      "S.S.SFFFFFFFFFFS.S.S", // 11: (Stripe 8, White)
      "S.S.SFFFFFFFFFFS.S.S", // 12: (Stripe 9, Blue)
      "S.S.S..........S.S.S", // 13: END OF FLAG (Pillar gaps continue)
      "S.S.S..........S.S.S", // 14
      "S.S.S..........S.S.S", // 15
      "S.S.S..........S.S.S", // 16
      "S.S.S..........S.S.S", // 17
      "S.S.S..........S.S.S", // 18
      "S.S.S..........S.S.S", // 19
      "S.S.S..........S.S.S", // 20
      "S.S.S..........S.S.S", // 21: PILLAR BASES
      "S.S.S..........S.S.S", // 22: GUARD
      "SSSSSSSSSSSSSSSSSSSS", // 23: SEALED BOTTOM
    ];

    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = GR_MASK[r]?.[mappedC] || 'S';

    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';
    if (maskChar === '.') return 'NONE'; 

    // 3. FLAG COLORS (Blue & White)
    // To make 9 stripes fit nicely, we map them purely mathematically.
    if (r >= 4 && r <= 16) {
      // 9 stripes over 13 rows -> 1.44 rows per stripe. 
      // Let's use exactly 9 distinct mathematical bands.
      const stripeProgress = (r - 4) / 13; // 0.0 to 1.0
      const stripeIndex = Math.floor(stripeProgress * 9); // 0 to 8
      
      const isBlueStripe = stripeIndex % 2 === 0;
      
      // CANTON (Top Left)
      // Canton covers the top 5 stripes (0,1,2,3,4)
      const isCanton = stripeIndex <= 4 && c < gridCols * 0.45;

      if (isCanton) {
        // Greek Cross logic
        const localR = r - 4;
        // Canton spans approx rows 4 through 9 (6 rows)
        const isHorizontalCross = localR === 2 || localR === 3;
        const isVerticalCross = c > gridCols * 0.17 && c < gridCols * 0.28;
        
        if (isHorizontalCross || isVerticalCross) return 'WHITE';
        return '#0D5EAF'; // Greek Blue
      }

      return isBlueStripe ? '#0D5EAF' : 'WHITE';
    }

    return 'background';
  },
};
