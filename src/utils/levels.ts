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
      // Strips: Black (top), White (mid), Green (bottom)
      // Triangle: Red (left)
      const isTriangle = c < (rows/2 - Math.abs(r - rows/2)) * 0.8;
      if (isTriangle) return 'RED';
      if (r < rows / 3) return 'BLACK';
      if (r < (rows / 3) * 2) return 'WHITE';
      return 'GREEN';
    },
  },
];
