import { LevelConfig } from './types';

export const Singapore: LevelConfig = {
  isoCode: 'sg',
  name: 'Singapore Crescent Lunar',
  id: 'SG_ELITE_V1',
  backgroundColor: '#EF4135',
  initialBallSpeed: 10.8,
  paddleSizeMultiplier: 0.7,
  gridRows: 26,

  pattern: (r, c, gridRows, gridCols) => {
    // 1. Crescent Maze at the top
    const centerX = 6;
    const centerY = 6;
    const dist = Math.sqrt(Math.pow(c - centerX, 2) + Math.pow(r - centerY, 2));
    
    // Moon shape in stone
    if (dist > 3.5 && dist < 5 && c < centerX + 1) return 'STONE3';

    // 5 Stars logic
    const stars = [[10, 5], [12, 8], [10, 11], [7, 10], [7, 6]];
    for (const [sr, sc] of stars) {
        if (Math.sqrt(Math.pow(r - sr, 2) + Math.pow(c - sc, 2)) < 1.2) return 'STONE3';
    }

    // Flag red/white split
    return r < 13 ? '#EF4135' : '#FFFFFF';
  }
};
