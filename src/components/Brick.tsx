import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface BrickProps {
  size: [number, number];
  position: [number, number];
  color?: string;
  status: boolean;
  type?: 'regular' | 'stone';
  hp?: number;
}

const Brick: React.FC<BrickProps> = ({ 
  size, 
  position, 
  color = '#FFD54F', 
  status, 
  type = 'regular',
  hp = 1 
}) => {
  if (!status) return null;

  const width = size[0];
  const height = size[1];
  const x = position[0] - width / 2;
  const y = position[1] - height / 2;

  const isStone = type === 'stone';
  
  const style: ViewStyle = {
    position: 'absolute',
    left: x,
    top: y,
    width: width,
    height: height,
    backgroundColor: isStone ? '#78909C' : color, // Grey for stone
    borderRadius: 2,
    borderWidth: 1,
    borderColor: isStone ? '#455A64' : 'rgba(255,255,255,0.3)',
    opacity: hp === 1 && isStone ? 0.7 : 1, // Subtle hint for damaged stone
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  };

  return <View style={style} />;
};

export default Brick;
