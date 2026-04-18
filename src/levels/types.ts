export interface LevelConfig {
  id: string;
  name: string;
  backgroundColor: string;
  circleColor?: string;
  circleOffset?: { r: number; c: number };
  pattern: (r: number, c: number, rows: number, cols: number) => string;
  // Flag preview (shown in level select)
  isoCode?: string;              // ISO code for SVG loader (e.g. 'co', 'jp')
  flagColors?: string[];         // Main flag colors left→right or top→bottom
  flagOrientation?: 'h' | 'v';  // h = horizontal bands, v = vertical bands
  flagRatios?: number[];         // e.g. [2, 1, 1] for Colombia
  flagSymbol?: 'circle' | 'moon' | 'none';
  flagSymbolColor?: string;
  starThresholds?: [number, number]; // [secondsFor3Stars, secondsFor2Stars]  // Future extensibility
  initialBallSpeed?: number;
  paddleSizeMultiplier?: number;
  gridRows?: number;
  gridCols?: number;
  mazeEnabled?: boolean;
  mazeRows?: number;
}
