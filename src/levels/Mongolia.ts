import { LevelConfig } from './types';

export const Mongolia: LevelConfig = {
  isoCode: 'mn',
  name: 'Mongolia Eternal Sky',
  id: 'MN_ELITE_V1',
  backgroundColor: '#DA2028',
  initialBallSpeed: 10.6,
  paddleSizeMultiplier: 0.75,
  gridRows: 24,

  pattern: (r, c, gridRows, gridCols) => {
    // Soyombo Symbol Logic - Center-Left position (approx)
    const isInSoyombo = (r >= 6 && r <= 17) && (c >= 2 && c <= 5);
    
    if (isInSoyombo) {
        // Horizontal Stone Bars in Symbol
        if (r === 6 || r === 11 || r === 17) return 'STONE3';
        // Vertical Pillars
        if (c === 2 || c === 5) return 'STONE3';
    }

    // Flag Vertical Stripes
    const colPercent = c / gridCols;
    if (colPercent < 0.33 || colPercent > 0.66) return '#DA2028'; // Red
    return '#003153'; // Blue center
  }
};
