import { LevelConfig } from './types';

export const SouthKorea: LevelConfig = {
  flagColors: ['#FFFFFF', '#CD2E3A', '#003478'],
  flagOrientation: 'h',
  name: 'South Korea Taeguk Elite',
  id: 'KR_ELITE_V1',
  backgroundColor: '#FFFFFF',
  initialBallSpeed: 9.3,
  paddleSizeMultiplier: 0.8,
  gridRows: 24,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. SOUTH KOREA MASK (24 Rows x 20 Cols mapped)
    const KR_MASK = [
      "SSSSSSSS....SSSSSSSS", // 0: TOP ENTRY
      "S..................S", // 1
      "S.SSSSSSSSSSSSSSSS.S", // 2: OUTER RING
      "S.S..............S.S", // 3
      "S.S..B B B B B B.S.S", // 4: START OF WHITE
      "S.S..B B B B B B.S.S",
      "S.S..B B B B B B.S.S",
      "S.S..B B B B B B.S.S",
      "S.S..B B B B B B.S.S",
      "S.S..B B B B B B.S.S",
      "S.S..B B B B B B.S.S",
      "S.S..B B B B B B.S.S",
      "S.S..B B B B B B.S.S",
      "S.S..B B B B B B.S.S",
      "S.S..B B B B B B.S.S",
      "S.S..B B B B B B.S.S",
      "S.S..B B B B B B.S.S",
      "S.S..B B B B B B.S.S",
      "S.S..............S.S", // 18
      "S.SSSSSSSSSSSSSSSS.S", // 19: LOWER RING
      "S..................S", // 20
      "S........SS........S", // 21: BOTTOM GUARD
      "SSSSSSSSSSSSSSSSSSSS", // 23: SEALED BOTTOM
    ];

    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = KR_MASK[r]?.[mappedC] || 'S';

    // 2. STONE WALL LOGIC
    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';
    if (maskChar === '.') return 'NONE'; 

    // 3. FLAG GEOMETRY (Rows 4-17)
    if (r >= 4 && r <= 17) {
      const cx = gridCols / 2;
      const cy = 10.5;
      
      const dx = Math.abs(c - cx);
      const dy = Math.abs(r - cy);

      // CORNER TRIGRAMS (Permanent Stone)
      const isTrigramTL = r < 7 && c < (gridCols * 0.3);
      const isTrigramTR = r < 7 && c > (gridCols * 0.7);
      const isTrigramBL = r > 15 && c < (gridCols * 0.3);
      const isTrigramBR = r > 15 && c > (gridCols * 0.7);
      
      if (isTrigramTL || isTrigramTR || isTrigramBL || isTrigramBR) {
        return 'STONE'; // Permanent black obstacles
      }

      // CENTRAL TAEGUK
      const dist = Math.sqrt(Math.pow(dy * 1.2, 2) + Math.pow(dx, 2));
      if (dist < gridCols * 0.18) {
        // Simple wave divider logic
        const wave = Math.sin((c - cx) * 0.8) * 1.5;
        return (r < cy + wave) ? 'RED' : 'BLUE';
      }

      return 'background';
    }

    return 'background';
  },
};
