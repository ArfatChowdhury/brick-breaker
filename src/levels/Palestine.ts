import { LevelConfig } from './types';

export const Palestine: LevelConfig = {
  name: 'Palestine',
  id: 'PS',
  backgroundColor: '#FFFFFF',
  pattern: (r, c, rows, cols) => {
    const isTriangle = c < (rows/2 - Math.abs(r - rows/2)) * 0.8;
    if (isTriangle) return 'RED';
    if (r < rows / 3) return 'BLACK';
    if (r < (rows / 3) * 2) return 'WHITE';
    return 'GREEN';
  },
};
