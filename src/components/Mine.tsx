import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface MineProps {
  position: [number, number];
  size: [number, number];
  expiresAt?: number;
  scale?: number;
}

const Mine: React.FC<MineProps> = ({ position, size, expiresAt, scale = 1.0 }) => {
  const width = size[0];
  const height = size[1];
  const currentTime = Date.now();
  const timeLeft = expiresAt ? Math.max(0, expiresAt - currentTime) : 3000;

  // Pulse intensity increases as blast time approaches
  const frequency = timeLeft > 1000 ? 500 : 150;
  const isFlashOn = Math.floor(currentTime / frequency) % 2 === 0;

  return (
    <View
      style={[
        styles.container,
        {
          left: position[0] - width / 2,
          top: position[1] - height / 2,
          width: width,
          height: height,
          transform: [{ scale }],
        },
      ]}
    >
      {/* High-Tech Mine Core */}
      <View style={styles.core}>
          {/* Internal Glowing Component */}
          <View style={[styles.led, { backgroundColor: isFlashOn ? '#FF1744' : '#1a1a1a' }]} />
          
          {/* Stabilization Fins */}
          <View style={[styles.fin, { transform: [{ rotate: '45deg' }] }]} />
          <View style={[styles.fin, { transform: [{ rotate: '-45deg' }] }]} />
      </View>
      
      {/* Electronic Pulse Field */}
      <View style={[styles.ring, { borderColor: isFlashOn ? 'rgba(255, 23, 68, 0.4)' : 'rgba(255,255,255,0.05)' }]} />
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
    width: '70%',
    height: '70%',
    backgroundColor: '#1c1c1c', 
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  led: {
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowColor: '#FF1744',
  },
  fin: {
    position: 'absolute',
    width: '120%',
    height: 2,
    backgroundColor: '#333',
    zIndex: -1,
  },
  ring: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 50,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
});

export default Mine;
