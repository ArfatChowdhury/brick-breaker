import { LevelConfig } from './types';

export const Cuba: LevelConfig = {
  flagColors: ['#002A8F', '#FFFFFF', '#CC0001'],
  flagOrientation: 'h',
  isoCode: 'cu',
  name: 'Cuba Caribbean Chevron',
  id: 'CU_ELITE_V1',
  backgroundColor: '#FFFFFF',
  initialBallSpeed: 9.6,
  paddleSizeMultiplier: 0.8,
  gridRows: 24,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. CUBA FORTRESS MASK (Caribbean Chevron)
    // Left side stone wall dynamically pushes inwards to outline the chevron triangle.
    const CU_MASK = [
      "SSSSSSSS....SSSSSSSS", // 0: TOP ENTRY
      "S..................S", // 1
      "S..SSSSSSSSSSSSSS..S", // 2
      "SSS..............SSS", // 3
      "SS.SFFFFFFFFFFFFS.SS", // 4: START OF FLAG (Stripe 1, Blue)
      "SSS.FFFFFFFFFFFFS.SS", // 5: Chevron starts intruding
      "SSSSFFFFFFFFFFFFS.SS", // 6: 
      "SSSSSFFFFFFFFFFFS.SS", // 7: (Stripe 2, White)
      "SSSSSSFFFFFFFFFFS.SS", // 8
      "SSSSSSSFFFFFFFFFS.SS", // 9: (Stripe 3, Blue)
      "SSSSSSSSFFFFFFFFS.SS", // 10: CHEVRON PEAK
      "SSSSSSSSFFFFFFFFS.SS", // 11: 
      "SSSSSSSFFFFFFFFFS.SS", // 12: (Stripe 4, White)
      "SSSSSSFFFFFFFFFFS.SS", // 13: Chevron recedes
      "SSSSSFFFFFFFFFFFS.SS", // 14:
      "SSSSFFFFFFFFFFFFS.SS", // 15: (Stripe 5, Blue)
      "SSS.FFFFFFFFFFFFS.SS", // 16
      "SS.SFFFFFFFFFFFFS.SS", // 17
      "S..SFFFFFFFFFFFFS..S", // 18: END OF FLAG
      "S..................S", // 19
      "SS.SSSSSSSSSSSSSS.SS", // 20: LOWER RING
      "S..................S", // 21
      "SSSS...SSSSSS...SSSS", // 22: HEAVY GUARD
      "SSSSSSSSSSSSSSSSSSSS", // 23: SEALED BOTTOM
    ];

    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = CU_MASK[r]?.[mappedC] || 'S';

    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';
    if (maskChar === '.') return 'NONE'; 

    // 3. FLAG COLORS
    // Due to the stone actually forming the chevron, we just need to color the 
    // flag area stripes and handle the red triangle + star.
    if (r >= 4 && r <= 18) {
      const colPercent = (c / gridCols);
      const rowLocal = r - 4; // 0 to 14
      
      // CHEVRON (Red with White Star)
      // We know the stone outlines it on the left, but we still need to paint 
      // the red field and the star inside the remaining available space.
      // The peak is at rowLocal = 6.5. 
      const distToPeak = Math.abs(rowLocal - 6.5);
      // Rough triangle bounds (matches the stone inward slope)
      const isChevron = colPercent < (0.40 - distToPeak * 0.05);

      if (isChevron) {
        // White Star inside the red chevron (Center around rowLocal 6.5, colPercent 0.15)
        const dStarX = (colPercent - 0.15) * gridCols;
        const dStarY = rowLocal - 6.5;
        if (Math.abs(dStarX) + Math.abs(dStarY) <= 1.5) return 'WHITE';
        return '#CB1515'; // Cuban Red
      }

      // STRIPES (5 horizontal: Blue, White, Blue, White, Blue)
      // Spans 15 rows. Each stripe is 3 rows thick.
      const stripeIndex = Math.floor(rowLocal / 3);
      if (stripeIndex % 2 === 0) return '#002A8F'; // Cuban Blue
      return 'WHITE';
    }

    return 'background';
  },
};
