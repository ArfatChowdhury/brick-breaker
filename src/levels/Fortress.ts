import { LevelConfig } from './types';

export const Fortress: LevelConfig = {
  name: 'The Fortress',
  id: 'FORTRESS',
  backgroundColor: '#37474F',
  pattern: (r, c, rows, cols) => {
    const isWall = (c < 5 || c > cols - 6) && r > 2;
    const isGuard = r === 2 && (c === 6 || c === 7);
    if (isWall || isGuard) return 'STONE';
    if (r > 6 && r < 10 && c > 5 && c < 9) return 'WHITE';
    return 'background';
  },
};
