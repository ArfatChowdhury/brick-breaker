import { Dimensions } from 'react-native';
import Missile from '../components/Missile';
import Mine from '../components/Mine';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const WeaponSystem = (entities: any, { touches, dispatch }: any) => {
  const { scoreBoard } = entities;
  if (!scoreBoard) return entities;

  touches.filter((t: any) => t.type === 'press').forEach((t: any) => {
    const { pageX, pageY } = t.event;

    // 1. Detect Taps on ScoreBoard Weapon Icons (Hacky coordinates in HUD zone)
    // ScoreBoard is at margin 10, marginTop 40. Bar is below stats.
    // 1. Detect Taps on ScoreBoard Weapon Icons
    if (pageY > 20 && pageY < 140) {
      if (pageX > SCREEN_WIDTH - 180 && pageX < SCREEN_WIDTH - 100) {
        // Toggle Missile Mode
        const newMode = scoreBoard.weaponMode === 'AIM' ? 'NORMAL' : 'AIM';
        scoreBoard.weaponMode = newMode;
        dispatch({ type: 'weapon-mode-change', mode: newMode });
        return;
      } else if (pageX > SCREEN_WIDTH - 90 && pageX < SCREEN_WIDTH - 10) {
        // Toggle Mine Mode
        const newMode = scoreBoard.weaponMode === 'MINE' ? 'NORMAL' : 'MINE';
        scoreBoard.weaponMode = newMode;
        dispatch({ type: 'weapon-mode-change', mode: newMode });
        return;
      }
    }

    // 2. Handle Weapon Deployment (Only if tapping above the paddle zone)
    if (scoreBoard.weaponMode !== 'NORMAL' && pageY < SCREEN_HEIGHT * 0.7) {
      if (scoreBoard.weaponMode === 'AIM') {
      if (scoreBoard.missiles > 0) {
        scoreBoard.missiles -= 1;
        scoreBoard.weaponMode = 'NORMAL';
        dispatch({ type: 'weapon-mode-change', mode: 'NORMAL' });
        
        // Spawn Dual Missiles
        const target = [pageX, pageY];
        const paddlePos = [...entities.paddle.position];
        
        entities[`missile_left_${Date.now()}`] = {
          position: [paddlePos[0] - 25, paddlePos[1]],
          target: [...target],
          startTime: Date.now(),
          side: 'left',
          velocity: [0, 0],
          size: 40,
          type: 'missile',
          renderer: Missile,
        };
        entities[`missile_right_${Date.now()}`] = {
          position: [paddlePos[0] + 25, paddlePos[1]],
          target: [...target],
          startTime: Date.now(),
          side: 'right',
          velocity: [0, 0],
          size: 40,
          type: 'missile',
          renderer: Missile,
        };
      }
    } else if (scoreBoard.weaponMode === 'MINE') {
      if (scoreBoard.mines > 0) {
        // Find closest brick
        const brickKeys = Object.keys(entities).filter(k => k.startsWith('brick_') || k.startsWith('maze_brick_'));
        let closestBrickId = null;
        let minDist = 100;

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
          
          // Add Mine visual entity
          entities[`mine_${closestBrickId}`] = {
            position: [...entities.paddle.position],
            size: [...brick.size],
            attachedTo: closestBrickId,
            blastTimer: 300, // Exactly 5 seconds at 60fps
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
