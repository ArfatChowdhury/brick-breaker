import { Dimensions } from 'react-native';
import Missile from '../components/Missile';
import Mine from '../components/Mine';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const WeaponSystem = (entities: any, { touches, dispatch }: any) => {
  const { scoreBoard } = entities;
  if (!scoreBoard) return entities;

  touches.forEach((t: any) => {
    const { pageX, pageY } = t.event;

    // Define UI Region for the vertical buttons (Lowered now to match ScoreBoard.tsx)
    const isRightEdge = pageX > SCREEN_WIDTH - 150;
    const isUiArea = isRightEdge && pageY > 200 && pageY < 500;

    // 1. Detect Taps on ScoreBoard Weapon Icons (Vertical Bar on Right)
    // IMPORTANT: Only use "start" event for UI buttons to prevent double-firing (select/deselect)
    if (t.type === 'start' && isUiArea) {
      if (pageY > 200 && pageY < 320) {
        // Toggle Missile Mode (only if we have missiles, or we want to turn it off)
        if (scoreBoard.missiles > 0 || scoreBoard.weaponMode === 'AIM') {
          const newMode = scoreBoard.weaponMode === 'AIM' ? 'NORMAL' : 'AIM';
          scoreBoard.weaponMode = newMode;
          dispatch({ type: 'weapon-mode-change', mode: newMode });
        }
        return;
      } else if (pageY > 320 && pageY < 450) {
        // Toggle Mine Mode (only if we have mines, or we want to turn it off)
        if (scoreBoard.mines > 0 || scoreBoard.weaponMode === 'MINE') {
          const newMode = scoreBoard.weaponMode === 'MINE' ? 'NORMAL' : 'MINE';
          scoreBoard.weaponMode = newMode;
          dispatch({ type: 'weapon-mode-change', mode: newMode });
        }
        return;
      }
    }

    // 2. Handle Weapon Deployment (We can allow 'press' or 'start' here)
    // CRITICAL: Ensure we are NOT in the `isUiArea` so we don't accidentally fire at the buttons we just tapped
    if ((t.type === 'press' || t.type === 'start') && scoreBoard.weaponMode !== 'NORMAL' && !isUiArea && pageY < SCREEN_HEIGHT * 0.7) {

      const target = [pageX, pageY];
      const paddlePos = [...entities.paddle.position];
      const paddleWidth = entities.paddle.size[0];
      const leftPodX = paddlePos[0] - paddleWidth / 2 + 10;
      const rightPodX = paddlePos[0] + paddleWidth / 2 - 10;
      const podY = paddlePos[1] - 15;

      if (scoreBoard.weaponMode === 'AIM') {
        if (scoreBoard.missiles > 0) {
          scoreBoard.missiles -= 1;
          scoreBoard.weaponMode = 'NORMAL';
          dispatch({ type: 'weapon-mode-change', mode: 'NORMAL' });
          entities.paddle.recoil = 20; // Hard Kick
          entities.paddle.flash = 8;   // Muzzle Flash
          
          entities[`missile_left_${Date.now()}`] = {
            position: [leftPodX, podY],
            target: [...target],
            startTime: Date.now(),
            side: 'left',
            velocity: [0, 0],
            size: 40,
            scale: 1.5, // Start with a 'burst' scale
            type: 'missile',
            renderer: Missile,
          };
          entities[`missile_right_${Date.now()}`] = {
            position: [rightPodX, podY],
            target: [...target],
            startTime: Date.now(),
            side: 'right',
            velocity: [0, 0],
            size: 40,
            scale: 1.5,
            type: 'missile',
            renderer: Missile,
          };
        }
      } else if (scoreBoard.weaponMode === 'MINE') {
        if (scoreBoard.mines > 0) {
          // Find closest brick
          const brickKeys = Object.keys(entities).filter(k => k.startsWith('brick_') || k.startsWith('maze_brick_'));
          let closestBrickId = null;
          let minDist = 150;

          brickKeys.forEach(key => {
            const b = entities[key];
            if (!b.status) return;
            const dist = Math.sqrt(Math.pow(b.position[0] - pageX, 2) + Math.pow(b.position[1] - pageY, 2));
            if (dist < minDist) {
              minDist = dist;
              closestBrickId = key;
            }
          });

          if (closestBrickId) {
            const brick = entities[closestBrickId];
            brick.hasMine = true;
            scoreBoard.mines -= 1;
            scoreBoard.weaponMode = 'NORMAL';
            dispatch({ type: 'weapon-mode-change', mode: 'NORMAL' });
            entities.paddle.recoil = 12;
            entities.paddle.flash = 4;
            
            // Launch from both pods (Double deployment for satisfaction)
            entities[`mine_left_${Date.now()}`] = {
              position: [leftPodX, podY],
              size: [...brick.size],
              attachedTo: closestBrickId,
              side: 'left',
              expiresAt: Date.now() + 3000,
              renderer: Mine,
            };
            entities[`mine_right_${Date.now()}`] = {
              position: [rightPodX, podY],
              size: [...brick.size],
              attachedTo: closestBrickId,
              side: 'right',
              expiresAt: Date.now() + 3000,
              renderer: Mine,
            };
          }
        }
      }
    }
  });

  return entities;
};

export default WeaponSystem;
