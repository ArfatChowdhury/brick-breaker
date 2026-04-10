import React from 'react';
import { Dimensions } from 'react-native';
import Paddle from '../components/Paddle';
import Ball from '../components/Ball';
import Brick from '../components/Brick';
import ScoreBoard from '../components/ScoreBoard';
import PowerUp from '../components/PowerUp';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Game Constants
export const PADDLE_WIDTH = SCREEN_WIDTH * 0.25;
export const PADDLE_HEIGHT = 20;
export const BALL_RADIUS = 6;
export const BRICK_ROWS = 16;
export const BRICK_COLS = 14;
export const BRICK_HEIGHT = 15;
export const BRICK_WIDTH = (SCREEN_WIDTH - 40) / BRICK_COLS;

export const getEntities = () => {
  const entities: any = {
    scoreBoard: {
      score: 0,
      lives: 3,
      powerUpState: {}, // To track expiration times: { FIRE: timestamp, WIDE: timestamp }
      renderer: ScoreBoard,
    },
    paddle: {
      position: [SCREEN_WIDTH / 2, SCREEN_HEIGHT * 0.85],
      size: [PADDLE_WIDTH, PADDLE_HEIGHT],
      renderer: Paddle,
    },
    ball_0: {
      position: [SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 50],
      velocity: [4, -5],
      radius: BALL_RADIUS,
      renderer: Ball,
    },
  };

  // Generate Bangladesh Flag
  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      const brickId = `brick_${r}_${c}`;
      
      // Determine if it's a border brick (Stone)
      const isBorder = r === 0 || r === BRICK_ROWS - 1 || c === 0 || c === BRICK_COLS - 1;
      
      // Determine color for the flag (Bangladesh: Green with Red circle)
      // Circle center: approx r=8, c=6 (offset slightly left as per real flag design)
      const distToCenter = Math.sqrt(Math.pow(r - 8, 2) + Math.pow(c - 6, 2));
      const isInCircle = distToCenter < 4;
      
      const brickColor = isInCircle ? '#F42A41' : '#006A4E';

      entities[brickId] = {
        position: [
          20 + c * BRICK_WIDTH + BRICK_WIDTH / 2,
          80 + r * BRICK_HEIGHT + BRICK_HEIGHT / 2,
        ],
        size: [BRICK_WIDTH - 2, BRICK_HEIGHT - 2], // Tighter margin for "dense" look
        color: isBorder ? '#78909C' : brickColor,
        status: true,
        type: isBorder ? 'stone' : 'regular',
        hp: isBorder ? 2 : 1,
        renderer: Brick,
      };
    }
  }

  return entities;
};
