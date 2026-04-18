import { LevelConfig } from './types';

export const Ethiopia: LevelConfig = {
  isoCode: 'et',
  name: 'Ethiopia Star Fortress',
  id: 'ET_ELITE_V1',
  backgroundColor: '#0039A6',
  initialBallSpeed: 9.8,
  paddleSizeMultiplier: 0.85,
  gridRows: 24,

  pattern: (r, c, gridRows, gridCols) => {
    // Central Star logic (Magen David style but with a circle)
    const centerX = gridCols / 2;
    const centerY = 12;
    const dist = Math.sqrt(Math.pow(c - centerX, 2) + Math.pow(r - centerY, 2));

    // Outer Stone Ring
    if (dist > 4 && dist < 5.5) return 'STONE3';
    
    // Central Star (Simplified)
    if (dist < 2.5) return 'STONE3';

    // Ethiopia Tri-color stripes
    if (r < 8) return '#009E49'; // Green
    if (r < 16) return '#FCD116'; // Yellow
    return '#EF1C24'; // Red
  }
};
