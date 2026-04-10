import { LevelConfig } from './types';

export const Hourglass: LevelConfig = {
  name: 'The Hourglass',
  id: 'HOURGLASS',
  backgroundColor: '#212121',
  pattern: (r, c, rows, cols) => {
    // Adding extra entrance guards at the very top
    if (r === 0 && (c < 3 || c > 10)) return 'STONE';
    if (r === 2 && (c > 4 && c < 9)) return 'STONE';

    const mid = Math.floor(cols / 2);
    const wait = Math.abs(r - rows/2);
    const opening = (wait / (rows/2)) * (cols/2) + 1;
    const isInside = Math.abs(c - mid) < opening;
    const isStone = (r === Math.floor(rows/2) || r === Math.floor(rows/2) - 1) && Math.abs(c - mid) > 2;
    if (isStone) return 'STONE';
    return isInside ? '#FFD54F' : 'NONE';
  },
};
