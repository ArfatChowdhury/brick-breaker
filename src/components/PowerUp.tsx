import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

interface PowerUpProps {
  size: [number, number];
  position: [number, number];
  type: 'WIDE' | 'MULTI' | 'PLUS3' | 'FIRE' | 'LIFE';
}

const PowerUp: React.FC<PowerUpProps> = ({ size, position, type }) => {
  const width = size[0];
  const height = size[1];
  const x = position[0] - width / 2;
  const y = position[1] - height / 2;

  const config = {
    WIDE:  { color: '#00E676', icon: '↔️', label: 'WIDE' },
    MULTI: { color: '#2979FF', icon: '3X', label: 'TRIPLE' },
    PLUS3: { color: '#00BCD4', icon: '+3', label: '+3' },
    FIRE:  { color: '#FF5252', icon: '🔥', label: 'FIRE' },
    LIFE:  { color: '#FF4081', icon: '❤️', label: 'LIFE' },
  }[type];

  return (
    <View
      style={[
        styles.container,
        {
          left: x,
          top: y,
          width: width,
          height: height,
          backgroundColor: config.color,
          borderRadius: size[0] / 2,
        },
      ]}
    >
      {/* Balloon Glaze / Highlight */}
      <View style={styles.highlight} />
      
      <Text style={styles.icon}>{config.icon}</Text>
      
      {/* Bottom deeper shade */}
      <View style={styles.bottomShade} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
    elevation: 6,
    overflow: 'hidden',
  },
  highlight: {
    position: 'absolute',
    top: '10%',
    left: '15%',
    width: '40%',
    height: '40%',
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 20,
  },
  bottomShade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '25%',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  icon: {
    fontSize: 13,
    fontWeight: '900',
    color: '#000',
    zIndex: 10,
    textShadowColor: 'rgba(255,255,255,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
});

export default PowerUp;
