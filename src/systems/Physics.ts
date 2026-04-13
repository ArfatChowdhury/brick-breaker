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
    } else if (key.startsWith('mine_')) {
      const mine = entities[key];
      const targetBrick = entities[mine.attachedTo];
      
      // 1. Move mine from paddle to target brick (Launch Animation)
      if (targetBrick) {
        const dx = targetBrick.position[0] - mine.position[0];
        const dy = targetBrick.position[1] - mine.position[1];
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist > 5) {
          mine.position[0] += dx * 0.2;
          mine.position[1] += dy * 0.2;
        } else {
          mine.position = [...targetBrick.position];
        }
      }

      if (mine.blastTimer !== undefined) {
        mine.blastTimer -= 1;
        if (mine.blastTimer <= 0) {
          explodeMine(entities, mine.position, mine.attachedTo, dispatch);
          if (targetBrick) {
            targetBrick.status = false;
            scoreBoard._bricksDirty = true;
          }
        }
      }
    } else if (key.startsWith('missile_')) {
      const m = entities[key];
      const dx = m.target[0] - m.position[0];
      const dy = m.target[1] - m.position[1];
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < m.size / 2) {
        // Impact!
        spawnBlastWave(entities, m.position);
        delete entities[key];
        
        // Explode and destroy bricks nearby
        const EXPLOSION_RADIUS = 75;
        scoreBoard._activeBrickKeys.forEach(bk => {
          const b = entities[bk];
          const bDist = Math.sqrt(Math.pow(b.position[0] - m.position[0], 2) + Math.pow(b.position[1] - m.position[1], 2));
          if (bDist < EXPLOSION_RADIUS) {
            b.hp -= 3; // Instant destroy
            if (b.hp <= 0) {
              b.status = false;
              scoreBoard.score += (b.type === 'stone' ? 50 : 10) * scoreBoard.multiplier;
              scoreBoard._bricksDirty = true;
              spawnParticles(entities, b.position, b.color);
            }
          }
        });
        triggerHaptic('impactHeavy');
        dispatch({ type: 'brick-break' });
        scoreBoard.shake += 10;
      } else {
        const speed = 10;
        const timeElapsed = (Date.now() - m.startTime) / 1000;
        
        // Base Direction
        const baseDirX = dx / dist;
        const baseDirY = dy / dist;
        
        // Perpendicular Vector for Spiral (90deg rotate)
        const perpX = -baseDirY;
        const perpY = baseDirX;
        
        // Spiral amplitude diminishes as it gets closer
        const amplitude = Math.min(dist / 3, 40) * Math.sin(timeElapsed * 15);
        
        m.position[0] += (baseDirX * speed) + (perpX * (m.side === 'left' ? 1 : -1) * (amplitude * 0.1));
        m.position[1] += (baseDirY * speed) + (perpY * (m.side === 'left' ? 1 : -1) * (amplitude * 0.1));
        
        // Point towards target, but slightly offset by spiral for natural look
        m.angle = Math.atan2(dy, dx);
      }
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

  // Decay Screen Shake & Flash
  if (scoreBoard.shake > 0) {
    scoreBoard.shake *= 0.88;
    if (scoreBoard.shake < 0.1) scoreBoard.shake = 0;
    if (scoreBoard.shake > 2) dispatch({ type: 'shake', intensity: scoreBoard.shake });
  }
  if (paddle.flash > 0) paddle.flash -= 1;
  
  // 0c. Environmental Trap Mine System
  const allBrickKeys = Object.keys(entities).filter(k => k.startsWith('brick_') || k.startsWith('maze_brick_'));
  const bottomBricks = allBrickKeys.filter(k => {
    const b = entities[k];
    return b.status && b.position[1] > SCREEN_HEIGHT * 0.65;
  });
  
  if (bottomBricks.length > 0 && !scoreBoard.trapActive && (scoreBoard.trapAttempts || 0) < 4) {
    // Spawn a new trap mine
    const randomKey = bottomBricks[Math.floor(Math.random() * bottomBricks.length)];
    const brick = entities[randomKey];
    brick.isTrap = true;
    scoreBoard.trapActive = true;
    scoreBoard.trapId = randomKey;
    scoreBoard.trapTimer = 15 * 60; // 15 seconds at 60fps
    scoreBoard.trapAttempts = (scoreBoard.trapAttempts || 0) + 1;
  }
  
  if (scoreBoard.trapActive) {
    scoreBoard.trapTimer -= 1;
    if (scoreBoard.trapTimer <= 0) {
      // Teleport
      const currentBrick = entities[scoreBoard.trapId];
      if (currentBrick) delete currentBrick.isTrap;
      scoreBoard.trapActive = false;
    }
  }

  // Update Visual States for Ball/Paddle
  const isFireActive = !!scoreBoard.powerUpState.FIRE;
  paddle.isFire = isFireActive;
  paddle.color = isFireActive ? '#FF5252' : '#4DB6AC';

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
      ball.isFire = isFireActive;
      return;
    }
    
    ball.isFire = isFireActive;

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
      const pTop = pY - pH / 2;
      const pBottom = pY + pH / 2;
      const pLeft = pX - pW / 2;
      const pRight = pX + pW / 2;

      // 4a. Side Paddle Collision (Detects hitting the vertical edges)
      if (ball.position[1] + ball.radius > pTop && ball.position[1] - ball.radius < pBottom) {
        if (ball.velocity[0] > 0 && ball.position[0] + ball.radius >= pLeft && ball.position[0] < pLeft) {
          ball.position[0] = pLeft - ball.radius - 1;
          ball.velocity[0] = -Math.abs(ball.velocity[0]);
          triggerHaptic('impactMedium');
          dispatch({ type: 'paddle-hit' });
        } else if (ball.velocity[0] < 0 && ball.position[0] - ball.radius <= pRight && ball.position[0] > pRight) {
          ball.position[0] = pRight + ball.radius + 1;
          ball.velocity[0] = Math.abs(ball.velocity[0]);
          triggerHaptic('impactMedium');
          dispatch({ type: 'paddle-hit' });
        }
      }

      // 4b. Top Paddle Collision (Original Logic)
      if (ball.velocity[1] > 0 && 
          ball.position[1] + ball.radius >= pTop &&
          ball.position[1] - ball.radius <= pBottom &&
          ball.position[0] >= pLeft &&
          ball.position[0] <= pRight) {
        
        ball.position[1] = pTop - ball.radius - 1;
        const hitPos = (ball.position[0] - pX) / (pW / 2);
        ball.velocity[0] = hitPos * 6;
        ball.velocity[1] = -Math.abs(ball.velocity[1]);

        const currentSpeed = Math.sqrt(ball.velocity[0]**2 + ball.velocity[1]**2);
        if (currentSpeed < 14) {
          ball.velocity[0] *= 1.04;
          ball.velocity[1] *= 1.04;
        }
        if (Math.abs(ball.velocity[1]) < MIN_VY) ball.velocity[1] = -MIN_VY;

        scoreBoard.multiplier = 1;
        scoreBoard.streak = 0;
        paddle.flash = 6; // Flash for 6 frames

        spawnParticles(entities, ball.position, '#FFFFFF');
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
          
          if (brick.hp <= 0 || brick.hasMine || brick.isTrap) {
            const isMineHit = brick.hasMine;
            const isTrapHit = brick.isTrap;
            brick.status = false;
            
            scoreBoard.streak += 1;
            scoreBoard.multiplier = 1 + Math.floor(scoreBoard.streak / 6);
            
            if (isTrapHit) {
              scoreBoard.score += 1000; // Big Bonus!
              scoreBoard.trapActive = false;
              scoreBoard.shake += 25;
              spawnBlastWave(entities, brick.position);
            } else {
              scoreBoard.score += (brick.type === 'stone' ? 50 : 10) * scoreBoard.multiplier;
            }
            
            scoreBoard._bricksDirty = true;
            triggerHaptic('impactHeavy');
            
            if (isMineHit) {
              explodeMine(entities, brick.position, bKey, dispatch);
            } else {
              dispatch({ type: brick.type === 'stone' ? 'brick-hit' : 'brick-break' });
              spawnParticles(entities, brick.position, brick.color);
              attemptPowerUpSpawn(entities, brick.position);
            }
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
    const types: ('WIDE' | 'MULTI' | 'PLUS3' | 'FIRE' | 'LIFE')[] = ['WIDE', 'MULTI', 'PLUS3', 'FIRE', 'LIFE'];
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
    case 'MULTI': {
      // TRIPLE logic: Current count * 3 total. If we have N, add 2N.
      const currentBallKeys = Object.keys(entities).filter(k => k.startsWith('ball_'));
      const sourceBall = entities[currentBallKeys[0]];
      if (!sourceBall) return;
      
      const toAddPerBall = 2; // Each existing ball spawns 2 more to TRIPLE
      currentBallKeys.forEach((key, bIdx) => {
        const parentBall = entities[key];
        for (let i = 0; i < toAddPerBall; i++) {
          const newId = `ball_${Date.now()}_${bIdx}_${i}_${Math.random()}`;
          const angleOffset = (i === 0 ? -1 : 1) * 0.5;
          entities[newId] = {
            ...parentBall,
            position: [...parentBall.position],
            velocity: [
              parentBall.velocity[0] + angleOffset * 4,
              parentBall.velocity[1] + (Math.random() - 0.5) * 2
            ],
            renderer: Ball,
            trail: [],
          };
        }
      });
      break;
    }
    case 'PLUS3': {
      // Add exactly 3 more balls
      const currentBallKeys = Object.keys(entities).filter(k => k.startsWith('ball_'));
      const sourceBall = entities[currentBallKeys[0]];
      if (!sourceBall) return;

      for (let i = 0; i < 3; i++) {
        const newId = `ball_plus_${Date.now()}_${i}`;
        entities[newId] = {
          ...sourceBall,
          position: [...sourceBall.position],
          velocity: [
            (i - 1) * 4, // Spread: left, straight, right
            -Math.abs(sourceBall.velocity[1]) || -8
          ],
          renderer: Ball,
          trail: [],
        };
      }
      break;
    }
  }
};

const explodeMissile = (entities: any, position: [number, number], dispatch: any) => {
  triggerHaptic('notificationSuccess');
  dispatch({ type: 'brick-break' });
  
  // Destroy bricks in a small radius (about 50-60 pixels)
  const brickKeys = Object.keys(entities).filter(k => k.startsWith('brick_') || k.startsWith('maze_brick_'));
  brickKeys.forEach(key => {
    const b = entities[key];
    if (!b.status) return;
    const dist = Math.sqrt(Math.pow(b.position[0] - position[0], 2) + Math.pow(b.position[1] - position[1], 2));
    if (dist < 60) {
      b.status = false;
      entities.scoreBoard.score += 20;
      entities.scoreBoard._bricksDirty = true;
      spawnParticles(entities, b.position, b.color || '#FFF');
    }
  });
};

const spawnBlastWave = (entities: any, position: [number, number]) => {
  const blastId = `blast_${Date.now()}`;
  entities[blastId] = {
    position,
    size: 150,
    renderer: require('../components/BlastWave').default,
  };
  // Automatically remove after 500ms
  setTimeout(() => { delete entities[blastId]; }, 500);
};

const explodeMine = (entities: any, position: [number, number], brickId: string, dispatch: any) => {
  spawnBlastWave(entities, position);
  entities.scoreBoard.shake += 15;
  
  triggerHaptic('notificationError');
  dispatch({ type: 'brick-break' });
  
  // Remove mine visual entity
  delete entities[`mine_${brickId}`];

  // Destroy bricks in a larger radius for the mine (80-100 pixels)
  const brickKeys = Object.keys(entities).filter(k => k.startsWith('brick_') || k.startsWith('maze_brick_'));
  brickKeys.forEach(key => {
    const b = entities[key];
    if (!b.status) return;
    const dist = Math.sqrt(Math.pow(b.position[0] - position[0], 2) + Math.pow(b.position[1] - position[1], 2));
    if (dist < 100) {
      b.status = false;
      entities.scoreBoard.score += 30;
      entities.scoreBoard._bricksDirty = true;
      spawnParticles(entities, b.position, b.color || '#F44336');
    }
  });
};

const spawnParticles = (entities: any, position: [number, number], color: string) => {
  // Performance Throttling: Stop particles if there are too many balls
  const ballCount = Object.keys(entities).filter(k => k.startsWith('ball_')).length;
  if (ballCount > 80) return;

  for (let i = 0; i < 3; i++) {
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
