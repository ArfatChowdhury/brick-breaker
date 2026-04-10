import { LevelConfig } from './types';

export const DiamondCore: LevelConfig = {
  name: 'Diamond Core',
  id: 'DIAMOND_CORE',
  backgroundColor: '#1A237E',
  pattern: (r, c) => {
    // Entrance Maze: Several narrow passages before reaching the shell
    if (r === 0 && (c < 2 || c > 3)) return 'STONE';
    if (r === 1 && (c < 9 || c > 10)) return 'STONE';

    const dr = Math.abs(r - 8);
    const dc = Math.abs(c - 7);
    const dist = dr + dc;
    if (dist < 3) return '#FFD700'; // Gold core
    if (dist === 4 || dist === 5) return 'STONE'; // Stone shell
    if (dist === 6) return 'WHITE'; // Outer rim
    return 'NONE';
  },
};
