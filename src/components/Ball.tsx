import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface BallProps {
  radius: number;
  position: [number, number];
  color?: string;
  trail?: [number, number][];
}

const Ball: React.FC<BallProps> = ({ radius, position, color = '#FFD54F', trail }) => {
  const x = position[0] - radius;
  const y = position[1] - radius;

  return (
    <View style={{ position: 'absolute' }}>
      {/* Motion Trail */}
      {trail && trail.map((pos: [number, number], index: number) => (
        <View
          key={index}
          style={{
            position: 'absolute',
            left: pos[0] - radius,
            top: pos[1] - radius,
            width: radius * 2,
            height: radius * 2,
            borderRadius: radius,
            backgroundColor: color,
            opacity: 0.5 - index * 0.1,
            transform: [{ scale: 1 - index * 0.1 }],
          }}
        />
      ))}

      {/* Main Ball */}
      <View
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: radius * 2,
          height: radius * 2,
          borderRadius: radius,
          backgroundColor: color,
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
          elevation: 8,
          borderWidth: 1,
          borderColor: '#FFF',
        }}
      />
    </View>
  );
};

export default Ball;
