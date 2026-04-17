import { LevelConfig } from './types';

export const Morocco: LevelConfig = {
  flagColors: ['#C1272D', '#006233'],
  flagOrientation: 'h',
  name: 'Morocco Atlas Gate',
  id: 'MA_ELITE_V1',
  backgroundColor: '#C1272D', // Moroccan Red
  initialBallSpeed: 9.6,
  paddleSizeMultiplier: 0.8,
  gridRows: 24,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. MOROCCO FORTRESS MASK (Atlas Gate)
    // Horseshoe arch starting wide, pinching, then widening at bottom
    const MA_MASK = [
      "SSSSSSSS....SSSSSSSS", // 0: TOP ENTRY
      "SSSSSS........SSSSSS", // 1
      "SSSSS..........SSSSS", // 2: ARCH CURVE
      "SSSS............SSSS", // 3
      "SSS.SFFFFFFFFFFS.SSS", // 4: PINCH POINT START
      "SS.SFFFFFFFFFFFFS.SS", // 5: Widen inside flag
      "S.SFFFFFFFFFFFFFFS.S", // 6: 
      "S.SFFFFFFFFFFFFFFS.S", // 7
      "S.SFFFFFFFFFFFFFFS.S", // 8
      "S.SFFFFFFFFFFFFFFS.S", // 9
      "S.SFFFFFFFFFFFFFFS.S", // 10
      "S.SFFFFFFFFFFFFFFS.S", // 11
      "S.SFFFFFFFFFFFFFFS.S", // 12
      "S.SFFFFFFFFFFFFFFS.S", // 13
      "S.SFFFFFFFFFFFFFFS.S", // 14
      "S.SFFFFFFFFFFFFFFS.S", // 15
      "S.SFFFFFFFFFFFFFFS.S", // 16
      "S.SFFFFFFFFFFFFFFS.S", // 17
      "S.SFFFFFFFFFFFFFFS.S", // 18
      "SS.S............S.SS", // 19: Pinch Point Bottom
      "SSS..............SSS", // 20
      "SSSS............SSSS", // 21
      "SSSSSS...SS...SSSSSS", // 22: HEAVY GUARD
      "SSSSSSSSSSSSSSSSSSSS", // 23: SEALED BOTTOM
    ];

    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = MA_MASK[r]?.[mappedC] || 'S';

    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';
    if (maskChar === '.') return 'NONE'; 

    // 3. FLAG COLORS (Solid Red, Hollow Green Pentagram)
    if (r >= 4 && r <= 18) {
      const colPercent = (c / gridCols);
      
      const cx = 0.50;
      const cy = 11.0;
      const dx = (colPercent - cx) * gridCols; 
      const dy = r - cy; 

      const R = 4.5;
      const rInner = R * 0.4; // standard 5-point star
      
      let angle = Math.atan2(dy, dx) + Math.PI / 2;
      if (angle < 0) angle += 2 * Math.PI;

      const interval = (2 * Math.PI) / 5;
      const localAngle = angle % interval;
      
      const halfInterval = interval / 2;
      const distToEdge = localAngle < halfInterval 
          ? (R * rInner * Math.sin(halfInterval)) / (R * Math.sin(halfInterval - localAngle) + rInner * Math.sin(localAngle))
          : (R * rInner * Math.sin(halfInterval)) / (R * Math.sin(localAngle - halfInterval) + rInner * Math.sin(interval - localAngle));

      const rPixel = Math.sqrt(dx * dx + dy * dy);
      
      // Outline detection: if current pixel is within a thin border of the mathematical edge
      // and not inside the center pentagon... wait, a pentagram has overlapping lines.
      // An easier approximation on a pixel grid is just a hollow star footprint:
      if (rPixel <= distToEdge && rPixel >= distToEdge - 0.7) {
          return '#006233'; // Moroccan Green Outline
      }

      return '#C1272D'; // Moroccan Red
    }

    return 'background';
  },
};
