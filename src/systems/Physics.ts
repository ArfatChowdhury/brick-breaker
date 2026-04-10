import { Dimensions } from 'react-native';
import Ball from '../components/Ball';
import PowerUpComponent from '../components/PowerUp';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const Physics = (entities: any, { time, dispatch }: any) => {
  const paddle = entities.paddle;
  const scoreBoard = entities.scoreBoard;

  if (!paddle || !scoreBoard) return entities;

  // 0. Smooth Paddle Lerp
  if (paddle.targetX !== undefined) {
    const lerpFactor = 0.2; // Adjust for smoothness
    paddle.position[0] += (paddle.targetX - paddle.position[0]) * lerpFactor;
  }

  // 1. Timer Cleanups (Power-Up expiration)
  const currentTime = Date.now();
  if (scoreBoard.powerUpState.WIDE && currentTime > scoreBoard.powerUpState.WIDE) {
    // Reset paddle size
    paddle.size[0] = SCREEN_WIDTH * 0.25;
    delete scoreBoard.powerUpState.WIDE;
  }
  if (scoreBoard.powerUpState.FIRE && currentTime > scoreBoard.powerUpState.FIRE) {
    delete scoreBoard.powerUpState.FIRE;
  }

  // 2. Handle All Balls
  let totalBalls = 0;
  let activeBricks = 0;

  Object.keys(entities).forEach(key => {
    if (key.startsWith('ball_')) {
      const ball = entities[key];
      totalBalls++;

      // Move Ball
      ball.position[0] += ball.velocity[0];
      ball.position[1] += ball.velocity[1];

      // Wall Collisions
      if (ball.position[0] - ball.radius <= 0) {
        ball.position[0] = ball.radius;
        ball.velocity[0] *= -1;
        dispatch({ type: 'wall-hit' });
      } else if (ball.position[0] + ball.radius >= SCREEN_WIDTH) {
        ball.position[0] = SCREEN_WIDTH - ball.radius;
        ball.velocity[0] *= -1;
        dispatch({ type: 'wall-hit' });
      }

      if (ball.position[1] - ball.radius <= 0) {
        ball.position[1] = ball.radius;
        ball.velocity[1] *= -1;
        dispatch({ type: 'wall-hit' });
      }

      // Bottom (Lose Life/Ball)
      if (ball.position[1] + ball.radius >= SCREEN_HEIGHT) {
        if (Object.keys(entities).filter(k => k.startsWith('ball_')).length > 1) {
          delete entities[key];
        } else {
          scoreBoard.lives -= 1;
          dispatch({ type: 'lose-life' });
          if (scoreBoard.lives <= 0) {
            dispatch({ type: 'game-over' });
            ball.velocity = [0, 0];
          } else {
            // Reset main ball
            ball.position = [SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 50];
            ball.velocity = [4, -5];
            // Reset buffs on death
            paddle.size[0] = SCREEN_WIDTH * 0.25;
            scoreBoard.powerUpState = {};
          }
        }
      }

      // Paddle Collision
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
        ball.velocity[1] *= -1;
        ball.position[1] = paddleY - paddleH / 2 - ball.radius - 1;
        const hitPos = (ball.position[0] - paddleX) / (paddleW / 2);
        ball.velocity[0] = hitPos * 5;
        dispatch({ type: 'paddle-hit' });
      }

      // 3. Brick Collisions (Per Ball)
      Object.keys(entities).forEach(bKey => {
        if (bKey.startsWith('brick_')) {
          const brick = entities[bKey];
          if (brick.status) {
            activeBricks++;
            const bX = brick.position[0];
            const bY = brick.position[1];
            const bW = brick.size[0];
            const bH = brick.size[1];

            const dx = Math.abs(ball.position[0] - bX);
            const dy = Math.abs(ball.position[1] - bY);

            if (dx <= bW / 2 + ball.radius && dy <= bH / 2 + ball.radius) {
              const overlapX = (bW / 2 + ball.radius) - dx;
              const overlapY = (bH / 2 + ball.radius) - dy;

              let hitSide = overlapX < overlapY ? (ball.position[0] < bX ? 'LEFT' : 'RIGHT') : (ball.position[1] < bY ? 'TOP' : 'BOTTOM');

              // Fireball Mode: No bounce, just destroy
              if (!scoreBoard.powerUpState.FIRE) {
                if (overlapX < overlapY) ball.velocity[0] *= -1;
                else ball.velocity[1] *= -1;
              }

              // Damage Logic
              if (brick.type === 'stone' && !scoreBoard.powerUpState.FIRE) {
                if (hitSide === 'TOP') {
                  brick.hp -= 1;
                  dispatch({ type: 'brick-hit' });
                  if (brick.hp <= 0) {
                    brick.status = false;
                    scoreBoard.score += 50;
                    attemptPowerUpSpawn(entities, brick.position);
                  }
                } else {
                  dispatch({ type: 'wall-hit' }); // Bounce off stone side sounds like a wall
                }
              } else {
                brick.status = false;
                scoreBoard.score += 10;
                dispatch({ type: 'brick-break' });
                attemptPowerUpSpawn(entities, brick.position);
              }
            }
          }
        }
      });
    }
  });

  // Win Detection
  if (Object.keys(entities).filter(k => k.startsWith('brick_') && entities[k].status).length === 0) {
    dispatch({ type: 'win' });
    Object.keys(entities).filter(k => k.startsWith('ball_')).forEach(k => entities[k].velocity = [0, 0]);
  }

  // 4. Handle Power-Ups
  Object.keys(entities).forEach(key => {
    if (key.startsWith('powerup_')) {
      const pu = entities[key];
      pu.position[1] += 3; // Falling speed

      // Collection
      const dx = Math.abs(pu.position[0] - paddle.position[0]);
      const dy = Math.abs(pu.position[1] - paddle.position[1]);
      if (dx < paddle.size[0] / 2 && dy < paddle.size[1] / 2) {
        applyPowerUp(entities, pu.type);
        dispatch({ type: 'powerup-collect' });
        delete entities[key];
      }

      // Cleanup off-screen
      if (pu.position[1] > SCREEN_HEIGHT) delete entities[key];
    }
  });

  return entities;
};

const attemptPowerUpSpawn = (entities: any, position: [number, number]) => {
  if (Math.random() < 0.2) { // 20% Chance
    const types: ('WIDE' | 'MULTI' | 'FIRE' | 'LIFE')[] = ['WIDE', 'MULTI', 'FIRE', 'LIFE'];
    const type = types[Math.floor(Math.random() * types.length)];
    const id = `powerup_${Date.now()}_${Math.random()}`;

    entities[id] = {
      position: [...position],
      size: [30, 30],
      type,
      renderer: PowerUpComponent,
    };
  }
};

const applyPowerUp = (entities: any, type: string) => {
  const { scoreBoard, paddle } = entities;
  const currentTime = Date.now();

  switch (type) {
    case 'WIDE':
      paddle.size[0] = SCREEN_WIDTH * 0.4; // 1.5x wider
      scoreBoard.powerUpState.WIDE = currentTime + 15000;
      break;
    case 'FIRE':
      scoreBoard.powerUpState.FIRE = currentTime + 10000;
      break;
    case 'LIFE':
      scoreBoard.lives += 1;
      break;
    case 'MULTI':
      // Split current balls (max balls for performance)
      const currentBallKeys = Object.keys(entities).filter(k => k.startsWith('ball_'));
      currentBallKeys.forEach(key => {
        const original = entities[key];
        [1, 2].forEach(i => {
          const newId = `ball_${Date.now()}_${i}_${Math.random()}`;
          entities[newId] = {
            ...original,
            position: [...original.position],
            velocity: [original.velocity[0] + (i === 1 ? -1 : 1), -Math.abs(original.velocity[1])],
            renderer: Ball,
          };
        });
      });
      break;
  }
};

export default Physics;
