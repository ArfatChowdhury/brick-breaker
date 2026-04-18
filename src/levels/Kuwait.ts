import { LevelConfig } from './types';

export const Kuwait: LevelConfig = {
  isoCode: 'kw',
  name: 'Kuwait Black Widow',
  id: 'KW_ELITE_V1',
  backgroundColor: '#007A3D',
  initialBallSpeed: 10.5,
  paddleSizeMultiplier: 0.8,
  gridRows: 24,

  pattern: (r, c, gridRows, gridCols) => {
    // 1. Black trapezoid on the left (Flag Iconography)
    const trapWidth = gridCols * 0.25;
    const slope = 3;
    if (c < trapWidth - Math.abs(r - 11.5) / slope) {
      return '#000000'; // Black section
    }

    // 2. Obstacle: The Wedge
    if (r > 6 && r < 17 && c > gridCols - 4) return 'STONE3';

    // Flag stripes
    if (r < 8) return '#007A3D'; // Green
    if (r < 16) return '#FFFFFF'; // White
    return '#CE1126'; // Red
  }
};
