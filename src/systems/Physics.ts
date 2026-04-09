import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const Physics = (entities: any, { time, dispatch }: any) => {
  const ball = entities.ball;
  const paddle = entities.paddle;
  const scoreBoard = entities.scoreBoard;

  if (!ball || !paddle || !scoreBoard) return entities;

  // 1. Move Ball
  ball.position[0] += ball.velocity[0];
  ball.position[1] += ball.velocity[1];

  // 2. Wall Collisions
  // Left/Right
  if (ball.position[0] - ball.radius <= 0) {
    ball.position[0] = ball.radius;
    ball.velocity[0] *= -1;
  } else if (ball.position[0] + ball.radius >= SCREEN_WIDTH) {
    ball.position[0] = SCREEN_WIDTH - ball.radius;
    ball.velocity[0] *= -1;
  }

  // Top
  if (ball.position[1] - ball.radius <= 0) {
    ball.position[1] = ball.radius;
    ball.velocity[1] *= -1;
  }

  // Bottom (Lose Life)
  if (ball.position[1] + ball.radius >= SCREEN_HEIGHT) {
    scoreBoard.lives -= 1;
    if (scoreBoard.lives <= 0) {
      dispatch({ type: 'game-over' });
      // Stop ball movement
      ball.velocity = [0, 0];
    } else {
      // Reset ball position to middle-ish
      ball.position = [SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2];
      ball.velocity = [3, -4]; // Slightly faster upward
    }
  }

  // 3. Paddle Collision
  const paddleX = paddle.position[0];
  const paddleY = paddle.position[1];
  const paddleW = paddle.size[0];
  const paddleH = paddle.size[1];

  if (
    ball.position[1] + ball.radius >= paddleY - paddleH / 2 &&
    ball.position[1] - ball.radius <= paddleY + paddleH / 2 &&
    ball.position[0] >= paddleX - paddleW / 2 &&
    ball.position[0] <= paddleX + paddleW / 2
  ) {
    // Basic bounce
    ball.velocity[1] *= -1;
    // Push out of paddle to prevent sticking
    ball.position[1] = paddleY - paddleH / 2 - ball.radius - 1;

    // Angle adjustment based on hit position relative to center of paddle
    const hitPos = (ball.position[0] - paddleX) / (paddleW / 2); // ranges from -1 to 1
    ball.velocity[0] = hitPos * 5; // Max horizontal speed 5
  }

  // 4. Brick Collisions
  let bricksLeft = 0;
  Object.keys(entities).forEach(key => {
    if (key.startsWith('brick_')) {
      const brick = entities[key];
      if (brick.status) {
        bricksLeft++;
        const bX = brick.position[0];
        const bY = brick.position[1];
        const bW = brick.size[0];
        const bH = brick.size[1];

        // Simple AABB vs Circle-ish collision
        if (
          ball.position[0] + ball.radius >= bX - bW / 2 &&
          ball.position[0] - ball.radius <= bX + bW / 2 &&
          ball.position[1] + ball.radius >= bY - bH / 2 &&
          ball.position[1] - ball.radius <= bY + bH / 2
        ) {
          brick.status = false;
          ball.velocity[1] *= -1; // Bounce back
          scoreBoard.score += 10;
        }
      }
    }
  });

  if (bricksLeft === 0) {
    dispatch({ type: 'win' });
    ball.velocity = [0, 0];
  }

  return entities;
};

export default Physics;
