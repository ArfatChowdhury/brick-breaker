import React from 'react';
import { Dimensions } from 'react-native';
import Paddle from '../components/Paddle';
import Ball from '../components/Ball';
import Brick from '../components/Brick';
import ScoreBoard from '../components/ScoreBoard';
import PowerUp from '../components/PowerUp';

import { FLAG_LEVELS } from '../levels';
import { generateMaze } from '../utils/MazeGenerator';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Game Constants
export const PADDLE_WIDTH = SCREEN_WIDTH * 0.25;
export const PADDLE_HEIGHT = 20;
export const BALL_RADIUS = 10;
export const BRICK_ROWS = 16;
export const BRICK_COLS = 14;
export const BRICK_HEIGHT = 15;
export const BRICK_WIDTH = (SCREEN_WIDTH - 40) / BRICK_COLS;

export const getEntities = (levelIndex = 0) => {
  const level = FLAG_LEVELS[levelIndex] || FLAG_LEVELS[0];
  
  // 1. Dynamic Grid Layout
  // Force bricks to take up the full width minus a tiny margin (4px)
  const MIN_BRICK_WIDTH = 18; // px
  const dynamicCols = Math.floor((SCREEN_WIDTH - 4) / MIN_BRICK_WIDTH);
  
  const brickRows = level.gridRows ?? BRICK_ROWS;
  const brickCols = dynamicCols; // Ignore level.gridCols, force full flush width
  
  const brickWidth = (SCREEN_WIDTH - 4) / brickCols;
  const brickHeight = brickWidth * 0.8; // Maintain 5:4 aspect ratio

  const paddleMultiplier = level.paddleSizeMultiplier ?? 1.0;
  const speedScale = level.initialBallSpeed ? level.initialBallSpeed / 8.6 : 1.0;

  const entities: any = {
    scoreBoard: {
      score: 0,
      lives: 3,
      level: levelIndex,
      powerUpState: {},
      missiles: 3,
      mines: 2,
      weaponMode: 'NORMAL',
      lastHitId: null,
      shake: 0,
      multiplier: 1,
      streak: 0,
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
      trail: [],
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
          2 + c * brickWidth + brickWidth / 2, // Only 2px left margin
          80 + r * brickHeight + brickHeight / 2,
        ],
        size: [brickWidth - 0.5, brickHeight - 0.5], // Tighter gaps
        color: (isBorder && patternResult === 'background') ? '#78909C' : brickColor,
        status: true,
        permanent: isBorder || patternResult === 'STONE3',
        type: (patternResult === 'STONE' || patternResult === 'STONE3' || isBorder) ? 'stone' : 'regular',
        hp: patternResult === 'STONE3' ? 3 : (isBorder ? 2 : 1),
        renderer: Brick,
      };
    }
  }

  // --- PHASE 2: Append Random Maze ---
  if (level.mazeEnabled) {
    const mazeRows = level.mazeRows ?? 8;
    const maze = generateMaze(mazeRows, brickCols);

    for (let r = 0; r < mazeRows; r++) {
      for (let c = 0; c < brickCols; c++) {
        const char = maze[r][c];
        if (char === 'S') {
          const brickId = `maze_brick_${r}_${c}`;
          entities[brickId] = {
            position: [
              2 + c * brickWidth + brickWidth / 2,
              80 + (brickRows + r) * brickHeight + brickHeight / 2,
            ],
            size: [brickWidth - 0.5, brickHeight - 0.5],
            color: '#78909C', // Stone wall color
            status: true,
            permanent: true,
            type: 'stone',
            hp: 3,
            renderer: Brick,
          };
        }
      }
    }
  }

  return entities;
};
