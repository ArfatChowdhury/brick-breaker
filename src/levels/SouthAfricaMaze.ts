import { LevelConfig } from './types';

export const SouthAfricaMaze: LevelConfig = {
  name: 'South Africa Pro',
  id: 'SA_MAZE_V4',
  backgroundColor: '#007A3D',
  initialBallSpeed: 10,
  paddleSizeMultiplier: 0.7,
  gridCols: 20,
  gridRows: 24,
  pattern: (r, c) => {
    // 1. SYMMETRICAL COLOR MAP (24 Rows x 20 Cols)
    const SA_COLORS = [
      "YGRRRRRRRRRRRRRRRRRR", // 0
      "KYGRRRRRRRRRRRRRRRRR", // 1
      "KYGRRRRRRRRRRRRRRRRR", // 2
      "KKYGRRRRRRRRRRRRRRRR", // 3
      "KKYWGRRRRRRRRRRRRRRR", // 4
      "KKKYGRRRRRRRRRRRRRRR", // 5
      "KKKYWGRRRRRRRRRRRRRR", // 6
      "KKKKYWGRRRRRRRRRRRRR", // 7
      "KKKKYWGRRRRRRRRRRRRR", // 8
      "KKKKYWWGRRRRRRRRRRRR", // 9
      "KKKKKYWWGWWWWWWWWWWW", // 10
      "KKKKKYWWGGGGGGGGGGGG", // 11
      "KKKKKYWWGGGGGGGGGGGG", // 12
      "KKKKKYWWGWWWWWWWWWWW", // 13
      "KKKKYWWGBBBBBBBBBBBB", // 14
      "KKKKYWGBBBBBBBBBBBBB", // 15
      "KKKKYWGBBBBBBBBBBBBB", // 16
      "KKKYWGBBBBBBBBBBBBBB", // 17
      "KKKYGBBBBBBBBBBBBBBB", // 18
      "KKYWGBBBBBBBBBBBBBBB", // 19
      "KKYGBBBBBBBBBBBBBBBB", // 20
      "KYGBBBBBBBBBBBBBBBBB", // 21
      "KYGBBBBBBBBBBBBBBBBB", // 22
      "YGBBBBBBBBBBBBBBBBBB", // 23
    ];

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
      "S.SSSSSSSSSSSSSSS.S", // 18: START OF MAZE (Reduced from 16)
      "S...S...S...S...S.S", // 19
      "S.S.S.S.S.S.S.S.S.S", // 20
      "S.S.S.S.S.S.S.S.S.S", // 21
      "SCCCCCCCCCCCCCCCCCCS", // 22
      "SSSSSSSSS...SSSSSSSS", // 23: ENTRANCE
    ];

    const maskChar = MAZE_MASK[r]?.[c];
    if (maskChar === '.') return 'NONE';
    if (maskChar === 'S') return 'STONE3';

    const colorChar = SA_COLORS[r]?.[c] || 'G';
    const colorMap: Record<string, string> = {
      'R': 'RED', 'B': 'BLUE', 'G': 'GREEN',
      'W': 'WHITE', 'K': 'BLACK', 'Y': 'GOLD'
    };

    return colorMap[colorChar] || 'GREEN';
  }
};
