import { LevelConfig } from './types';

export const SouthKorea: LevelConfig = {
  name: 'South Korea',
  id: 'KR',
  backgroundColor: '#FFFFFF',
  pattern: (r, c) => {
    // Trigrams are already STONE — adding a central stone guard above the symbol
    if (r < 3 && (c === 6 || c === 7)) return 'STONE';

    const distToCenter = Math.sqrt(Math.pow(r - 8, 2) + Math.pow(c - 7, 2));
    if (distToCenter < 4) return r < 8 ? 'RED' : 'BLUE';
    const isTL = r < 4 && c < 4;
    const isTR = r < 4 && c > 10;
    const isBL = r > 12 && c < 4;
    const isBR = r > 12 && c > 10;
    if (isTL || isTR || isBL || isBR) return 'STONE';
    return 'background';
  },
};
