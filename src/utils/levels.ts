export const FLAG_LEVELS = [
  {
    name: 'Bangladesh',
    id: 'BD',
    backgroundColor: '#006A4E',
    circleColor: '#F42A41',
    circleOffset: { r: -0.5, c: -1.5 }, // Offset to match real flag center
    pattern: (r: number, c: number) => {
      const distToCenter = Math.sqrt(Math.pow(r - 8, 2) + Math.pow(c - 6, 2));
      return distToCenter < 4 ? 'circle' : 'background';
    },
  },
  {
    name: 'Japan',
    id: 'JP',
    backgroundColor: '#FFFFFF',
    circleColor: '#BC002D',
    pattern: (r: number, c: number) => {
      const distToCenter = Math.sqrt(Math.pow(r - 8, 2) + Math.pow(c - 7, 2));
      return distToCenter < 4 ? 'circle' : 'background';
    },
  },
  {
    name: 'Turkey',
    id: 'TR',
    backgroundColor: '#E30A17',
    circleColor: '#FFFFFF',
    pattern: (r: number, c: number) => {
      // Crescent check: white circle - red circle
      const dist1 = Math.sqrt(Math.pow(r - 8, 2) + Math.pow(c - 6, 2));
      const dist2 = Math.sqrt(Math.pow(r - 8, 2) + Math.pow(c - 7, 2));
      const isCrescent = dist1 < 4 && dist2 > 3.2;
      
      // Minimal Star (diamond shape)
      const isStar = Math.abs(r - 8) + Math.abs(c - 10) < 1.5;
      
      return (isCrescent || isStar) ? 'circle' : 'background';
    },
  },
  {
    name: 'Palestine',
    id: 'PS',
    backgroundColor: '#FFFFFF',
    pattern: (r: number, c: number, rows: number, cols: number) => {
      const isTriangle = c < (rows/2 - Math.abs(r - rows/2)) * 0.8;
      if (isTriangle) return 'RED';
      if (r < rows / 3) return 'BLACK';
      if (r < (rows / 3) * 2) return 'WHITE';
      return 'GREEN';
    },
  },
  {
    name: 'Saudi Arabia',
    id: 'SA',
    backgroundColor: '#165D31',
    pattern: (r: number, c: number, rows: number, cols: number) => {
      // Script and Sword representation
      const isSword = r === 12 && c > 3 && c < 11;
      const isScript = r > 6 && r < 10 && c > 4 && c < 10;
      return (isSword || isScript) ? 'WHITE' : 'background';
    },
  },
  {
    name: 'USA',
    id: 'US',
    backgroundColor: '#B22234',
    pattern: (r: number, c: number, rows: number, cols: number) => {
      const isCanton = r < rows / 2 && c < cols / 2;
      if (isCanton) return 'BLUE';
      return (r % 2 === 0) ? 'background' : 'WHITE'; // Stripes
    },
  },
  {
    name: 'Nepal',
    id: 'NP',
    backgroundColor: '#DC143C',
    pattern: (r: number, c: number, rows: number, cols: number) => {
      // Non-rectangular shape: two triangles
      const maxCtop = (r / 8) * cols;
      const maxCbot = ((r - 8) / 8) * cols;
      
      const isInTop = r < 8 && c < maxCtop;
      const isInBot = r >= 8 && c < maxCbot;
      
      if (!isInTop && !isInBot) return 'NONE'; 
      
      const isSun = r === 12 && c === 3;
      const isMoon = r === 4 && c === 3;
      
      return (isSun || isMoon) ? 'WHITE' : 'background';
    },
  },
  {
    name: 'The Fortress',
    id: 'FORTRESS',
    backgroundColor: '#37474F',
    pattern: (r: number, c: number, rows: number, cols: number) => {
      // SHAPE: Solid stone walls on sides, narrow entry in middle
      const isWall = (c < 5 || c > cols - 6) && r > 2;
      const isGuard = r === 2 && (c === 6 || c === 7); // Center guard
      
      if (isWall || isGuard) return 'STONE';
      
      // Reward bricks inside
      if (r > 6 && r < 10 && c > 5 && c < 9) return 'WHITE';
      
      return 'background';
    },
  },
];
