import { LevelConfig } from './types';

export const Spain: LevelConfig = {
  flagColors: ['#AA151B', '#F1BF00', '#AA151B'],
  flagOrientation: 'h',
  name: 'Spain Rojigualda Sol',
  id: 'ES_ELITE_V1',
  backgroundColor: '#FFFFFF',
  initialBallSpeed: 9.6,
  paddleSizeMultiplier: 0.8,
  gridRows: 24,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. SPAIN FORTRESS MASK
    const ES_MASK = [
      "S.S.S.S....S.S.S.S.S", // 0: BATTLEMENTS (Notched top)
      "S..................S", // 1
      "S.SSSSSSSSSSSSSSSS.S", // 2: OUTER RING
      "S.S..............S.S", // 3
      "S.S.RRRRRRRRRRRRRR.S.S", // 4: RED TOP
      "S.S.RRRRRRRRRRRRRR.S.S",
      "S.S.RRRRRRRRRRRRRR.S.S",
      "S.S.YYYYYYYYYYYYYY.S.S", // 7: YELLOW START
      "S.S.YYYYYYYYYYYYYY.S.S",
      "S.S.YYYYYYYYYYYYYY.S.S",
      "S.S.YYYYYYYYYYYYYY.S.S",
      "S.S.YYYYYYYYYYYYYY.S.S",
      "S.S.YYYYYYYYYYYYYY.S.S",
      "S.S.YYYYYYYYYYYYYY.S.S",
      "S.S.YYYYYYYYYYYYYY.S.S",
      "S.S.RRRRRRRRRRRRRR.S.S", // 15: RED BOTTOM
      "S.S.RRRRRRRRRRRRRR.S.S",
      "S.S.RRRRRRRRRRRRRR.S.S",
      "S.S.RRRRRRRRRRRRRR.S.S",
      "S.S..............S.S", // 19
      "S.SSSSSSSSSSSSSSSS.S", // 20: LOWER RING
      "S..................S", // 21
      "S.S.S.S.SS.S.S.S.S.S", // 22: REVERSED BATTLEMENTS
      "SSSSSSSSSSSSSSSSSSSS", // 23: SEALED BOTTOM
    ];

    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = ES_MASK[r]?.[mappedC] || 'S';

    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';
    if (maskChar === '.') return 'NONE'; 

    // 3. FLAG COLORS
    if (r >= 4 && r <= 18) {
      if (r <= 6 || r >= 15) return '#AA151B'; // Spanish Red
      
      // YELLOW BAND (7-14) WITH CREST (approx col 25-35%)
      const colPercent = c / gridCols;
      if (colPercent > 0.22 && colPercent < 0.35 && r > 9 && r < 13) {
        return '#700000'; // Simplified Crest (Dark Red/Stone)
      }
      
      return '#F1BF00'; // Spanish Yellow
    }

    return 'background';
  },
};
