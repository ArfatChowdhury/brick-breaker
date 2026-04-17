import { Dimensions } from 'react-native';
import Missile from '../components/Missile';
import Mine from '../components/Mine';
import { playSound } from '../utils/audio';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const WeaponSystem = (entities: any, { touches, dispatch, events }: any) => {
  const { scoreBoard } = entities;
  if (!scoreBoard) return entities;

  // ── Handle weapon mode changes from the React UI layer (WeaponBar buttons) ──
  if (events && events.length > 0) {
    events.forEach((e: any) => {
      if (e.type === 'set-weapon-mode') {
        scoreBoard.weaponMode = e.mode;
      }
    });
  }

  // ── Handle weapon FIRING on game-field taps ──
  // The WeaponBar buttons are proper React TouchableOpacity elements, so those
  // touches are consumed by React and will NOT reach the game engine here.
  // The right-edge guard below is a safety net only.
  touches.forEach((t: any) => {
    const { pageX, pageY } = t.event;

    // Safety: ignore touches on the right edge where WeaponBar lives
    const isOnWeaponBar = pageX > SCREEN_WIDTH - 78;
    if (isOnWeaponBar) return;

    if (
      (t.type === 'press' || t.type === 'start') &&
      scoreBoard.weaponMode !== 'NORMAL' &&
      pageY < SCREEN_HEIGHT * 0.75
    ) {
      const paddlePos = [...entities.paddle.position];
      const paddleWidth = entities.paddle.size[0];
      const leftPodX = paddlePos[0] - paddleWidth / 2 + 10;
      const rightPodX = paddlePos[0] + paddleWidth / 2 - 10;
      const podY = paddlePos[1] - 15;

      // ── Fire Missile ──
      if (scoreBoard.weaponMode === 'AIM') {
        if (scoreBoard.missiles > 0) {
          scoreBoard.missiles -= 1;
          scoreBoard.weaponMode = 'NORMAL';
          entities.paddle.recoil = 20;
          entities.paddle.flash = 8;
          playSound('laser_shoot');

          dispatch({ type: 'weapon-mode-change', mode: 'NORMAL' });
          dispatch({ type: 'weapon-counts', missiles: scoreBoard.missiles, mines: scoreBoard.mines });

          entities[`missile_left_${Date.now()}`] = {
            position: [leftPodX, podY],
            target: [pageX, pageY],
            startTime: Date.now(),
            side: 'left',
            velocity: [0, 0],
            size: 40,
            scale: 1.5,
            type: 'missile',
            renderer: Missile,
          };
          entities[`missile_right_${Date.now() + 1}`] = {
            position: [rightPodX, podY],
            target: [pageX, pageY],
            startTime: Date.now(),
            side: 'right',
            velocity: [0, 0],
            size: 40,
            scale: 1.5,
            type: 'missile',
            renderer: Missile,
          };
        }
      }

      // ── Deploy Mine ──
      else if (scoreBoard.weaponMode === 'MINE') {
        if (scoreBoard.mines > 0) {
          const brickKeys = Object.keys(entities).filter(
            k => k.startsWith('brick_') || k.startsWith('maze_brick_')
          );
          let closestBrickId: string | null = null;
          let minDist = 150;

          brickKeys.forEach(key => {
            const b = entities[key];
            if (!b || !b.status) return;
            const dist = Math.sqrt(
              Math.pow(b.position[0] - pageX, 2) + Math.pow(b.position[1] - pageY, 2)
            );
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
            entities.paddle.recoil = 12;
            entities.paddle.flash = 4;
            playSound('blip_select');

            dispatch({ type: 'weapon-mode-change', mode: 'NORMAL' });
            dispatch({ type: 'weapon-counts', missiles: scoreBoard.missiles, mines: scoreBoard.mines });

            entities[`mine_left_${Date.now()}`] = {
              position: [leftPodX, podY],
              size: [...brick.size],
              attachedTo: closestBrickId,
              side: 'left',
              expiresAt: Date.now() + 3000,
              renderer: Mine,
            };
            entities[`mine_right_${Date.now() + 1}`] = {
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
