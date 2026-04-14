import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MissileProps {
  position: [number, number];
  angle: number; // in radians
  size: number;
  scale?: number;
}

const Missile: React.FC<MissileProps> = ({ position, angle, size = 44, scale = 1.0 }) => {
  // 🚀 emoji is naturally angled. We adjust the base rotation to align it.
  const rotation = (angle * 180) / Math.PI + 45; 

  // High-frequency engine shimmer
  const time = Date.now();
  const flicker = (Math.sin(time / 25) + 1.2) * 12;
  const corePulse = (Math.cos(time / 40) + 1.5) * 4;

  return (
    <View
      style={{
        position: 'absolute',
        left: position[0] - size / 2,
        top: position[1] - size / 2,
        width: size,
        height: size,
        transform: [{ rotate: `${rotation}deg` }, { scale }],
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Engine Afterburn Glow */}
      <View style={[styles.thrusterGlow, { bottom: -5 - corePulse, opacity: 0.6 }]} />
      <View style={[styles.flameCore, { height: 15 + flicker, opacity: 0.8 }]} />

      {/* The Rocket Emoji itself */}
      <Text style={{ fontSize: size }}>🚀</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  thrusterGlow: {
    position: 'absolute',
    bottom: -8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF3D00',
    shadowColor: '#FF3D00',
    shadowOpacity: 0.8,
    shadowRadius: 12,
    zIndex: -1,
  },
  flameCore: {
    position: 'absolute',
    bottom: -15,
    width: 8,
    backgroundColor: '#FFFDE7', 
    borderRadius: 4,
    shadowColor: '#FFD600',
    shadowOpacity: 1,
    shadowRadius: 8,
  },
});

export default Missile;
