import React, { useMemo } from 'react';
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

  const baseStyle = useMemo(() => ({
    position: 'absolute' as const,
    left: x,
    top: y,
    width: radius * 2,
    height: radius * 2,
    borderRadius: radius,
    backgroundColor: color,
    borderWidth: 1,
    borderColor: '#FFF',
  }), [x, y, radius, color]);

  return (
    <View style={StyleSheet.absoluteFill}>
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
            opacity: 0.5 - index * 0.15, // Faster fade
            transform: [{ scale: 1 - index * 0.15 }],
          }}
        />
      ))}

      {/* Main Ball */}
      <View style={baseStyle} />
    </View>
  );
};

export default React.memo(Ball);
