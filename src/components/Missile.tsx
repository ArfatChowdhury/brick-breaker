import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface MissileProps {
  position: [number, number];
  angle: number; // in radians
  size: number;
}

const Missile: React.FC<MissileProps> = ({ position, angle, size = 40 }) => {
  const rotation = (angle * 180) / Math.PI + 90;

  // Dynamic Flame Flicker
  const flicker = (Math.sin(Date.now() / 50) + 1.2) * 10;

  return (
    <View
      style={{
        position: 'absolute',
        left: position[0] - size / 2,
        top: position[1] - size / 2,
        width: size,
        height: size,
        transform: [{ rotate: `${rotation}deg` }],
      }}
    >
      {/* Flame Trail Effect */}
      <View style={[styles.flame, { height: 15 + flicker, opacity: 0.6 + (flicker / 40) }]} />
      
      <View style={styles.missileBody}>
          <View style={styles.nose} />
          <View style={styles.fins} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  missileBody: {
    width: '100%',
    height: '100%',
    backgroundColor: '#90A4AE',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#000',
  },
  nose: {
    position: 'absolute',
    top: -10,
    left: '25%',
    width: '50%',
    height: 15,
    backgroundColor: '#F44336',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 2,
    borderColor: '#000',
  },
  fins: {
    position: 'absolute',
    bottom: 5,
    left: -5,
    width: '120%',
    height: 10,
    backgroundColor: '#FFC107',
    borderWidth: 2,
    borderColor: '#000',
  },
  flame: {
      position: 'absolute',
      bottom: -15,
      left: '35%',
      width: '30%',
      height: 20,
      backgroundColor: '#FF5722',
      borderRadius: 10,
      opacity: 0.8,
  }
});

export default Missile;
