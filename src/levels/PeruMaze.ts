import { LevelConfig } from './types';

export const PeruMaze: LevelConfig = {
  isoCode: 'pe',
  name: 'Peru Random Labyrinth',
  id: 'PERU_MAZE_V1',
  backgroundColor: '#D91023',
  initialBallSpeed: 10,
  paddleSizeMultiplier: 0.8,
  
  gridRows: 10, // Top flag section height
  mazeEnabled: true, // Triggers DFS Random Labyrinth engine!
  mazeRows: 14, // Extremely dense 14-row randomized catacombs

  pattern: (r, c, gridRows, gridCols) => {
    // Determine the layout for the 3 vertical stripes of Peru's Flag
    const sectionWidth = gridCols / 3;

    if (c < sectionWidth) return '#D91023'; // Crimson Red Left
    if (c < sectionWidth * 2) return '#FFFFFF'; // White Center
    return '#D91023'; // Crimson Red Right
  }
};
