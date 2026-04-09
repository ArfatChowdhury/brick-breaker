import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface PaddleProps {
  size: [number, number];
  position: [number, number];
  color?: string;
}

const Paddle: React.FC<PaddleProps> = ({ size, position, color = '#4DB6AC' }) => {
  const width = size[0];
  const height = size[1];
  const x = position[0] - width / 2;
  const y = position[1] - height / 2;

  const style: ViewStyle = {
    position: 'absolute',
    left: x,
    top: y,
    width: width,
    height: height,
    backgroundColor: color,
    borderRadius: height / 2,
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  };

  return <View style={style} />;
};

export default Paddle;
