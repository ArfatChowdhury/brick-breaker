import { LevelConfig } from './types';

export const Brazil: LevelConfig = {
  name: 'Brazil Ordem Elite',
  id: 'BR_ELITE_V2', // Refined version
  backgroundColor: '#00B32C', 
  initialBallSpeed: 9.3,
  paddleSizeMultiplier: 0.8,
  gridRows: 26,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. BRAZIL FORTRESS MASK (26 Rows)
    const BR_MASK = [
      "SSSSSSSS....SSSSSSSS", // 0: TOP ENTRY
      "S..................S", // 1
      "S.SSSSSSSSSSSSSSSS.S", // 2: OUTER RING
      "S.S..............S.S", // 3
      "S.S..GGGGGGGGGGGG.S.S", // 4: START OF FLAG
      "S.S..GGGGGGGGGGGG.S.S",
      "S.S..GGGGGGGGGGGG.S.S",
      "S.S..GGGGGGGGGGGG.S.S",
      "S.S..GGGGGGGGGGGG.S.S",
      "S.S..GGGGGGGGGGGG.S.S",
      "S.S..GGGGGGGGGGGG.S.S",
      "S.S..GGGGGGGGGGGG.S.S",
      "S.S..GGGGGGGGGGGG.S.S",
      "S.S..GGGGGGGGGGGG.S.S",
      "S.S..GGGGGGGGGGGG.S.S",
      "S.S..GGGGGGGGGGGG.S.S",
      "S.S..GGGGGGGGGGGG.S.S",
      "S.S..GGGGGGGGGGGG.S.S",
      "S.S..GGGGGGGGGGGG.S.S",
      "S.S..GGGGGGGGGGGG.S.S",
      "S.S..............S.S", // 20
      "S.SSSSSSSSSSSSSSSS.S", // 21: LOWER RING
      "S..................S", // 22
      "S........SS........S", // 23: BOTTOM GUARD
      "S..................S", // 24
      "SSSSSSSSSSSSSSSSSSSS", // 25: SEALED BOTTOM
    ];

    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = BR_MASK[r]?.[mappedC] || 'S';

    // 2. STONE WALL LOGIC
    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';
    if (maskChar === '.') return 'NONE'; 

    // 3. FLAG GEOMETRY (Rows 4-20)
    if (r >= 4 && r <= 20) {
      const cx = gridCols / 2;
      const cy = 12.0;
      
      const dx = Math.abs(c - cx);
      const dy = Math.abs(r - cy);

      // BLUE CIRCLE (Vibrant Blue)
      const dist = Math.sqrt(Math.pow(dy * 1.25, 2) + Math.pow(dx, 2));
      const radius = gridCols * 0.17;
      const isCircle = dist < radius;
      // White slogan hint
      const isSlogan = dist < radius && Math.abs(dy - (dx * 0.2)) < 0.6 && r >= 11 && r <= 13;

      // YELLOW DIAMOND (Large & Bold)
      const diamondVal = (dy / 8.5) + (dx / (gridCols * 0.44));
      const isDiamond = diamondVal < 1.0;

      if (isSlogan) return 'WHITE';
      if (isCircle) return '#002271';
      if (isDiamond) return '#FFD700'; // Vibrant Gold
      return 'background';
    }

    return 'background';
  },
};
