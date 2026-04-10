import { LevelConfig } from './types';

export const Brazil: LevelConfig = {
  name: 'Brazil',
  id: 'BR',
  backgroundColor: '#009739',
  pattern: (r, c, rows, cols) => {
    const dr = Math.abs(r - rows/2);
    const dc = Math.abs(c - cols/2);
    const isDiamond = (dr / (rows/2)) + (dc / (cols/2)) < 0.8;
    const distToCenter = Math.sqrt(Math.pow(r - rows/2, 2) + Math.pow(c - cols/2, 2));
    const isCircle = distToCenter < 3;
    if (isCircle) return 'BLUE';
    if (isDiamond) return '#FFDF00';
    return 'background';
  },
};
