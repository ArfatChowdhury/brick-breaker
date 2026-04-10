import { LevelConfig } from './types';

export const UK: LevelConfig = {
  name: 'UK',
  id: 'UK',
  backgroundColor: '#012169',
  pattern: (r, c, rows, cols) => {
    const isCross = r === Math.floor(rows / 2) || r === Math.floor(rows / 2) - 1 || c === Math.floor(cols / 2) || c === Math.floor(cols / 2) - 1;
    const isSaltaire = Math.abs(r - c * (rows/cols)) < 1.5 || Math.abs(r - (cols - c) * (rows/cols)) < 1.5;
    if (isCross) return 'RED';
    if (isSaltaire) return 'RED';
    return (Math.abs(r - c) < 3 || Math.abs(r - (cols - c)) < 3) ? 'WHITE' : 'background';
  },
};
