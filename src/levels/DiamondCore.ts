import { LevelConfig } from './types';

export const DiamondCore: LevelConfig = {
  name: 'Diamond Core',
  id: 'DIAMOND_CORE',
  backgroundColor: '#1A237E',
  pattern: (r, c) => {
    const dr = Math.abs(r - 8);
    const dc = Math.abs(c - 7);
    const dist = dr + dc;
    if (dist < 3) return '#FFD700';
    if (dist === 4 || dist === 5) return 'STONE';
    if (dist === 6) return 'WHITE';
    return 'NONE';
  },
};
