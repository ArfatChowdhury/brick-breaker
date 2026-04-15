import { LevelConfig } from './types';

export const UK: LevelConfig = {
  name: 'UK Royal Elite',
  id: 'UK_ELITE_V1',
  backgroundColor: '#012169',
  initialBallSpeed: 9.2,
  paddleSizeMultiplier: 0.85,
  gridRows: 24,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. UK FORTRESS MASK (24 Rows x 20 Cols mapped)
    const UK_MASK = [
      "SSSSSSSS....SSSSSSSS", // 0: TOP ENTRY
      "S..................S", // 1
      "S.SSSSSSSSSSSSSSSS.S", // 2: OUTER RING
      "S.S..............S.S", // 3
      "S.S..B B B B B B.S.S", // 4: START OF FLAG
      "S.S..B B B B B B.S.S",
      "S.S..B B B B B B.S.S",
      "S.S..B B B B B B.S.S",
      "S.S..B B B B B B.S.S",
      "S.S..B B B B B B.S.S",
      "S.S..B B B B B B.S.S",
      "S.S..B B B B B B.S.S", // 11
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
    const maskChar = UK_MASK[r]?.[mappedC] || 'S';

    // 2. STONE WALL LOGIC
    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';
    if (maskChar === '.') return 'NONE'; 

    // 3. UNION JACK GEOMETRY (Rows 4-17, Cols 4-gridCols-5 approx)
    if (r >= 4 && r <= 17) {
      const cx = gridCols / 2;
      const cy = 10.5;
      
      const dx = Math.abs(c - cx);
      const dy = Math.abs(r - cy);

      // CENTER RED CROSS
      const isRedCross = dx < 1.2 || dy < 1.2;
      const isWhiteCross = dx < 2.5 || dy < 2.5;

      // DIAGONAL SALTIRES
      const slope = (13 / gridCols); // Normalized slope
      const isDiagonalWhite = Math.abs(dy - (dx * 0.8)) < 1.0;
      const isDiagonalRed = Math.abs(dy - (dx * 0.8)) < 0.4;

      if (isRedCross) return 'RED';
      if (isWhiteCross) return 'WHITE';
      if (isDiagonalRed) return 'RED';
      if (isDiagonalWhite) return 'WHITE';

      return 'background';
    }

    return 'background';
  },
};
