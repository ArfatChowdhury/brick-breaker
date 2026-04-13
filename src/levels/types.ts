export interface LevelConfig {
  id: string;
  name: string;
  backgroundColor: string;
  circleColor?: string;
  circleOffset?: { r: number; c: number };
  pattern: (r: number, c: number, rows: number, cols: number) => string;
  // Future extensibility
  initialBallSpeed?: number;
  paddleSizeMultiplier?: number;
  gridRows?: number;
  gridCols?: number;
  mazeEnabled?: boolean;
  mazeRows?: number;
}
