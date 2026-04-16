import { LevelConfig } from './types';

export const WorldTourFinale: LevelConfig = {
  name: 'World Tour Finale: The Grand Core',
  id: 'WT_FINALE_V1',
  backgroundColor: '#000000', // Pitch Black
  initialBallSpeed: 10.5, // Fastest in the game!
  paddleSizeMultiplier: 0.7, // Hardest paddle
  gridRows: 26,
  pattern: (r, c, gridRows, gridCols) => {
    // 1. FINALE FORTRESS MASK (Boss Core)
    // Extremely heavily guarded, narrow entry.
    const BF_MASK = [
      "SSSSSSSS....SSSSSSSS", // 0: NARROW ENTRY
      "SSSSSSSS....SSSSSSSS", // 1
      "SSSSSSS......SSSSSSS", // 2
      "SSSSSS........SSSSSS", // 3
      "SSSSS..........SSSSS", // 4
      "SSSS.SFFFFFFFFS.SSSS", // 5: INNER SANCTUM START
      "SSS.SFFFFFFFFFFS.SSS", // 6
      "SS.SFFFFFFFFFFFFS.SS", // 7
      "S.SFFFFFFFFFFFFFFS.S", // 8
      "S.SFFFFFFFFFFFFFFS.S", // 9
      "S.SFFFFFFFFFFFFFFS.S", // 10
      "S.SFFFFFFFFFFFFFFS.S", // 11
      "S.SFFFFFFFFFFFFFFS.S", // 12
      "S.SFFFFFFFFFFFFFFS.S", // 13
      "S.SFFFFFFFFFFFFFFS.S", // 14
      "S.SFFFFFFFFFFFFFFS.S", // 15
      "SS.SFFFFFFFFFFFFS.SS", // 16
      "SSS.SFFFFFFFFFFS.SSS", // 17
      "SSSS.SFFFFFFFFS.SSSS", // 18: INNER SANCTUM END
      "SSSSS..........SSSSS", // 19
      "SSSSSS........SSSSSS", // 20
      "SSSSSSS......SSSSSSS", // 21
      "SSSSSSSS....SSSSSSSS", // 22: HEAVY GUARD
      "SSSSSSSSS..SSSSSSSSS", // 23: PINCH
      "SSSSSSSSSSSSSSSSSSSS", // 24: SEALED BOTTOM
      "SSSSSSSSSSSSSSSSSSSS", // 25
    ];

    const MASK_WIDTH = 20;
    const mappedC = Math.floor((c / gridCols) * MASK_WIDTH);
    const maskChar = BF_MASK[r]?.[mappedC] || 'S';

    // The boss uses exclusively STONE3 (highest break requirement)
    if (maskChar === 'S' || c <= 1 || c >= gridCols - 2) return 'STONE3';
    if (maskChar === '.') return 'NONE'; 

    // 3. BOSS DESIGN (Golden Crown)
    if (r >= 5 && r <= 18) {
      const colPercent = (c / gridCols);
      
      // GOLDEN CROWN PIXEL ART LOGIC
      // Base of crown around row 14-16
      if (r >= 14 && r <= 15 && colPercent >= 0.25 && colPercent <= 0.75) {
          return '#D4AF37'; // Golden Base
      }
      
      // 3 Crown Points (Left, Center, Right)
      if (r >= 9 && r <= 13) {
          // Left point
          if (colPercent >= 0.25 && colPercent <= 0.30 && r >= 10 + (colPercent - 0.25)*20) return '#D4AF37';
          // Center point
          if (colPercent >= 0.45 && colPercent <= 0.55 && r >= 9 + Math.abs(colPercent - 0.5)*20) return '#D4AF37';
          // Right point
          if (colPercent >= 0.70 && colPercent <= 0.75 && r >= 10 + (0.75 - colPercent)*20) return '#D4AF37';
      }

      // Jewels (Red and White)
      if (r === 15) {
          if (Math.abs(colPercent - 0.35) < 0.02) return '#ED1C24'; // Red ruby
          if (Math.abs(colPercent - 0.50) < 0.02) return 'WHITE';   // Diamond
          if (Math.abs(colPercent - 0.65) < 0.02) return '#0033A0'; // Sapphire
      }

      return '#000000'; // Black void background
    }

    return 'background';
  },
};
