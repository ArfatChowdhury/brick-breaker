import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface MineProps {
  position: [number, number];
  size: [number, number];
  blastTimer?: number;
}

const Mine: React.FC<MineProps> = ({ position, size, blastTimer = 300 }) => {
  const width = size[0];
  const height = size[1];

  // Frequency increases as blastTimer decreases (300 -> 0)
  // Acceleration kicks in at the 2-second mark (120 frames)
  const frequency = blastTimer > 120 
    ? Math.max(4, Math.floor(blastTimer / 15)) 
    : Math.max(1, Math.floor(blastTimer / 8));
  const isFlashOn = Math.floor(Date.now() / (frequency * 16.6)) % 2 === 0;

  return (
    <View
      style={[
        styles.container,
        {
          left: position[0] - width / 2,
          top: position[1] - height / 2,
          width: width,
          height: height,
        },
      ]}
    >
      <View style={styles.core}>
        {/* Flashing Light */}
        <View 
          style={{
            position: 'absolute',
            top: '20%',
            left: '20%',
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: isFlashOn ? '#FF5252' : '#222',
            shadowColor: '#FF5252',
            shadowOpacity: isFlashOn ? 1 : 0,
            shadowRadius: 5,
          }} 
        />
      </View>
      <View style={[styles.ring, { borderColor: isFlashOn ? '#FF5252' : '#555' }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  core: {
    width: '60%',
    height: '60%',
    backgroundColor: '#000',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FF5252',
  },
  ring: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#FF5252',
    borderStyle: 'dashed',
  },
});

export default Mine;
