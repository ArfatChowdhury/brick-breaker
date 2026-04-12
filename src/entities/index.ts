import React from 'react';
import { Dimensions } from 'react-native';
import Paddle from '../components/Paddle';
import Ball from '../components/Ball';
import Brick from '../components/Brick';
import ScoreBoard from '../components/ScoreBoard';
import PowerUp from '../components/PowerUp';

import { FLAG_LEVELS } from '../levels';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Game Constants
export const PADDLE_WIDTH = SCREEN_WIDTH * 0.25;
export const PADDLE_HEIGHT = 20;
export const BALL_RADIUS = 6;
export const BRICK_ROWS = 16;
export const BRICK_COLS = 14;
export const BRICK_HEIGHT = 15;
export const BRICK_WIDTH = (SCREEN_WIDTH - 40) / BRICK_COLS;

export const getEntities = (levelIndex = 0) => {
  const level = FLAG_LEVELS[levelIndex] || FLAG_LEVELS[0];
  // Per-level resolution override (falls back to global defaults)
  const brickRows = level.gridRows ?? BRICK_ROWS;
  const brickCols = level.gridCols ?? BRICK_COLS;
  const brickWidth = (SCREEN_WIDTH - 40) / brickCols;
  const brickHeight = level.gridCols ? brickWidth * 0.8 : BRICK_HEIGHT;

  const paddleMultiplier = level.paddleSizeMultiplier ?? 1.0;
  const speedScale = level.initialBallSpeed ? level.initialBallSpeed / 8.6 : 1.0;

  const entities: any = {
    scoreBoard: {
      score: 0,
      lives: 3,
      level: levelIndex,
      powerUpState: {},
      renderer: ScoreBoard,
    },
    paddle: {
      position: [SCREEN_WIDTH / 2, SCREEN_HEIGHT * 0.85],
      size: [PADDLE_WIDTH * paddleMultiplier, PADDLE_HEIGHT],
      renderer: Paddle,
    },
    ball_0: {
      position: [SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 50],
      velocity: [5 * speedScale, -7 * speedScale],
      radius: BALL_RADIUS * paddleMultiplier,
      renderer: Ball,
    },
  };

  // Generate Flag Bricks
  for (let r = 0; r < brickRows; r++) {
    for (let c = 0; c < brickCols; c++) {
      const brickId = `brick_${r}_${c}`;
      
      const isBorder = r === 0 || r === brickRows - 1 || c === 0 || c === brickCols - 1;
      
      let brickColor = level.backgroundColor;
      const patternResult = level.pattern(r, c, brickRows, brickCols);

      if (patternResult === 'NONE') continue; 
      
      if (patternResult === 'circle') brickColor = level.circleColor ?? level.backgroundColor;
      else if (patternResult === 'RED') brickColor = '#EE2335';
      else if (patternResult === 'BLACK') brickColor = '#000000';
      else if (patternResult === 'WHITE') brickColor = '#FFFFFF';
      else if (patternResult === 'GREEN') brickColor = '#007A3D';
      else if (patternResult === 'BLUE') brickColor = '#002664';
      else if (patternResult === 'GOLD') brickColor = '#FFB612';

      entities[brickId] = {
        position: [
          20 + c * brickWidth + brickWidth / 2,
          80 + r * brickHeight + brickHeight / 2,
        ],
        size: [brickWidth - 1, brickHeight - 1],
        color: isBorder ? '#78909C' : brickColor,
        status: true,
        permanent: isBorder || patternResult === 'STONE3',
        type: (patternResult === 'STONE' || patternResult === 'STONE3' || isBorder) ? 'stone' : 'regular',
        hp: patternResult === 'STONE3' ? 3 : (isBorder ? 2 : 1),
        renderer: Brick,
      };
    }
  }

  return entities;
};
