import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface BrickProps {
  size: [number, number];
  position: [number, number];
  color?: string;
  status: boolean; // true for intact, false for broken
}

const Brick: React.FC<BrickProps> = ({ size, position, color = '#FFD54F', status }) => {
  if (!status) return null;

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
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  };

  return <View style={style} />;
};

export default Brick;
