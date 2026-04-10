import { LevelConfig } from './types';

export const Japan: LevelConfig = {
  name: 'Japan',
  id: 'JP',
  backgroundColor: '#FFFFFF',
  circleColor: '#BC002D',
  pattern: (r, c) => {
    const distToCenter = Math.sqrt(Math.pow(r - 8, 2) + Math.pow(c - 7, 2));
    return distToCenter < 4 ? 'circle' : 'background';
  },
};
