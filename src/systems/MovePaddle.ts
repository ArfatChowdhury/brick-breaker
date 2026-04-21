import { Dimensions } from 'react-native';


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MovePaddle = (entities: any, { touches }: any) => {
  const paddle = entities.paddle;
  const scoreBoard = entities.scoreBoard;

  touches
    .filter((t: any) => t.type === 'move' || t.type === 'press' || t.type === 'start')
    .forEach((t: any) => {
      const touchY = t.event.pageY;
      const isBottomTouch = touchY > SCREEN_HEIGHT * 0.65;

      if (paddle && isBottomTouch) {
        let newX = t.event.pageX;
        
        // Boundaries for targetX
        const halfWidth = paddle.size[0] / 2;
        if (newX < halfWidth) newX = halfWidth;
        if (newX > SCREEN_WIDTH - halfWidth) newX = SCREEN_WIDTH - halfWidth;
        
        paddle.targetX = newX;

      }
    });

  return entities;
};

export default MovePaddle;
