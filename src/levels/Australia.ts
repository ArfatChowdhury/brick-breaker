import { LevelConfig } from './types';

export const Australia: LevelConfig = {
  flagColors: ['#002A7F', '#FFFFFF', '#CC0001'],
  flagOrientation: 'h',
  name: 'Australia Southern Cross Elite',
  id: 'AU_ELITE_V1',
  backgroundColor: '#00008B', // Dark Blue
  initialBallSpeed: 9.5,
  paddleSizeMultiplier: 0.8,
  gridRows: 24,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. AUSTRALIA FORTRESS MASK (Star-Point Architect)
    const AU_MASK = [
      "SSSSS...S..S...SSSSS", // 0: STAR ENTRY
      "SSS..............SSS", // 1
      "S.SSSSSSSSSSSSSSSS.S", // 2: OUTER RING
      "S.S..............S.S", // 3
      "S.S.CCCCWWWWWWWWWW.S.S", // 4: CANTON AREA (C=Union Jack, W=Navy)
      "S.S.CCCCWWWWWWWWWW.S.S",
      "S.S.CCCCWWWWWWWWWW.S.S",
      "S.S.CCCCWWWWWWWWWW.S.S",
      "S.S.CCCCWWWWWWWWWW.S.S",
      "S.S.CCCCWWWWWWWWWW.S.S", // 9
      "S.S.CCCCWWWWWWWWWW.S.S",
      "S.S.CCCCWWWWWWWWWW.S.S",
      "S.S.WWWWWWWWWWWWWW.S.S", // 12: LOWER BLUE
      "S.S.WWWWWWWWWWWWWW.S.S",
      "S.S.WWWWWWWWWWWWWW.S.S",
      "S.S.WWWWWWWWWWWWWW.S.S",
      "S.S.WWWWWWWWWWWWWW.S.S",
      "S.S.WWWWWWWWWWWWWW.S.S",
      "S.S.WWWWWWWWWWWWWW.S.S",
      "S.S..............S.S", // 19
      "S.SSSSSSSSSSSSSSSS.S", // 20: LOWER RING
      "SSS..............SSS", // 21
      "SSSSS...SSSS...SSSSS", // 22: REINFORCED GUARD
      "SSSSSSSSSSSSSSSSSSSS", // 23: SEALED BOTTOM
    ];

    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = AU_MASK[r]?.[mappedC] || 'S';

    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';
    if (maskChar === '.') return 'NONE'; 

    // 3. FLAG COLORS (Navy Background)
    if (r >= 4 && r <= 18) {
      const colPercent = c / gridCols;
      
      // CANTON: Union Jack (Rough approximation)
      if (r <= 11 && colPercent < 0.45) {
        const localR = r - 4;
        const localCPercent = colPercent / 0.45;
        
        // Red Cross
        const isHorizontalCross = localR >= 3 && localR <= 4;
        const isVerticalCross = localCPercent > 0.4 && localCPercent < 0.6;
        if (isHorizontalCross || isVerticalCross) return 'RED';
        
        // Diagonals (Rough)
        const isDiagonal = Math.abs(localR - localCPercent * 7) < 1 || Math.abs(localR - (7 - localCPercent * 7)) < 1;
        if (isDiagonal) return 'WHITE';
        
        return 'BLUE';
      }

      // STARS (White)
      const cx = gridCols / 2;
      const cy = 11.5;
      
      // Federation Star (Under Canton)
      const distFed = Math.sqrt(Math.pow((colPercent - 0.22) * gridCols, 2) + Math.pow(r - 15, 2));
      if (distFed < 1.8) return 'WHITE';

      // Southern Cross (Right Side)
      const stars = [
          { x: 0.75, y: 11.5, size: 1.5 }, // Alpha
          { x: 0.75, y: 7.0, size: 1.2 },  // Gamma
          { x: 0.65, y: 10.0, size: 1.2 }, // Delta
          { x: 0.85, y: 10.0, size: 1.2 }, // Beta
          { x: 0.75, y: 14.5, size: 1.2 }, // Epsilon
      ];

      for (const s of stars) {
          const dist = Math.sqrt(Math.pow((colPercent - s.x) * gridCols, 2) + Math.pow(r - s.y, 2));
          if (dist < s.size) return 'WHITE';
      }

      return '#000040'; // Navy Blue
    }

    return 'background';
  },
};
