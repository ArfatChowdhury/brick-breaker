import { LevelConfig } from './types';

export const Nepal: LevelConfig = {
  name: 'Nepal',
  id: 'NP',
  backgroundColor: '#DC143C',
  pattern: (r, c, rows, cols) => {
    const maxCtop = (r / 8) * cols;
    const maxCbot = ((r - 8) / 8) * cols;
    const isInTop = r < 8 && c < maxCtop;
    const isInBot = r >= 8 && c < maxCbot;
    if (!isInTop && !isInBot) return 'NONE'; 
    const isSun = r === 12 && c === 3;
    const isMoon = r === 4 && c === 3;
    return (isSun || isMoon) ? 'WHITE' : 'background';
  },
};
