import { LevelConfig } from './types';

export const Nigeria: LevelConfig = {
  isoCode: 'ng',
  name: 'Nigeria Ivory Corridor',
  id: 'NG_ELITE_V1',
  backgroundColor: '#008751',
  initialBallSpeed: 10.2,
  paddleSizeMultiplier: 0.75,
  gridRows: 24,

  pattern: (r, c, gridRows, gridCols) => {
    // 1. Dual Corridor Labyrinth (Vertical)
    const isLabyrinth = r > 18;
    if (isLabyrinth) {
      if (c === 4 || c === gridCols - 5) return 'STONE3';
      if ((r === 20 || r === 22) && (c < 4 || c > gridCols - 5)) return 'STONE3';
    }

    // Nigeria Vertical Stripes
    const colPercent = c / gridCols;
    if (colPercent < 0.33 || colPercent > 0.66) return '#008751'; // Green
    return '#FFFFFF'; // White
  }
};
