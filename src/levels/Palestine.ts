import { LevelConfig } from './types';

export const Palestine: LevelConfig = {
  name: 'Palestine',
  id: 'PS',
  backgroundColor: '#FFFFFF',
  pattern: (r, c, rows, cols) => {
    // Portcullis Gauntlet: Horizontal stone bars with shifting windows
    if (r === 1 && (c < 3 || c > 5)) return 'STONE';
    if (r === 3 && (c < 9 || c > 11)) return 'STONE';

    const isTriangle = c < (rows/2 - Math.abs(r - rows/2)) * 0.8;
    if (isTriangle) return 'RED';
    if (r < rows / 3) return 'BLACK';
    if (r < (rows / 3) * 2) return 'WHITE';
    return 'GREEN';
  },
};
