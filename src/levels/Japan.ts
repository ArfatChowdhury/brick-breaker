import { LevelConfig } from './types';

// Japan: Simple white/red — narrow center entry with V-shaped stone guards
export const Japan: LevelConfig = {
  name: 'Japan',
  id: 'JP',
  backgroundColor: '#FFFFFF',
  circleColor: '#BC002D',
  mazeEnabled: true,
  mazeRows: 10,
  pattern: (r, c, rows, cols) => {
    // V-shaped entry: only center 4 columns open at top, wider lower down
    if (r === 0) return 'STONE'; // Top border all stone
    if (r === 2 && (c < 4 || c > 9)) return 'STONE';
    if (r === 4 && (c < 2 || c > 11)) return 'STONE';

    const distToCenter = Math.sqrt(Math.pow(r - 8, 2) + Math.pow(c - 7, 2));
    return distToCenter < 4 ? 'circle' : 'background';
  },
};
