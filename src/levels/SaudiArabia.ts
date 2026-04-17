import { LevelConfig } from './types';

export const SaudiArabia: LevelConfig = {
  flagColors: ['#006C35', '#FFFFFF'],
  flagOrientation: 'h',
  name: 'Saudi Arabia Desert Elite',
  id: 'SA_ELITE_V1',
  backgroundColor: '#165D31',
  initialBallSpeed: 9.3,
  paddleSizeMultiplier: 0.8,
  gridRows: 24,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. SAUDI FORTRESS MASK (Desert Oasis)
    const SA_MASK = [
      "SSSSSSSS....SSSSSSSS", // 0: TOP ENTRY
      "S..................S", // 1
      "S.SSSSSSSSSSSSSSSS.S", // 2: OUTER RING
      "S..S............S..S", // 3: DUNE WIDE
      "S...S..........S...S", // 4: DUNE START
      "S..SFFFFFFFFFFFFS..S", // 5: FLAG START
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S", // 14
      "S.SFFFFFFFFFFFFFFS.S",
      "S.SFFFFFFFFFFFFFFS.S",
      "S..SFFFFFFFFFFFFS..S", // 17
      "S...S..........S...S", // 18
      "S....S........S....S", // 19: DUNE END
      "S.SSSSSSSSSSSSSSSS.S", // 20: LOWER RING
      "S..................S", // 21
      "S........SS........S", // 22: BOTTOM GUARD
      "SSSSSSSSSSSSSSSSSSSS", // 23: SEALED BOTTOM
    ];

    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = SA_MASK[r]?.[mappedC] || 'S';

    // 2. STONE WALL LOGIC
    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';
    if (maskChar === '.') return 'NONE'; 

    // 3. FLAG COLORS (Green with White script/sword)
    if (r >= 5 && r <= 18) {
      const colPercent = c / gridCols;
      
      // THE STONE SWORD (Rows 15-17)
      // A curved scimitar made entirely of indestructible STONE3 blocks.
      // Starts left (hilt), curves right (blade).
      const hiltX = 0.75; // Blade points right to left? The Saudi flag sword points to the left.
      // So hilt on right, blade ends on left.
      if (r === 16 && colPercent > 0.25 && colPercent < 0.75) {
          // Curved blade thickness handling
          const curveDrop = Math.pow(colPercent - 0.5, 2) * 5;
          if (r === 16 + Math.floor(curveDrop)) return 'STONE3'; 
      }
      if (r === 15 && colPercent > 0.20 && colPercent < 0.80) {
           return 'STONE3'; // Solid main blade
      }
      if (r === 15 && Math.abs(colPercent - 0.80) < 0.02) return 'STONE3'; // Hilt guard

      // THE SCRIPT (High-Res Shahada approximation via noise/staggered blocks)
      if (r >= 9 && r <= 13 && colPercent > 0.20 && colPercent < 0.80) {
        // Break up the solid white into "calligraphy" chunks
        const phase = Math.sin(colPercent * 50) + Math.cos(r * 4 + colPercent * 20);
        const intensity = phase * (r % 2 === 0 ? 1.5 : 0.8);
        if (intensity > 0.5) return 'WHITE';
      }

      return '#006C35'; // Saudi Green
    }

    return 'background';
  },
};
