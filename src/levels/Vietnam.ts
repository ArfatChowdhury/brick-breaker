import { LevelConfig } from './types';

export const Vietnam: LevelConfig = {
  name: 'Vietnam Dragon Tooth',
  id: 'VN_ELITE_V1',
  backgroundColor: '#DA251D', // Vietnamese Red
  initialBallSpeed: 9.7,
  paddleSizeMultiplier: 0.8,
  gridRows: 24,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. VIETNAM FORTRESS MASK (Dragon Tooth)
    // Deep inward spikes perfectly 20 characters wide map
    const VN_MASK = [
      "SSSSSSSS....SSSSSSSS", // 0: TOP ENTRY
      "S..................S", // 1
      "S.SSSSSSSSSSSSSSSS.S", // 2
      "S.SFFFFFFFFFFFFFFS.S", // 3: Wide start
      "SS.SFFFFFFFFFFFFS.SS", // 4: Spike narrowing
      "SSS.SFFFFFFFFFFS.SSS", // 5
      "SSSS.SFFFFFFFFS.SSSS", // 6: Deep tooth
      "SSSS.SFFFFFFFFS.SSSS", // 7
      "SSS.SFFFFFFFFFFS.SSS", // 8: Widening
      "SS.SFFFFFFFFFFFFS.SS", // 9
      "S.SFFFFFFFFFFFFFFS.S", // 10: Center open area for star
      "S.SFFFFFFFFFFFFFFS.S", // 11
      "S.SFFFFFFFFFFFFFFS.S", // 12
      "S.SFFFFFFFFFFFFFFS.S", // 13
      "SS.SFFFFFFFFFFFFS.SS", // 14: Lower spike narrowing
      "SSS.SFFFFFFFFFFS.SSS", // 15
      "SSSS.SFFFFFFFFS.SSSS", // 16: Deep tooth
      "SSSS.SFFFFFFFFS.SSSS", // 17
      "SSS.SFFFFFFFFFFS.SSS", // 18
      "SS.S............S.SS", // 19
      "S.SSSSSSSSSSSSSSSS.S", // 20
      "S..................S", // 21
      "SSSSSSSS....SSSSSSSS", // 22: HEAVY GUARD
      "SSSSSSSSSSSSSSSSSSSS", // 23: SEALED BOTTOM
    ];

    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = VN_MASK[r]?.[mappedC] || 'S';

    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';
    if (maskChar === '.') return 'NONE'; 

    // 3. FLAG COLORS (Solid Red, Solid Gold Star)
    if (r >= 3 && r <= 18) {
      const colPercent = (c / gridCols);
      
      // HUGE 5-POINTED STAR ALGORITHM
      // Center of flag is around row 11, colPercent 0.5
      const cx = 0.50;
      const cy = 11.5;
      const dx = (colPercent - cx) * gridCols; // Horizontal distance in blocks
      const dy = r - cy; // Vertical distance in rows

      // Radius of the star
      const R = 4.0;
      const rInner = R * 0.4;
      
      // Angle in radians (shifted to point UP)
      let angle = Math.atan2(dy, dx) + Math.PI / 2;
      if (angle < 0) angle += 2 * Math.PI;

      // 5 points means 2*PI / 5 radians per point.
      const interval = (2 * Math.PI) / 5;
      const localAngle = angle % interval;
      
      // Calculate distance to the edge of the star at this angle
      // Line equation between outer point and inner point
      const halfInterval = interval / 2;
      const distToEdge = localAngle < halfInterval 
          ? (R * rInner * Math.sin(halfInterval)) / (R * Math.sin(halfInterval - localAngle) + rInner * Math.sin(localAngle))
          : (R * rInner * Math.sin(halfInterval)) / (R * Math.sin(localAngle - halfInterval) + rInner * Math.sin(interval - localAngle));

      const rPixel = Math.sqrt(dx * dx + dy * dy);
      
      if (rPixel <= distToEdge) {
          return '#FFFF00'; // Vietnamese Gold
      }

      return '#DA251D'; // Vietnamese Red
    }

    return 'background';
  },
};
