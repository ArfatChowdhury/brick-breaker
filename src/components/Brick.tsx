import React, { useMemo } from 'react';
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
  
  const baseStyle = useMemo(() => ({
    position: 'absolute' as const,
    left: x,
    top: y,
    width,
    height,
    backgroundColor: isStone ? '#78909C' : color,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: isStone ? '#455A64' : 'rgba(255,255,255,0.3)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  }), [x, y, width, height, isStone, color]);

  return (
    <View style={baseStyle}>
      {/* Visual cracks for multi-hit STONE bricks (HP 2 = single cross, HP 1 = double cross) */}
      {isStone && hp === 2 && (
        <View style={styles.crackContainer}>
          <View style={[styles.crack, { transform: [{ rotate: '45deg' }] }]} />
          <View style={[styles.crack, { transform: [{ rotate: '-45deg' }] }]} />
        </View>
      )}
      {isStone && hp === 1 && (
        <View style={styles.crackContainer}>
          <View style={[styles.crack, { transform: [{ rotate: '45deg' }] }]} />
          <View style={[styles.crack, { transform: [{ rotate: '-45deg' }] }]} />
          {/* Second cross offset slightly for "damaged" look */}
          <View style={[styles.crack, { backgroundColor: 'rgba(0,0,0,0.7)', transform: [{ rotate: '15deg' }] }]} />
          <View style={[styles.crack, { backgroundColor: 'rgba(0,0,0,0.7)', transform: [{ rotate: '-15deg' }] }]} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  crackContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crack: {
    position: 'absolute',
    width: '85%',
    height: 1.8,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});

export default React.memo(Brick);
