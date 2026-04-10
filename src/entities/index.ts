import React from 'react';
import { Dimensions } from 'react-native';
import Paddle from '../components/Paddle';
import Ball from '../components/Ball';
import Brick from '../components/Brick';
import ScoreBoard from '../components/ScoreBoard';
import PowerUp from '../components/PowerUp';

import { FLAG_LEVELS } from '../utils/levels';

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
      size: [PADDLE_WIDTH, PADDLE_HEIGHT],
      renderer: Paddle,
    },
    ball_0: {
      position: [SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 50],
      velocity: [5, -7],
      radius: BALL_RADIUS,
      renderer: Ball,
    },
  };

  // Generate Flag Bricks
  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      const brickId = `brick_${r}_${c}`;
      
      const isBorder = r === 0 || r === BRICK_ROWS - 1 || c === 0 || c === BRICK_COLS - 1;
      
      let brickColor = level.backgroundColor;
      const patternResult = level.pattern(r, c, BRICK_ROWS, BRICK_COLS);

      if (patternResult === 'NONE' && !isBorder) continue; // Skip bricks for non-rectangular flags
      
      if (patternResult === 'circle') brickColor = level.circleColor;
      else if (patternResult === 'RED') brickColor = '#EE2335';
      else if (patternResult === 'BLACK') brickColor = '#000000';
      else if (patternResult === 'WHITE') brickColor = '#FFFFFF';
      else if (patternResult === 'GREEN') brickColor = '#007A3D';
      else if (patternResult === 'BLUE') brickColor = '#002664';

      entities[brickId] = {
        position: [
          20 + c * BRICK_WIDTH + BRICK_WIDTH / 2,
          80 + r * BRICK_HEIGHT + BRICK_HEIGHT / 2,
        ],
        size: [BRICK_WIDTH - 2, BRICK_HEIGHT - 2],
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
