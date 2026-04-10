import { LevelConfig } from './types';

export const SaudiArabia: LevelConfig = {
  name: 'Saudi Arabia',
  id: 'SA',
  backgroundColor: '#165D31',
  pattern: (r, c, rows, cols) => {
    // Twin Pillar Gauntlet: Two central stone columns blocking direct hits
    if (r < 5 && (c === 5 || c === 8)) return 'STONE';

    const isSword = r === 12 && c > 3 && c < 11;
    const isScript = r > 6 && r < 10 && c > 4 && c < 10;
    return (isSword || isScript) ? 'WHITE' : 'background';
  },
};
