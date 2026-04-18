import { LevelConfig } from './types';

export const Qatar: LevelConfig = {
  isoCode: 'qa',
  name: 'Qatar Serrated Fortress',
  id: 'QA_ELITE_V1',
  backgroundColor: '#8D1B3D',
  initialBallSpeed: 10,
  paddleSizeMultiplier: 0.8,
  gridRows: 24,

  pattern: (r, c, gridRows, gridCols) => {
    // 1. Qatar Serrated Mask
    const QA_MASK = [
      "SSSSSSSSSSSSSSSSSSSS",
      "SS................SS",
      "SS..SSS....SSS....SS",
      "SS..S.S....S.S....SS",
      "SS..SSS....SSS....SS",
      "SS................SS",
      "SS.RRRRRRRRRRRRRR.SS",
      "SS.RRRRRRRRRRRRRR.SS",
      "SS.RRRRRRRRRRRRRR.SS",
      "SS.RRRRRRRRRRRRRR.SS",
      "SS.RRRRRRRRRRRRRR.SS",
      "SS.RRRRRRRRRRRRRR.SS",
      "SS.RRRRRRRRRRRRRR.SS",
      "SS.RRRRRRRRRRRRRR.SS",
      "SS.RRRRRRRRRRRRRR.SS",
      "SS.RRRRRRRRRRRRRR.SS",
      "SS.RRRRRRRRRRRRRR.SS",
      "SS.RRRRRRRRRRRRRR.SS",
      "SS.RRRRRRRRRRRRRR.SS",
      "SS................SS",
      "SS................SS",
      "SS..SS........SS..SS",
      "SS..SS........SS..SS",
      "SSSSSSSSSSSSSSSSSSSS",
    ];

    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = QA_MASK[r]?.[mappedC] || 'S';

    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';
    if (maskChar === '.') return 'NONE';

    // Qatar Flag Serration Logic (Left white section with jagged edge)
    const serrationPoint = gridCols * 0.35;
    const jaggedOffset = Math.abs((r % 4) - 2) * 1.5;
    
    if (c < serrationPoint + jaggedOffset) {
        return '#FFFFFF';
    }

    return '#8D1B3D';
  }
};
