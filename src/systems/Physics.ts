import { Dimensions } from 'react-native';
import Ball from '../components/Ball';
import PowerUpComponent from '../components/PowerUp';
import Particle from '../components/Particle';
import { triggerHaptic } from '../utils/haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MIN_VY = 3.5; // Minimum vertical speed to prevent horizontal trapping
const LERP_SPEED = 12; // Delta-time-based lerp speed (pixels/ms)

const Physics = (entities: any, { time, dispatch, events }: any) => {
  const paddle = entities.paddle;
  const scoreBoard = entities.scoreBoard;

  if (!paddle || !scoreBoard) return entities;

  // 0. Handle Events
  if (events && events.length > 0) {
    const launch = events.find((e: any) => e.type === 'launch');
    if (launch) {
      scoreBoard.waitingToStart = false;
      const allActive = Object.keys(entities).filter(k => k.startsWith('ball_'));
      allActive.forEach(bk => {
        entities[bk].velocity = [4, -8];
      });
    }
  }

  // 0a. Smooth Paddle Lerp (delta-time based — feels consistent across frame rates)
  if (paddle.targetX !== undefined) {
    const delta = time.delta || 16;
    const t = Math.min(1, (LERP_SPEED * delta) / 1000);
    paddle.position[0] += (paddle.targetX - paddle.position[0]) * t;
  }

  // 0b. Handle Particles
  Object.keys(entities).forEach(key => {
    if (key.startsWith('p_')) {
      const p = entities[key];
      p.position[0] += p.velocity[0];
      p.position[1] += p.velocity[1];
      p.opacity -= 0.1;
      if (p.opacity <= 0) delete entities[key];
    }
  });

  // 1. Timer Cleanups (Power-Up expiration)
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
  const activeBrickKeys = allKeys.filter(
    k => k.startsWith('brick_') && entities[k].status  // ALL bricks for collision
  );
  const clearableBrickKeys = allKeys.filter(
    k => k.startsWith('brick_') && entities[k].status && !entities[k].permanent // non-permanent for win check
  );
  const powerUpKeys = allKeys.filter(k => k.startsWith('powerup_'));

  activeBallKeys.forEach(key => {
    const ball = entities[key];

    // ------ WAITING TO SERVE: Lock ball to paddle ------
    if (scoreBoard.waitingToStart) {
      ball.position[0] = paddle.position[0];
      ball.position[1] = paddle.position[1] - paddle.size[1] / 2 - ball.radius - 2;
      ball.velocity = [0, 0];
      ball.trail = [];
      return;
    }

    // ------ Move Ball ------
    ball.position[0] += ball.velocity[0];
    ball.position[1] += ball.velocity[1];

    // Trail
    if (!ball.trail) ball.trail = [];
    ball.trail.unshift([ball.position[0], ball.position[1]]);
    if (ball.trail.length > 4) ball.trail.pop();

    // ------ Wall Collisions ------
    if (ball.position[0] - ball.radius <= 0) {
      ball.position[0] = ball.radius;
      ball.velocity[0] = Math.abs(ball.velocity[0]);
      triggerHaptic('impactLight');
      dispatch({ type: 'wall-hit' });
    } else if (ball.position[0] + ball.radius >= SCREEN_WIDTH) {
      ball.position[0] = SCREEN_WIDTH - ball.radius;
      ball.velocity[0] = -Math.abs(ball.velocity[0]);
      triggerHaptic('impactLight');
      dispatch({ type: 'wall-hit' });
    }

    if (ball.position[1] - ball.radius <= 0) {
      ball.position[1] = ball.radius;
      ball.velocity[1] = Math.abs(ball.velocity[1]);
      triggerHaptic('impactLight');
      dispatch({ type: 'wall-hit' });
    }

    // ------ Bottom: Lose Life ------
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
          scoreBoard.waitingToStart = true;
          paddle.size[0] = SCREEN_WIDTH * 0.25;
          scoreBoard.powerUpState = {};

          const oldBall = entities[key];
          delete entities[key];
          entities['ball_0'] = {
            position: [paddle.position[0], paddle.position[1] - paddle.size[1] / 2 - oldBall.radius - 2],
            velocity: [0, 0],
            radius: oldBall.radius,
            renderer: oldBall.renderer,
            trail: []
          };
        }
      }
    }

    // ------ Paddle Collision ------
    const paddleX = paddle.position[0];
    const paddleY = paddle.position[1];
    const paddleW = paddle.size[0];
    const paddleH = paddle.size[1];

    if (
      ball.position[1] + ball.radius >= paddleY - paddleH / 2 &&
      ball.position[1] - ball.radius <= paddleY + paddleH / 2 &&
      ball.position[0] >= paddleX - paddleW / 2 &&
      ball.position[0] <= paddleX + paddleW / 2 &&
      ball.velocity[1] > 0 // Only bounce when moving downward
    ) {
      ball.position[1] = paddleY - paddleH / 2 - ball.radius - 1;
      const hitPos = (ball.position[0] - paddleX) / (paddleW / 2); // -1 to 1
      ball.velocity[0] = hitPos * 6;
      ball.velocity[1] = -Math.abs(ball.velocity[1]); // Always go up

      // Speed escalation (soft cap at 14)
      const currentSpeed = Math.sqrt(ball.velocity[0]**2 + ball.velocity[1]**2);
      if (currentSpeed < 14) {
        ball.velocity[0] *= 1.04;
        ball.velocity[1] *= 1.04;
      }

      // FIX: Minimum vertical speed clamp
      if (Math.abs(ball.velocity[1]) < MIN_VY) {
        ball.velocity[1] = -MIN_VY;
      }

      triggerHaptic('impactMedium');
      dispatch({ type: 'paddle-hit' });
    }

    // ------ Brick Collisions ------
    for (const bKey of activeBrickKeys) {
      const brick = entities[bKey];
      if (!brick.status) continue;

      const bX = brick.position[0];
      const bY = brick.position[1];
      const bW = brick.size[0];
      const bH = brick.size[1];

      const dx = Math.abs(ball.position[0] - bX);
      const dy = Math.abs(ball.position[1] - bY);

      if (dx <= bW / 2 + ball.radius && dy <= bH / 2 + ball.radius) {
        const overlapX = bW / 2 + ball.radius - dx;
        const overlapY = bH / 2 + ball.radius - dy;
        const hitSide = overlapX < overlapY
          ? (ball.position[0] < bX ? 'LEFT' : 'RIGHT')
          : (ball.position[1] < bY ? 'TOP' : 'BOTTOM');

        // FIX: Nudge ball out before reversing to prevent tunneling
        if (hitSide === 'LEFT')   ball.position[0] = bX - bW / 2 - ball.radius - 0.5;
        else if (hitSide === 'RIGHT')  ball.position[0] = bX + bW / 2 + ball.radius + 0.5;
        else if (hitSide === 'TOP')    ball.position[1] = bY - bH / 2 - ball.radius - 0.5;
        else if (hitSide === 'BOTTOM') ball.position[1] = bY + bH / 2 + ball.radius + 0.5;

        if (!scoreBoard.powerUpState.FIRE) {
          if (overlapX < overlapY) ball.velocity[0] *= -1;
          else ball.velocity[1] *= -1;
        }

        // FIX: Minimum vertical speed clamp after brick hit too
        if (Math.abs(ball.velocity[1]) < MIN_VY) {
          ball.velocity[1] = ball.velocity[1] < 0 ? -MIN_VY : MIN_VY;
        }

        // Damage Logic: stone TOP=3dmg, sides=1dmg
        if (brick.type === 'stone' && !scoreBoard.powerUpState.FIRE) {
          const damage = hitSide === 'TOP' ? 3 : 1;
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
        break; // One collision per frame per ball
      }
    }
  });

  // Win Detection — only non-permanent bricks count
  if (clearableBrickKeys.length === 0 && !scoreBoard.waitingToStart) {
    dispatch({ type: 'win', score: scoreBoard.score });
    activeBallKeys.forEach(k => entities[k].velocity = [0, 0]);
  }

  // Power-Ups
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
  if (Math.random() < 0.18) {
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
      paddle.size[0] = SCREEN_WIDTH * 0.4;
      scoreBoard.powerUpState.WIDE = currentTime + 15000;
      break;
    case 'FIRE':
      scoreBoard.powerUpState.FIRE = currentTime + 10000;
      break;
    case 'LIFE':
      scoreBoard.lives += 1;
      break;
    case 'MULTI':
      if (currentBallCount >= 20) return;
      const currentBallKeys = Object.keys(entities).filter(k => k.startsWith('ball_'));
      const remaining = 20 - currentBallCount;
      const toSpawn = Math.min(2, remaining); // Always just 2 new balls
      const sourceBall = entities[currentBallKeys[0]]; // Only the first ball
      for (let i = 0; i < toSpawn; i++) {
        const newId = `ball_${Date.now()}_${i}_${Math.random()}`;
        entities[newId] = {
          ...sourceBall,
          position: [...sourceBall.position],
          velocity: [sourceBall.velocity[0] + (i === 0 ? -2.5 : 2.5), -Math.abs(sourceBall.velocity[1])],
          renderer: Ball,
          trail: [],
        };
      }
      break;
  }
};

const spawnParticles = (entities: any, position: [number, number], color: string) => {
  for (let i = 0; i < 5; i++) {
    const id = `p_${Date.now()}_${i}_${Math.random()}`;
    entities[id] = {
      position: [...position],
      velocity: [(Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6],
      size: 3 + Math.random() * 3,
      color,
      opacity: 1,
      renderer: Particle,
    };
  }
};

export default Physics;
