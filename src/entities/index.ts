import React from 'react';
import { Dimensions } from 'react-native';
import Paddle from '../components/Paddle';
import Ball from '../components/Ball';
import Brick from '../components/Brick';
import ScoreBoard from '../components/ScoreBoard';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Game Constants
export const PADDLE_WIDTH = SCREEN_WIDTH * 0.25;
export const PADDLE_HEIGHT = 20;
export const BALL_RADIUS = 10;
export const BRICK_ROWS = 5;
export const BRICK_COLS = 8;
export const BRICK_HEIGHT = 25;
export const BRICK_WIDTH = (SCREEN_WIDTH - 40) / BRICK_COLS; // 20px padding on each side

export const getEntities = () => {
  const entities: any = {
    scoreBoard: {
      score: 0,
      lives: 3,
      renderer: ScoreBoard,
    },
    paddle: {
      position: [SCREEN_WIDTH / 2, SCREEN_HEIGHT * 0.85],
      size: [PADDLE_WIDTH, PADDLE_HEIGHT],
      renderer: Paddle,
    },
    ball: {
      position: [SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2],
      velocity: [3, -3],
      radius: BALL_RADIUS,
      renderer: Ball,
    },
  };

  // Generate Bricks
  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      const brickId = `brick_${r}_${c}`;
      entities[brickId] = {
        position: [
          20 + c * BRICK_WIDTH + BRICK_WIDTH / 2,
          100 + r * BRICK_HEIGHT + BRICK_HEIGHT / 2,
        ],
        size: [BRICK_WIDTH - 4, BRICK_HEIGHT - 4], // 4px margin
        color: getBrickColor(r),
        status: true,
        renderer: Brick,
      };
    }
  }

  return entities;
};

const getBrickColor = (row: number) => {
  const colors = ['#E57373', '#F06292', '#BA68C8', '#9575CD', '#7986CB'];
  return colors[row % colors.length];
};
