import React from 'react';
import { View } from 'react-native';

const Particle = ({ position, size, color, opacity }: any) => {
  return (
    <View
      style={{
        position: 'absolute',
        left: position[0] - size / 2,
        top: position[1] - size / 2,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: opacity,
      }}
    />
  );
};

export default Particle;
