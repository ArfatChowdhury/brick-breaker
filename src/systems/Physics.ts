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
      // Optimization: Cache ball keys if possible, but for start it's fine once
      Object.keys(entities).forEach(k => {
        if (k.startsWith('ball_')) entities[k].velocity = [4, -8];
      });
    }
  }

  // 0a. Smooth Paddle Lerp
  if (paddle.targetX !== undefined) {
    const delta = time.delta || 16;
    const t = Math.min(1, (LERP_SPEED * delta) / 1000);
    paddle.position[0] += (paddle.targetX - paddle.position[0]) * t;
  }

  // 0b. Handle Particles & Dynamic Key Filtering
  const allKeys = Object.keys(entities);
  const activeBallKeys: string[] = [];
  const powerUpKeys: string[] = [];
  const particleKeys: string[] = [];
  
  // Single pass through keys for optimization
  for (let i = 0; i < allKeys.length; i++) {
    const key = allKeys[i];
    if (key.startsWith('ball_')) activeBallKeys.push(key);
    else if (key.startsWith('powerup_')) powerUpKeys.push(key);
    else if (key.startsWith('p_')) {
      const p = entities[key];
      p.position[0] += p.velocity[0];
      p.position[1] += p.velocity[1];
      p.opacity -= 0.1;
      if (p.opacity <= 0) delete entities[key];
      else particleKeys.push(key);
    }
  }

  // 1. Brick Key Caching Logic
  if (!scoreBoard._brickCache || scoreBoard._bricksDirty) {
    const bricks = allKeys.filter(k => k.startsWith('brick_') && entities[k].status);
    // PRIORITY FIX: Sort so stone bricks are checked FIRST
    // This prevents the ball from "bypassing" a wall to hit a brick behind it
    scoreBoard._activeBrickKeys = bricks.sort((a, b) => {
      const typeA = entities[a].type === 'stone' ? 0 : 1;
      const typeB = entities[b].type === 'stone' ? 0 : 1;
      return typeA - typeB;
    });
    scoreBoard._clearableBrickKeys = scoreBoard._activeBrickKeys.filter(k => !entities[k].permanent);
    scoreBoard._brickCache = true;
    scoreBoard._bricksDirty = false;
  }
  
  const activeBrickKeys = scoreBoard._activeBrickKeys;
  const clearableBrickKeys = scoreBoard._clearableBrickKeys;

  // 2. Timer Cleanups
  const currentTime = Date.now();
  if (scoreBoard.powerUpState.WIDE && currentTime > scoreBoard.powerUpState.WIDE) {
    paddle.size[0] = SCREEN_WIDTH * 0.25;
    delete scoreBoard.powerUpState.WIDE;
  }
  if (scoreBoard.powerUpState.FIRE && currentTime > scoreBoard.powerUpState.FIRE) {
    delete scoreBoard.powerUpState.FIRE;
  }

  // --- SUB-STEPPING PHYSICS LOOP ---
  // We run the physics twice per frame at half velocity to eliminate tunneling (passing through bricks)
  const SUB_STEPS = 2;
  
  activeBallKeys.forEach(key => {
    const ball = entities[key];
    if (!ball) return;

    if (scoreBoard.waitingToStart) {
      ball.position[0] = paddle.position[0];
      ball.position[1] = paddle.position[1] - paddle.size[1] / 2 - ball.radius - 2;
      ball.velocity = [0, 0];
      ball.trail = [];
      return;
    }

    for (let s = 0; s < SUB_STEPS; s++) {
      // 1. Move ball by half its velocity
      ball.position[0] += ball.velocity[0] / SUB_STEPS;
      ball.position[1] += ball.velocity[1] / SUB_STEPS;

      // 2. Wall Collisions
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

      // 3. Bottom check (early exit sub-step if ball lost)
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
        break; // Exit sub-step loop
      }

      // 4. Paddle Collision
      const pX = paddle.position[0], pY = paddle.position[1], pW = paddle.size[0], pH = paddle.size[1];
      if (ball.velocity[1] > 0 && 
          ball.position[1] + ball.radius >= pY - pH / 2 &&
          ball.position[1] - ball.radius <= pY + pH / 2 &&
          ball.position[0] >= pX - pW / 2 &&
          ball.position[0] <= pX + pW / 2) {
        
        ball.position[1] = pY - pH / 2 - ball.radius - 1;
        const hitPos = (ball.position[0] - pX) / (pW / 2);
        ball.velocity[0] = hitPos * 6;
        ball.velocity[1] = -Math.abs(ball.velocity[1]);

        const currentSpeed = Math.sqrt(ball.velocity[0]**2 + ball.velocity[1]**2);
        if (currentSpeed < 14) {
          ball.velocity[0] *= 1.04;
          ball.velocity[1] *= 1.04;
        }
        if (Math.abs(ball.velocity[1]) < MIN_VY) ball.velocity[1] = -MIN_VY;

        triggerHaptic('impactMedium');
        dispatch({ type: 'paddle-hit' });
      }

      // 5. Brick Collisions
      let collidedThisStep = false;
      for (let i = 0; i < activeBrickKeys.length; i++) {
        const bKey = activeBrickKeys[i];
        const brick = entities[bKey];
        if (!brick || !brick.status) continue;

        const bY = brick.position[1], bH = brick.size[1];
        if (Math.abs(ball.position[1] - bY) > bH / 2 + ball.radius + 5) continue;

        const bX = brick.position[0], bW = brick.size[0];
        const dx = Math.abs(ball.position[0] - bX);
        const dy = Math.abs(ball.position[1] - bY);

        if (dx <= bW / 2 + ball.radius && dy <= bH / 2 + ball.radius) {
          const overlapX = bW / 2 + ball.radius - dx;
          const overlapY = bH / 2 + ball.radius - dy;
          const hitSide = overlapX < overlapY
            ? (ball.position[0] < bX ? 'LEFT' : 'RIGHT')
            : (ball.position[1] < bY ? 'TOP' : 'BOTTOM');

          // Robustness Check
          if (hitSide === 'LEFT' && ball.velocity[0] <= 0) continue;
          if (hitSide === 'RIGHT' && ball.velocity[0] >= 0) continue;
          if (hitSide === 'TOP' && ball.velocity[1] <= 0) continue;
          if (hitSide === 'BOTTOM' && ball.velocity[1] >= 0) continue;

          // Displace ball
          const nudge = 1.6; 
          if (hitSide === 'LEFT')   ball.position[0] = bX - bW / 2 - ball.radius - nudge;
          else if (hitSide === 'RIGHT')  ball.position[0] = bX + bW / 2 + ball.radius + nudge;
          else if (hitSide === 'TOP')    ball.position[1] = bY - bH / 2 - ball.radius - nudge;
          else if (hitSide === 'BOTTOM') ball.position[1] = bY + bH / 2 + ball.radius + nudge;

          if (!scoreBoard.powerUpState.FIRE) {
            if (overlapX < overlapY) ball.velocity[0] *= -1;
            else ball.velocity[1] *= -1;
          }

          if (Math.abs(ball.velocity[1]) < MIN_VY) {
            ball.velocity[1] = ball.velocity[1] < 0 ? -MIN_VY : MIN_VY;
          }

          brick.hp -= (hitSide === 'TOP' ? 3 : 1);
          triggerHaptic('impactLight');
          
          if (brick.hp <= 0) {
            brick.status = false;
            scoreBoard.score += brick.type === 'stone' ? 50 : 10;
            scoreBoard._bricksDirty = true;
            triggerHaptic('impactMedium');
            dispatch({ type: brick.type === 'stone' ? 'brick-hit' : 'brick-break' });
            spawnParticles(entities, brick.position, brick.color);
            attemptPowerUpSpawn(entities, brick.position);
          } else {
            dispatch({ type: 'brick-hit' });
          }
          collidedThisStep = true;
          break; // One brick hit per sub-step
        }
      }
      if (collidedThisStep) break; // If we hit something, wait for the next frame
    }

    // 6. Final Position Post-Substeps: Update Trail
    if (ball && ball.trail) {
      ball.trail.unshift([ball.position[0], ball.position[1]]);
      if (ball.trail.length > 3) ball.trail.pop();
    }
  });

  if (clearableBrickKeys.length === 0 && !scoreBoard.waitingToStart) {
    dispatch({ type: 'win', score: scoreBoard.score });
    activeBallKeys.forEach(k => entities[k].velocity = [0, 0]);
  }

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
      if (currentBallCount >= 30) return;
      const currentBallKeys = Object.keys(entities).filter(k => k.startsWith('ball_'));
      const remaining = 30 - currentBallCount;
      const toSpawn = Math.min(6, remaining); // Optimization: Increased from 2 to 6
      const sourceBall = entities[currentBallKeys[0]];
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
  for (let i = 0; i < 3; i++) { // Optimization: Reduced from 5 to 3
    const id = `p_${Date.now()}_${i}_${Math.random()}`;
    entities[id] = {
      position: [...position],
      velocity: [(Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6],
      size: 3 + Math.random() * 2,
      color,
      opacity: 1,
      renderer: Particle,
    };
  }
};

export default Physics;
