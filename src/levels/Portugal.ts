import { LevelConfig } from './types';

export const Portugal: LevelConfig = {
  flagColors: ['#006600', '#FF0000'],
  flagOrientation: 'v',
  isoCode: 'pt',
  name: 'Portugal Navigator Elite',
  id: 'PT_ELITE_V1',
  backgroundColor: '#FFFFFF',
  initialBallSpeed: 9.6,
  paddleSizeMultiplier: 0.85,
  gridRows: 24,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. PORTUGAL FORTRESS MASK (Compass Style Rounded Entry)
    const PT_MASK = [
      "SSSSSSSS....SSSSSSSS", // 0: TOP ENTRY
      "SSS..............SSS", // 1: ROUNDED SHOULDER
      "S.SSSSSSSSSSSSSSSS.S", // 2: OUTER RING
      "S.S..............S.S", // 3
      "S.S.GGGGGGRRRRRRRR.S.S", // 4: START OF FLAG (Green/Red split 40/60)
      "S.S.GGGGGGRRRRRRRR.S.S",
      "S.S.GGGGGGRRRRRRRR.S.S",
      "S.S.GGGGGGRRRRRRRR.S.S",
      "S.S.GGGGGGRRRRRRRR.S.S",
      "S.S.GGGGGGRRRRRRRR.S.S", // 9: CREST ZONE
      "S.S.GGGGGGRRRRRRRR.S.S",
      "S.S.GGGGGGRRRRRRRR.S.S",
      "S.S.GGGGGGRRRRRRRR.S.S",
      "S.S.GGGGGGRRRRRRRR.S.S",
      "S.S.GGGGGGRRRRRRRR.S.S", // 14: CREST ZONE END
      "S.S.GGGGGGRRRRRRRR.S.S",
      "S.S.GGGGGGRRRRRRRR.S.S",
      "S.S.GGGGGGRRRRRRRR.S.S",
      "S.S.GGGGGGRRRRRRRR.S.S",
      "S.S..............S.S", // 19
      "S.SSSSSSSSSSSSSSSS.S", // 20: LOWER RING
      "SSS..............SSS", // 21: ROUNDED BOTTOM
      "SSSSSS...S..S...SSSS", // 22: COMPASS BASE
      "SSSSSSSSSSSSSSSSSSSS", // 23: SEALED BOTTOM
    ];

    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = PT_MASK[r]?.[mappedC] || 'S';

    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';
    if (maskChar === '.') return 'NONE'; 

    // 3. FLAG COLORS (Green 40%, Red 60%)
    if (r >= 4 && r <= 18) {
      const colPercent = (c / gridCols);
      
      // Crest Location (exactly on the split line)
      const cx = 0.40;
      const cy = 11.5;
      const dx = Math.abs(colPercent - cx) * gridCols;
      const dy = Math.abs(r - cy);
      
      // Simplified Portuguese Armillary Sphere + Shield
      if (dx < 3 && dy < 3) {
          if (dx < 1.5 && dy < 1.5) return 'RED'; // Inner Shield
          return '#FFD700'; // Gold Armillary Sphere
      }

      if (colPercent < 0.40) return '#006600'; // Portuguese Green
      return '#FF0000'; // Portuguese Red
    }

    return 'background';
  },
};
