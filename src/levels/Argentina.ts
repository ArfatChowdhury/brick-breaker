import { LevelConfig } from './types';

export const Argentina: LevelConfig = {
  flagColors: ['#74ACDF', '#FFFFFF', '#74ACDF'],
  flagOrientation: 'h',
  name: 'Argentina Sol Elite',
  id: 'AR_ELITE_V1',
  backgroundColor: '#74ACDF',
  initialBallSpeed: 9.3,
  paddleSizeMultiplier: 0.8,
  gridRows: 24,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. ARGENTINA FORTRESS MASK (24 Rows)
    const AR_MASK = [
      "SSSSSSSS....SSSSSSSS", // 0: TOP ENTRY
      "SS................SS", // 1
      "S.SSSSSSSSSSSSSSSS.S", // 2: OUTER RING
      "S..S............S..S", // 3: WIDE INNER
      "S.S.BBBBBBBBBBBBBB.S.S", // 4: SKY BLUE START
      "S.S.BBBBBBBBBBBBBB.S.S",
      "S.S.BBBBBBBBBBBBBB.S.S",
      "S.S.BBBBBBBBBBBBBB.S.S",
      "S.S.BBBBBBBBBBBBBB.S.S",
      "S.S.WWWWWWWWWWWWWW.S.S", // 9: WHITE START
      "S.S.WWWWWWWWWWWWWW.S.S",
      "S.S.WWWWWWWWWWWWWW.S.S",
      "S.S.WWWWWWWWWWWWWW.S.S",
      "S.S.WWWWWWWWWWWWWW.S.S",
      "S.S.WWWWWWWWWWWWWW.S.S", // 14: WHITE EXTENDED (Total 6 rows)
      "S.S.BBBBBBBBBBBBBB.S.S", // 15: SKY BLUE START
      "S.S.BBBBBBBBBBBBBB.S.S",
      "S.S.BBBBBBBBBBBBBB.S.S",
      "S.S.BBBBBBBBBBBBBB.S.S",
      "S..S............S..S", // 19
      "S.SSSSSSSSSSSSSSSS.S", // 20: LOWER RING
      "SS................SS", // 21
      "S..SSS........SSS..S", // 22: ANDES PEAKS GUARD
      "SSSSSSSSSSSSSSSSSSSS", // 23: SEALED BOTTOM
    ];

    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = AR_MASK[r]?.[mappedC] || 'S';

    // 2. STONE WALL LOGIC
    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';
    if (maskChar === '.') return 'NONE'; 

    // 3. FLAG COLORS (Rows 4-18)
    if (r >= 4 && r <= 18) {
      if (r <= 8 || r >= 15) return '#74ACDF'; // Sky Blue
      
      // WHITE BAND WITH SUN OF MAY (Rows 9-14)
      const cx = gridCols / 2;
      const cy = 11.5; // Perfectly centered in 6 rows
      const sx = c - cx;
      const sy = (r - cy) * 1.3; // Aspect correction
      const dist = Math.sqrt(sx * sx + sy * sy);
      
      // Sun of May Core
      if (dist < gridCols * 0.08) return '#FFB81C';
      
      // Sun Rays (8 primary directions)
      const angle = (Math.atan2(sy, sx) * 180 / Math.PI + 360) % 360;
      const isRay = (angle % 45 < 8 || angle % 45 > 37) && dist < gridCols * 0.16;
      
      if (isRay) return '#FFB81C';
      return 'WHITE';
    }

    return 'background';
  },
};
