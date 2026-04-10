import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MovePaddle = (entities: any, { touches }: any) => {
  const paddle = entities.paddle;

  touches
    .filter((t: any) => t.type === 'move' || t.type === 'press')
    .forEach((t: any) => {
      if (paddle) {
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
