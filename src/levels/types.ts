export interface LevelConfig {
  id: string;
  name: string;
  backgroundColor: string;
  circleColor?: string;
  circleOffset?: { r: number; c: number };
  pattern: (r: number, c: number, rows: number, cols: number) => string;
  // Flag preview (shown in level select)
  flagColors?: string[];         // Main flag colors left→right or top→bottom
  flagOrientation?: 'h' | 'v';  // h = horizontal bands, v = vertical bands
  starThresholds?: [number, number]; // [secondsFor3Stars, secondsFor2Stars]
  // Future extensibility
  initialBallSpeed?: number;
  paddleSizeMultiplier?: number;
  gridRows?: number;
  gridCols?: number;
  mazeEnabled?: boolean;
  mazeRows?: number;
}
