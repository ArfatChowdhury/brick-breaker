/**
 * Recursive Backtracker (DFS) Maze Generator
 * Generates a solvable maze layout for the brick grid.
 * 'S' = Stone Brick (Wall)
 * '.' = Empty Space (Path)
 */
export function generateMaze(rows: number, cols: number): string[] {
  // Initialize grid with all walls
  const grid: string[][] = Array(rows).fill(null).map(() => Array(cols).fill('S'));

  // Directions: [row, col]
  const dirs = [[0, 2], [0, -2], [2, 0], [-2, 0]];

  function isValid(r: number, c: number) {
    return r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c] === 'S';
  }

  function shuffle(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function walk(r: number, c: number) {
    grid[r][c] = '.';

    const shuffledDirs = shuffle([...dirs]);
    for (const [dr, dc] of shuffledDirs) {
      const nr = r + dr;
      const nc = c + dc;

      if (isValid(nr, nc)) {
        // Carve through the wall between cells
        grid[r + dr / 2][c + dc / 2] = '.';
        walk(nr, nc);
      }
    }
  }

  // Start carving from a random internal cell (ensure indices are even to stay on grid)
  const startR = Math.floor(Math.random() * (rows / 2)) * 2;
  const startC = Math.floor(Math.random() * (cols / 2)) * 2;
  walk(startR, startC);

  // 1. Seal Top and Bottom rows completely (except where entries might be needed)
  // Actually, for brick breaker, it's better to have a fully sealed bottom boundary
  // as per the user's request: "dont want any other enternce from bottom"
  for (let c = 0; c < cols; c++) {
    grid[0][c] = 'S';
    grid[rows - 1][c] = 'S';
  }

  // 2. Open SIDE entrances (Left and Right)
  // Choose random even rows for the entrances
  const leftEntryRow = Math.floor(Math.random() * ((rows - 2) / 2)) * 2 + 1;
  const rightEntryRow = Math.floor(Math.random() * ((rows - 2) / 2)) * 2 + 1;

  // Make sure they are connected to the central maze path
  grid[leftEntryRow][0] = '.';
  grid[leftEntryRow][1] = '.';
  grid[rightEntryRow][cols - 1] = '.';
  grid[rightEntryRow][cols - 2] = '.';

  // Convert to array of strings
  return grid.map(row => row.join(''));
}
