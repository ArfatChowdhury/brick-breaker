import { LevelConfig } from './types';

export const Germany: LevelConfig = {
  flagColors: ['#000000', '#DD0000', '#FFCE00'],
  flagOrientation: 'h',
  isoCode: 'de',
  name: 'Germany Bastion Elite',
  id: 'DE_ELITE_V1',
  backgroundColor: '#FFCE00',
  initialBallSpeed: 9.4,
  paddleSizeMultiplier: 0.75,
  gridRows: 24,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. GERMANY FORTRESS MASK (24 Rows)
    const DE_MASK = [
      "SSSSSSSSS..SSSSSSSSS", // 0: NARROW ENTRY
      "SS................SS", // 1: THICKER SIDES
      "SS.SSSSSSSSSSSSSS.SS", // 2: INNER RING
      "SS.S............S.SS", // 3
      "SS.S.KKKKKKKKKK.S.SS", // 4: BLACK START
      "SS.S.KKKKKKKKKK.S.SS",
      "SS.S.KKKKKKKKKK.S.SS",
      "SS.S.KKKKKKKKKK.S.SS",
      "SS.S.KKKKKKKKKK.S.SS",
      "SS.S.RRRRRRRRRR.S.SS", // 9: RED START
      "SS.S.RRRRRRRRRR.S.SS",
      "SS.S.RRRRRRRRRR.S.SS",
      "SS.S.RRRRRRRRRR.S.SS",
      "SS.S.RRRRRRRRRR.S.SS",
      "SS.S.YYYYYYYYYY.S.SS", // 14: GOLD START
      "SS.S.YYYYYYYYYY.S.SS",
      "SS.S.YYYYYYYYYY.S.SS",
      "SS.S.YYYYYYYYYY.S.SS",
      "SS.S.YYYYYYYYYY.S.SS",
      "SS.S............S.SS", // 19
      "SS.SSSSSSSSSSSSSS.SS", // 20: LOWER RING
      "SS................SS", // 21
      "SS......SSSS......SS", // 22: REINFORCED GUARD
      "SSSSSSSSSSSSSSSSSSSS", // 23: SEALED BOTTOM
    ];

    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = DE_MASK[r]?.[mappedC] || 'S';

    // 2. STONE WALL LOGIC
    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';
    if (maskChar === '.') return 'NONE'; 

    // 3. FLAG COLORS (Rows 4-18)
    if (r >= 4 && r <= 18) {
      if (r <= 8) return '#000000'; // Black
      if (r <= 13) return '#DD0000'; // Red
      return '#FFCE00'; // Gold
    }

    return 'background';
  },
};
