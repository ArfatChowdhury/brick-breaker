import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, ViewStyle, Animated, Text } from 'react-native';

interface PaddleProps {
  size: [number, number];
  position: [number, number];
  color?: string;
  isFire?: boolean;
  flash?: number;
  weaponMode?: 'NORMAL' | 'AIM' | 'MINE';
}

const Paddle: React.FC<PaddleProps> = ({ size, position, color = '#4DB6AC', isFire, flash = 0, weaponMode = 'NORMAL' }) => {
  const width = size[0];
  const height = size[1];
  const x = position[0] - width / 2;
  const y = position[1] - height / 2;

  // Animation for rising pods
  const riseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(riseAnim, {
      toValue: weaponMode !== 'NORMAL' ? 1 : 0,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [weaponMode]);

  const translateY = riseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, -5], // Rise from inside to above
  });

  const baseStyle: ViewStyle = {
    position: 'absolute' as const,
    left: x,
    top: y,
    width: width,
    height: height,
    backgroundColor: isFire ? '#FF5252' : color,
    borderRadius: height / 2,
    borderWidth: 3,
    borderColor: '#000000',
    // Comic shadow
    shadowColor: isFire ? '#FF5252' : '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: isFire ? 15 : 0,
    elevation: 6,
    zIndex: 10,
  };

  return (
    <View style={baseStyle}>
      {/* Glossy Highlight for Cartoon effect */}
      <View style={styles.gloss} />
      
      {/* Bottom deeper shadow area */}
      <View style={styles.bottomShadow} />

      {/* Center Shine */}
      <View style={styles.shine} />

      {/* Flash Overlay */}
      {flash > 0 && (
        <View 
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'white',
            opacity: flash / 6,
          }} 
        />
      )}

      {/* Mechanical Rising Pods */}
      <Animated.View style={[styles.launcherPod, { left: -30, transform: [{ translateY }] }]}>
        <View style={styles.tube}>
          <View style={styles.neonRing} />
          <Text style={styles.weaponIcon}>{weaponMode === 'MINE' ? '💣' : '🚀'}</Text>
        </View>
        <View style={styles.baseJoint} />
      </Animated.View>

      <Animated.View style={[styles.launcherPod, { right: -30, transform: [{ translateY }] }]}>
        <View style={styles.tube}>
          <View style={styles.neonRing} />
          <Text style={styles.weaponIcon}>{weaponMode === 'MINE' ? '💣' : '🚀'}</Text>
        </View>
        <View style={styles.baseJoint} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  gloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  bottomShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '20%',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  shine: {
    position: 'absolute',
    top: 3,
    left: '10%',
    width: '80%',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 2,
  },
  launcherPod: {
    position: 'absolute',
    width: 35,
    height: 45,
    alignItems: 'center',
    zIndex: -1, // Behind the main paddle body
  },
  tube: {
    width: 30,
    height: 40,
    backgroundColor: '#37474F',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  neonRing: {
    position: 'absolute',
    top: 5,
    width: '100%',
    height: 4,
    backgroundColor: '#00E5FF', // Cyan Neon
    shadowColor: '#00E5FF',
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  baseJoint: {
    width: 15,
    height: 10,
    backgroundColor: '#263238',
    borderWidth: 1,
    borderColor: '#000',
  },
  weaponIcon: {
    fontSize: 18,
    marginTop: 5,
  },
});

export default Paddle;

export default Paddle;
