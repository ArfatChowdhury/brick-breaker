import React, { useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface BrickProps {
  size: [number, number];
  position: [number, number];
  color?: string;
  status: boolean;
  type?: 'regular' | 'stone';
  hp?: number;
  isTrap?: boolean;
  trapTimer?: number;
}

const Brick: React.FC<BrickProps> = ({ 
  size, 
  position, 
  color = '#FFD54F', 
  status, 
  type = 'regular',
  hp = 1,
  isTrap = false,
  trapTimer = 0
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
    backgroundColor: isTrap ? '#FFD700' : (isStone ? '#78909C' : color),
    borderRadius: 6,
    borderWidth: isTrap ? 3 : 2,
    borderColor: isTrap ? '#FF0000' : '#000000',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    overflow: 'hidden',
    // Slight comic shadow
    shadowColor: isTrap ? '#FF0000' : '#000',
    shadowOffset: { width: isTrap ? 0 : 2, height: isTrap ? 0 : 2 },
    shadowOpacity: 0.6,
    shadowRadius: isTrap ? 10 : 0,
    elevation: 3,
  }), [x, y, width, height, isStone, color, isTrap]);

  return (
    <View style={baseStyle as any}>
      {/* Top Highlight Strip */}
      <View 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '35%',
          backgroundColor: 'rgba(255,255,255,0.2)',
        }} 
      />

      {/* Visual cracks for multi-hit STONE bricks */}
      {isStone && hp < 3 && (
        <View style={styles.crackContainer}>
          <View style={[styles.crack, { width: '80%', transform: [{ rotate: '45deg' }] }]} />
          <View style={[styles.crack, { width: '80%', transform: [{ rotate: '-45deg' }] }]} />
          {hp === 1 && (
            <>
              <View style={[styles.crack, { width: '60%', top: '30%', transform: [{ rotate: '15deg' }] }]} />
              <View style={[styles.crack, { width: '60%', bottom: '30%', transform: [{ rotate: '-15deg' }] }]} />
            </>
          )}
        </View>
      )}

      {/* Trap Mine Visuals */}
      {isTrap && (
        <View style={styles.trapOverlay}>
          <Text style={{ fontSize: width * 0.5 }}>💣</Text>
        </View>
      )}
    </View>
  );
};

import { Text } from 'react-native';

const styles = StyleSheet.create({
  crackContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trapOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.2)', // Golden tint
  },
  crack: {
    position: 'absolute',
    width: '85%',
    height: 1.8,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});

export default React.memo(Brick);
