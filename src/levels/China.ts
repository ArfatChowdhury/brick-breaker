import { LevelConfig } from './types';

export const China: LevelConfig = {
  flagColors: ['#DE2910', '#FFDE00'],
  flagOrientation: 'h',
  isoCode: 'cn',
  name: 'China Jade Fortress',
  id: 'CN_ELITE_V1',
  backgroundColor: '#EE1C25', // Red
  initialBallSpeed: 9.8,
  paddleSizeMultiplier: 0.75,
  gridRows: 24,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. CHINA FORTRESS MASK (Great Wall Heavy Battlements)
    const CN_MASK = [
      "SSSS....SS....SSSSSS", // 0: BATTLEMENTS
      "S..................S", // 1
      "S.SSSSSSSSSSSSSSSS.S", // 2: OUTER RING
      "S.S..............S.S", // 3
      "S.S.RRRRRRRRRRRRRR.S.S", // 4: CHINESE RED START
      "S.S.RRRRRRRRRRRRRR.S.S",
      "S.S.RRRRRRRRRRRRRR.S.S",
      "S.S.RRRRRRRRRRRRRR.S.S",
      "S.S.RRRRRRRRRRRRRR.S.S",
      "S.S.RRRRRRRRRRRRRR.S.S",
      "S.S.RRRRRRRRRRRRRR.S.S",
      "S.S.RRRRRRRRRRRRRR.S.S",
      "S.S.RRRRRRRRRRRRRR.S.S",
      "S.S.RRRRRRRRRRRRRR.S.S",
      "S.S.RRRRRRRRRRRRRR.S.S",
      "S.S.RRRRRRRRRRRRRR.S.S",
      "S.S.RRRRRRRRRRRRRR.S.S",
      "S.S.RRRRRRRRRRRRRR.S.S",
      "S.S.RRRRRRRRRRRRRR.S.S",
      "S.S..............S.S", // 19
      "S.SSSSSSSSSSSSSSSS.S", // 20: LOWER RING
      "S..................S", // 21
      "S...SSSSSSSSSSSS...S", // 22: HEAVY BASE
      "SSSSSSSSSSSSSSSSSSSS", // 23: SEALED BOTTOM
    ];

    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = CN_MASK[r]?.[mappedC] || 'S';

    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';
    if (maskChar === '.') return 'NONE'; 

    // 3. FLAG COLORS (Red with Yellow Stars)
    if (r >= 4 && r <= 18) {
      const colPercent = (c / gridCols);
      
      // 1. Large Star
      const lcx = 0.25; 
      const lcy = 8.5;
      const dLarge = Math.sqrt(Math.pow((colPercent - lcx) * gridCols, 2) + Math.pow(r - lcy, 2));
      if (dLarge < 2.5) return '#FFFF00';

      // 2. Four Small Stars (in arc)
      const smallStars = [
          { x: 0.40, y: 5.5 },
          { x: 0.45, y: 7.5 },
          { x: 0.45, y: 9.5 },
          { x: 0.40, y: 11.5 },
      ];

      for (const s of smallStars) {
          const dSmall = Math.sqrt(Math.pow((colPercent - s.x) * gridCols, 2) + Math.pow(r - s.y, 2));
          if (dSmall < 0.8) return '#FFFF00';
      }

      return '#EE1C25'; // China Red
    }

    return 'background';
  },
};
