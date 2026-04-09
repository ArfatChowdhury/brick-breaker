import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MovePaddle = (entities: any, { touches }: any) => {
  const paddle = entities.paddle;

  touches
    .filter((t: any) => t.type === 'move')
    .forEach((t: any) => {
      if (paddle && paddle.position) {
        // Update x position based on touch movement delta or absolute position
        // For simpler control, let's use absolute x of the touch
        const newX = t.event.pageX;
        
        // Boundaries
        const halfWidth = paddle.size[0] / 2;
        if (newX - halfWidth >= 0 && newX + halfWidth <= SCREEN_WIDTH) {
          paddle.position[0] = newX;
        } else if (newX - halfWidth < 0) {
          paddle.position[0] = halfWidth;
        } else if (newX + halfWidth > SCREEN_WIDTH) {
          paddle.position[0] = SCREEN_WIDTH - halfWidth;
        }
      }
    });

  return entities;
};

export default MovePaddle;
