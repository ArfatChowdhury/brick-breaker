import { LevelConfig } from './types';

export const USA: LevelConfig = {
  name: 'USA',
  id: 'US',
  backgroundColor: '#B22234',
  pattern: (r, c, rows, cols) => {
    const isCanton = r < rows / 2 && c < cols / 2;
    if (isCanton) return 'BLUE';
    return (r % 2 === 0) ? 'background' : 'WHITE';
  },
};
