import { LevelConfig } from './types';

export const Bangladesh: LevelConfig = {
  name: 'Bangladesh',
  id: 'BD',
  backgroundColor: '#006A4E',
  circleColor: '#F42A41',
  circleOffset: { r: -0.5, c: -1.5 },
  pattern: (r, c) => {
    const distToCenter = Math.sqrt(Math.pow(r - 8, 2) + Math.pow(c - 6, 2));
    return distToCenter < 4 ? 'circle' : 'background';
  },
};
