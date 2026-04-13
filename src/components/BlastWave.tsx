import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated } from 'react-native';

interface BlastWaveProps {
  position: [number, number];
  size: number;
}

const BlastWave: React.FC<BlastWaveProps> = ({ position, size = 120 }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.circle,
        {
          left: position[0] - size / 2,
          top: position[1] - size / 2,
          width: size,
          height: size,
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  circle: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 4,
    borderColor: '#FFF',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});

export default BlastWave;
