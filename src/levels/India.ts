import { LevelConfig } from './types';

export const India: LevelConfig = {
  flagColors: ['#FF9933', '#FFFFFF', '#138808'],
  flagOrientation: 'h',
  isoCode: 'in',
  name: 'India Tiranga Elite',
  id: 'IN_ELITE_V1',
  backgroundColor: '#FFFFFF',
  initialBallSpeed: 9.3,
  paddleSizeMultiplier: 0.8,
  gridRows: 24,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. INDIA FORTRESS MASK (24 Rows)
    const IN_MASK = [
      "SSSSS..........SSSSS", // 0: LOTUS GATE (Wide rounded)
      "SSS..............SSS", // 1: SHOULDER
      "S.SSSSSSSSSSSSSSSS.S", // 2: OUTER RING
      "S.S..............S.S", // 3
      "S.S.AAAAAAAAAAAAAA.S.S", // 4: SAFFRON START
      "S.S.AAAAAAAAAAAAAA.S.S",
      "S.S.AAAAAAAAAAAAAA.S.S",
      "S.S.AAAAAAAAAAAAAA.S.S",
      "S.S.AAAAAAAAAAAAAA.S.S",
      "S.S.WWWWWWWWWWWWWW.S.S", // 9: WHITE START
      "S.S.WWWWWWWWWWWWWW.S.S",
      "S.S.WWWWWWWWWWWWWW.S.S",
      "S.S.WWWWWWWWWWWWWW.S.S",
      "S.S.WWWWWWWWWWWWWW.S.S",
      "S.S.WWWWWWWWWWWWWW.S.S", // 14: WHITE EXTENDED (Total 6 rows)
      "S.S.GGGGGGGGGGGGGG.S.S", // 15: GREEN START
      "S.S.GGGGGGGGGGGGGG.S.S",
      "S.S.GGGGGGGGGGGGGG.S.S",
      "S.S.GGGGGGGGGGGGGG.S.S",
      "S.S..............S.S", // 19
      "S.SSSSSSSSSSSSSSSS.S", // 20: LOWER RING
      "S..................S", // 21
      "S.SS............SS.S", // 22: REINFORCED BASE
      "SSSSSSSSSSSSSSSSSSSS", // 23: SEALED BOTTOM
    ];

    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = IN_MASK[r]?.[mappedC] || 'S';

    // 2. STONE WALL LOGIC
    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';
    if (maskChar === '.') return 'NONE'; 

    // 3. FLAG COLORS (Rows 4-18)
    if (r >= 4 && r <= 18) {
      if (r <= 8) return '#FF9933'; // Saffron
      if (r <= 14) {
        // WHITE BAND WITH CHAKRA (Rows 9-14)
        const cx = gridCols / 2;
        const cy = 11.5; // Perfectly centered in 6 rows (9,10,11,12,13,14)
        const sx = c - cx;
        const sy = (r - cy) * 1.3;
        const dist = Math.sqrt(sx * sx + sy * sy);
        
        // Navy Blue Chakra
        if (dist < gridCols * 0.12) return '#000080';
        return 'WHITE';
      }
      return '#138808'; // Green
    }

    return 'background';
  },
};
