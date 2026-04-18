import { LevelConfig } from './types';

export const Ukraine: LevelConfig = {
  isoCode: 'ua',
  name: 'Ukraine Kyiv Fortress',
  id: 'UA_ELITE_V1',
  backgroundColor: '#0057B7',
  initialBallSpeed: 10.1,
  paddleSizeMultiplier: 0.9,
  gridRows: 24,

  pattern: (r, c, gridRows, gridCols) => {
    // 1. Top Fortress Wall
    if (r === 0 || (r === 1 && (c < 3 || c > gridCols - 4))) return 'STONE3';
    
    // 2. Split Barrier in the middle
    if (r === 11 || r === 12) {
      if (c % 4 === 0) return 'STONE3';
    }

    // Flag stripes
    if (r < 12) return '#0057B7'; // Blue
    return '#FFD700'; // Gold/Yellow
  }
};
