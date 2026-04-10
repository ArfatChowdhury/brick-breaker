import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

interface PowerUpProps {
  size: [number, number];
  position: [number, number];
  type: 'WIDE' | 'MULTI' | 'FIRE' | 'LIFE';
}

const PowerUp: React.FC<PowerUpProps> = ({ size, position, type }) => {
  const width = size[0];
  const height = size[1];
  const x = position[0] - width / 2;
  const y = position[1] - height / 2;

  const config = {
    WIDE: { color: '#00E676', icon: '↔️' }, // Green
    MULTI: { color: '#2979FF', icon: '3X' }, // Blue
    FIRE: { color: '#FF5252', icon: '🔥' }, // Red
    LIFE: { color: '#FF4081', icon: '❤️' }, // Pink
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
      <Text style={styles.icon}>{config.icon}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 5,
  },
  icon: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default PowerUp;
