import { LevelConfig } from './types';

export const USA: LevelConfig = {
  name: 'USA',
  id: 'US',
  backgroundColor: '#002868',
  mazeEnabled: true,
  mazeRows: 10,
  pattern: (r, c, rows, cols) => {
    // Zig-Zag Gauntlet: Alternating stone blocks on sides
    if (r === 1 && c < 5) return 'STONE';
    if (r === 3 && c > cols - 6) return 'STONE';
    if (r === 5 && c < 5) return 'STONE';

    const isCanton = r < rows / 2 && c < cols / 2;
    if (isCanton) return 'BLUE';
    return (r % 2 === 0) ? 'background' : 'WHITE';
  },
};
