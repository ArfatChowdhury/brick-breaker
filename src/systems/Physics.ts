import { Dimensions } from 'react-native';
import Ball from '../components/Ball';
import PowerUpComponent from '../components/PowerUp';
import Particle from '../components/Particle';
import { triggerHaptic } from '../utils/haptics';

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

  // 0.1 Handle Particles (Optimized)
  Object.keys(entities).forEach(key => {
    if (key.startsWith('p_')) {
      const p = entities[key];
      p.position[0] += p.velocity[0];
      p.position[1] += p.velocity[1];
      p.opacity -= 0.1; // Faster fade for performance
      if (p.opacity <= 0) delete entities[key];
    }
  });

  // 1. Timer Cleanups... (Keep existing logic)
  const currentTime = Date.now();
  if (scoreBoard.powerUpState.WIDE && currentTime > scoreBoard.powerUpState.WIDE) {
    paddle.size[0] = SCREEN_WIDTH * 0.25;
    delete scoreBoard.powerUpState.WIDE;
  }
  if (scoreBoard.powerUpState.FIRE && currentTime > scoreBoard.powerUpState.FIRE) {
    delete scoreBoard.powerUpState.FIRE;
  }

  // 2. Pre-filter Active Entities for Performance
  const allKeys = Object.keys(entities);
  const activeBallKeys = allKeys.filter(k => k.startsWith('ball_'));
  const activeBrickKeys = allKeys.filter(k => k.startsWith('brick_') && entities[k].status);
  const powerUpKeys = allKeys.filter(k => k.startsWith('powerup_'));

  activeBallKeys.forEach(key => {
    const ball = entities[key];

    // Move Ball
    ball.position[0] += ball.velocity[0];
    ball.position[1] += ball.velocity[1];

    // Trail tracking (Only for main ball or limited for others)
    if (!ball.trail) ball.trail = [];
    ball.trail.unshift([ball.position[0], ball.position[1]]);
    if (ball.trail.length > 4) ball.trail.pop();

    // Wall Collisions
    if (ball.position[0] - ball.radius <= 0) {
      ball.position[0] = ball.radius;
      ball.velocity[0] *= -1;
      triggerHaptic('impactLight');
      dispatch({ type: 'wall-hit' });
    } else if (ball.position[0] + ball.radius >= SCREEN_WIDTH) {
      ball.position[0] = SCREEN_WIDTH - ball.radius;
      ball.velocity[0] *= -1;
      triggerHaptic('impactLight');
      dispatch({ type: 'wall-hit' });
    }

    if (ball.position[1] - ball.radius <= 0) {
      ball.position[1] = ball.radius;
      ball.velocity[1] *= -1;
      triggerHaptic('impactLight');
      dispatch({ type: 'wall-hit' });
    }

    // Bottom (Lose Life/Ball)
    if (ball.position[1] + ball.radius >= SCREEN_HEIGHT) {
      if (activeBallKeys.length > 1) {
        delete entities[key];
      } else {
        scoreBoard.lives -= 1;
        dispatch({ type: 'lose-life' });
        triggerHaptic('notificationError');
        if (scoreBoard.lives <= 0) {
          dispatch({ type: 'game-over' });
          ball.velocity = [0, 0];
        } else {
          ball.position = [SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 50];
          ball.velocity = [5, -7];
          ball.trail = [];
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
      
      const speedCap = 14; 
      const currentSpeed = Math.sqrt(ball.velocity[0]**2 + ball.velocity[1]**2);
      if (currentSpeed < speedCap) {
        ball.velocity[0] *= 1.03;
        ball.velocity[1] *= 1.03;
      }

      triggerHaptic('impactMedium');
      dispatch({ type: 'paddle-hit' });
    }

    // 3. Optimized Brick Collisions
    for (const bKey of activeBrickKeys) {
      const brick = entities[bKey];
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

        // PREVENT SLIPPING: Nudge ball out of brick
        if (hitSide === 'LEFT') ball.position[0] = bX - bW / 2 - ball.radius - 0.5;
        else if (hitSide === 'RIGHT') ball.position[0] = bX + bW / 2 + ball.radius + 0.5;
        else if (hitSide === 'TOP') ball.position[1] = bY - bH / 2 - ball.radius - 0.5;
        else if (hitSide === 'BOTTOM') ball.position[1] = bY + bH / 2 + ball.radius + 0.5;

        if (!scoreBoard.powerUpState.FIRE) {
          if (overlapX < overlapY) ball.velocity[0] *= -1;
          else ball.velocity[1] *= -1;
        }

        // Damage Logic (NEW: Top=3, Sides=1)
        if (brick.type === 'stone' && !scoreBoard.powerUpState.FIRE) {
          const damage = (hitSide === 'TOP') ? 3 : 1;
          brick.hp -= damage;
          triggerHaptic('impactLight');
          dispatch({ type: 'brick-hit' });
          if (brick.hp <= 0) {
            brick.status = false;
            scoreBoard.score += 50;
            triggerHaptic('impactMedium');
            spawnParticles(entities, brick.position, brick.color);
            attemptPowerUpSpawn(entities, brick.position);
          }
        } else {
          brick.status = false;
          scoreBoard.score += 10;
          triggerHaptic('impactMedium');
          dispatch({ type: 'brick-break' });
          spawnParticles(entities, brick.position, brick.color);
          attemptPowerUpSpawn(entities, brick.position);
        }
        break; // Collision resolved for this ball in this frame
      }
    }
  });

  // Win Detection
  if (activeBrickKeys.length === 0) {
    dispatch({ type: 'win' });
    activeBallKeys.forEach(k => entities[k].velocity = [0, 0]);
  }

  // 4. Handle Power-Ups
  powerUpKeys.forEach(key => {
    const pu = entities[key];
    pu.position[1] += 3;

    const dx = Math.abs(pu.position[0] - paddle.position[0]);
    const dy = Math.abs(pu.position[1] - paddle.position[1]);
    if (dx < paddle.size[0] / 2 && dy < paddle.size[1] / 2) {
      applyPowerUp(entities, pu.type, activeBallKeys.length);
      triggerHaptic('impactMedium');
      dispatch({ type: 'powerup-collect' });
      delete entities[key];
    }
    if (pu.position[1] > SCREEN_HEIGHT) delete entities[key];
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

const applyPowerUp = (entities: any, type: string, currentBallCount: number) => {
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
      // Split current balls (MAX 12 total for performance)
      if (currentBallCount >= 12) return;
      
      const currentBallKeys = Object.keys(entities).filter(k => k.startsWith('ball_'));
      currentBallKeys.forEach(key => {
        const original = entities[key];
        // Only one split if we are near the cap
        const splitCount = currentBallCount > 6 ? 1 : 2; 

        for (let i = 1; i <= splitCount; i++) {
          const newId = `ball_${Date.now()}_${i}_${Math.random()}`;
          entities[newId] = {
            ...original,
            position: [...original.position],
            velocity: [original.velocity[0] + (i === 1 ? -1 : 1), -Math.abs(original.velocity[1])],
            renderer: Ball,
            trail: [],
          };
        }
      });
      break;
  }
};

const spawnParticles = (entities: any, position: [number, number], color: string) => {
  const particleCount = 5; // Reduced from 8 for performance
  for (let i = 0; i < particleCount; i++) {
    const id = `p_${Date.now()}_${i}_${Math.random()}`;
    entities[id] = {
      position: [...position],
      velocity: [(Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6],
      size: 3 + Math.random() * 3,
      color: color,
      opacity: 1,
      renderer: Particle,
    };
  }
};

export default Physics;
