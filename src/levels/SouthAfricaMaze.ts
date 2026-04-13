import { LevelConfig } from './types';

export const SouthAfricaMaze: LevelConfig = {
  name: 'South Africa Pro',
  id: 'SA_MAZE_V4',
  backgroundColor: '#007A3D',
  initialBallSpeed: 10,
  paddleSizeMultiplier: 0.7,
  gridCols: 20,
  gridRows: 24,
  pattern: (r, c, gridRows, gridCols) => {
    // 2. MAZE MASK (24 Rows x 20 Cols)
    const MAZE_MASK = [
      "SSSSSSSSSSSSSSSSSSSS", // 0
      "SCCCCCCCCCCCCCCCCCCS", // 1
      "SCCCCCCCCCCCCCCCCCCS", // 2
      "SCCCCCCCCCCCCCCCCCCS", // 3
      "SCCCCCCCCCCCCCCCCCCS", // 4
      "SCCCCCCCCCCCCCCCCCCS", // 5
      "SCCCCCCCCCCCCCCCCCCS", // 6
      "SCCCCCCCCCCCCCCCCCCS", // 7
      "SCCCCCCCCCCCCCCCCCCS", // 8
      "SCCCCCCCCCCCCCCCCCCS", // 9
      "SCCCCCCCCCCCCCCCCCCS", // 10
      "SCCCCCCCCCCCCCCCCCCS", // 11
      "SCCCCCCCCCCCCCCCCCCS", // 12
      "SCCCCCCCCCCCCCCCCCCS", // 13
      "SCCCCCCCCCCCCCCCCCCS", // 14
      "SCCCCCCCCCCCCCCCCCCS", // 15
      "SCCCCCCCCCCCCCCCCCCS", // 16
      "SCCCCCCCCCCCCCCCCCCS", // 17
      "S.SSSSSSSSSSSSSSS.S", // 18: START OF MAZE
      "S...S...S...S...S.S", // 19
      "S.S.S.S.S.S.S.S.S.S", // 20
      "S.S.S.S.S.S.S.S.S.S", // 21
      "SCCCCCCCCCCCCCCCCCCS", // 22
      "SSSSSSSSSSSSSSSSSSSS", // 23: SEALED BOTTOM
    ];

    const maskChar = MAZE_MASK[r]?.[c];
    if (maskChar === '.') return 'NONE';
    if (maskChar === 'S') return 'STONE3';

    // 1. DYNAMIC COLOR CALCULATION for Diagonal Y
    // Middle horizontal line is at row 11-12
    const middleY = 11.5;
    const distFromMiddle = Math.abs(r - middleY);
    
    // Triangle (Black with Gold border)
    // Triangle is on the left, growing to about col 7 at the middle
    const triangleWidth = Math.max(0, 7.5 - distFromMiddle * 0.65);
    if (c < triangleWidth - 1) return 'BLACK';
    if (c < triangleWidth) return 'GOLD';

    // Green Y arms (Diagonal)
    // The arms start from top-left and bottom-left and converge to the middle horizontal bar
    // At c=8, they should be near the middle (distFromMiddle ~ 1)
    // At c=0, they should be at the top/bottom (distFromMiddle ~ 11)
    // Formula: distFromMiddle < (8 - c) * 1.5 ?
    const armWidthAtC = (7.5 - c) * 1.5;
    const isInsideArm = distFromMiddle < armWidthAtC + 2;
    const isInsideGreen = distFromMiddle < armWidthAtC + 1;

    // Horizontal part of the Y (starting after triangle)
    if (c >= 7 && distFromMiddle < 2.5) {
        if (distFromMiddle < 1.5) return 'GREEN';
        return 'WHITE';
    }

    // Diagonal arms
    if (c < 8 && isInsideArm) {
        if (isInsideGreen) return 'GREEN';
        return 'WHITE';
    }

    // Top Red, Bottom Blue
    return r < middleY ? 'RED' : 'BLUE';
  }
};
