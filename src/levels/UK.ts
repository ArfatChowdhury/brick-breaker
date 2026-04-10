import { LevelConfig } from './types';

export const UK: LevelConfig = {
  name: 'UK',
  id: 'UK',
  backgroundColor: '#012169',
  pattern: (r, c, rows, cols) => {
    // Crosshair Gauntlet: Stone cross blocking the center
    if (r < 6 && (c === 6 || c === 7)) return 'STONE';
    if (c < 6 && (r === 3 || r === 4)) return 'STONE';
    if (c > 7 && (r === 3 || r === 4)) return 'STONE';

    const isCross = r === Math.floor(rows / 2) || r === Math.floor(rows / 2) - 1 || c === Math.floor(cols / 2) || c === Math.floor(cols / 2) - 1;
    const isSaltaire = Math.abs(r - c * (rows/cols)) < 1.5 || Math.abs(r - (cols - c) * (rows/cols)) < 1.5;
    if (isCross) return 'RED';
    if (isSaltaire) return 'RED';
    return (Math.abs(r - c) < 3 || Math.abs(r - (cols - c)) < 3) ? 'WHITE' : 'background';
  },
};
