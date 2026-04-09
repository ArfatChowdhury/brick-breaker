import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface BallProps {
  radius: number;
  position: [number, number];
  color?: string;
}

const Ball: React.FC<BallProps> = ({ radius, position, color = '#FFFFFF' }) => {
  const x = position[0] - radius;
  const y = position[1] - radius;

  const style: ViewStyle = {
    position: 'absolute',
    left: x,
    top: y,
    width: radius * 2,
    height: radius * 2,
    borderRadius: radius,
    backgroundColor: color,
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  };

  return <View style={style} />;
};

export default Ball;
