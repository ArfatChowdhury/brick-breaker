import React, { useMemo } from 'react';
import { View } from 'react-native';

const Particle = ({ position, size, color, opacity }: any) => {
  const style = useMemo(() => ({
    position: 'absolute' as const,
    left: position[0] - size / 2,
    top: position[1] - size / 2,
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
    opacity: opacity,
  }), [position[0], position[1], size, color, opacity]);

  return <View style={style} />;
};

export default React.memo(Particle);
