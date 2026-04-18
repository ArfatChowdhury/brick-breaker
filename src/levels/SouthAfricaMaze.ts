import { LevelConfig } from './types';

export const SouthAfricaMaze: LevelConfig = {
  flagColors: ['#007A4D', '#000000', '#FFB81C'],
  flagOrientation: 'h',
  isoCode: 'za',
  name: 'South Africa Pro',
  id: 'SA_MAZE_V4',
  backgroundColor: '#007A3D',
  initialBallSpeed: 10,
  paddleSizeMultiplier: 0.7,
  // gridCols is strictly dynamic now
  gridRows: 24,
  pattern: (r, c, gridRows, gridCols) => {
    // 2. MAZE MASK (24 Rows x 20 Cols mapped)
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

    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = MAZE_MASK[r]?.[mappedC] || 'S';
    
    if (maskChar === '.') return 'NONE';
    if (maskChar === 'S' || c === 0 || c === gridCols - 1) return 'STONE3';

    // 1. DYNAMIC COLOR CALCULATION for Diagonal Y
    // Middle horizontal line is at row 11-12
    const middleY = 11.5;
    const distFromMiddle = Math.abs(r - middleY);
    
    // Triangle (Black with Gold border)
    // Scale the triangle width dynamically based on layout
    const baseTriangleWidth = gridCols * 0.375; // ~7.5/20
    const triangleSlope = distFromMiddle * 0.65 * (gridCols / 20);
    const triangleWidth = Math.max(0, baseTriangleWidth - triangleSlope);

    if (c < triangleWidth - 1) return 'BLACK';
    if (c < triangleWidth) return 'GOLD';

    // Green Y arms (Diagonal)
    const armSlope = (baseTriangleWidth - c) * 1.5;
    const armWidth = 2 * (gridCols / 20); // Scale the thickness slightly
    const greenWidth = 1 * (gridCols / 20);

    const isInsideArm = distFromMiddle < armSlope + armWidth;
    const isInsideGreen = distFromMiddle < armSlope + greenWidth;

    // Horizontal part of the Y (starting after triangle)
    if (c >= baseTriangleWidth - 0.5 && distFromMiddle < armWidth + 0.5) {
        if (distFromMiddle < greenWidth + 0.5) return 'GREEN';
        return 'WHITE';
    }

    // Diagonal arms
    if (c < baseTriangleWidth && isInsideArm) {
        if (isInsideGreen) return 'GREEN';
        return 'WHITE';
    }

    // Top Red, Bottom Blue
    return r < middleY ? 'RED' : 'BLUE';
  }
};
