import { LevelConfig } from './types';

// Bangladesh: Red circle on green — gauntlet narrows entry from sides
export const Bangladesh: LevelConfig = {
  name: 'Bangladesh',
  id: 'BD',
  backgroundColor: '#006A4E',
  circleColor: '#F42A41',
  pattern: (r, c, rows, cols) => {
    // Staggered gauntlet: alternating stone guards on top rows forcing zig-zag entry
    if (r === 1 && (c < 5 || c > 8)) return 'STONE';
    if (r === 3 && (c < 3 || c > 10)) return 'STONE';

    const distToCenter = Math.sqrt(Math.pow(r - 8, 2) + Math.pow(c - 6, 2));
    return distToCenter < 4 ? 'circle' : 'background';
  },
};
