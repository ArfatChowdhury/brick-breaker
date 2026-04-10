import { LevelConfig } from './types';

export const SaudiArabia: LevelConfig = {
  name: 'Saudi Arabia',
  id: 'SA',
  backgroundColor: '#165D31',
  pattern: (r, c, rows, cols) => {
    const isSword = r === 12 && c > 3 && c < 11;
    const isScript = r > 6 && r < 10 && c > 4 && c < 10;
    return (isSword || isScript) ? 'WHITE' : 'background';
  },
};
