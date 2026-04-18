import { LevelConfig } from './types';

export const Finland: LevelConfig = {
  isoCode: 'fi',
  name: 'Finland Frozen Cross',
  id: 'FI_ELITE_V1',
  backgroundColor: '#FFFFFF',
  initialBallSpeed: 10.4,
  paddleSizeMultiplier: 0.8,
  gridRows: 24,

  pattern: (r, c, gridRows, gridCols) => {
    // Nordic Cross dimensions
    const verticalBarX = Math.floor(gridCols * 0.35);
    const horizontalBarY = 11;

    // The Cross in Stone
    if (Math.abs(c - verticalBarX) < 1.6 || Math.abs(r - horizontalBarY) < 1.6) {
        return 'STONE3';
    }

    // Background white with blue cross (logic for bricks under stone cross)
    if (Math.abs(c - verticalBarX) < 3 || Math.abs(r - horizontalBarY) < 3) {
        return '#002F6C'; // Blue cross
    }
    
    return '#FFFFFF'; // White
  }
};
