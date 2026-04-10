import { LevelConfig } from './types';

export const Turkey: LevelConfig = {
  name: 'Turkey',
  id: 'TR',
  backgroundColor: '#E30A17',
  circleColor: '#FFFFFF',
  pattern: (r, c) => {
    // S-Curve Gauntlet: Block left, then block right
    if (r === 1 && c < 10) return 'STONE';
    if (r === 3 && c > 4) return 'STONE';

    const dist1 = Math.sqrt(Math.pow(r - 8, 2) + Math.pow(c - 6, 2));
    const dist2 = Math.sqrt(Math.pow(r - 8, 2) + Math.pow(c - 7, 2));
    const isCrescent = dist1 < 4 && dist2 > 3.2;
    const isStar = Math.abs(r - 8) + Math.abs(c - 10) < 1.5;
    return (isCrescent || isStar) ? 'circle' : 'background';
  },
};
