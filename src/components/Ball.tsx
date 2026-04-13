import React, { useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface BallProps {
  radius: number;
  position: [number, number];
  color?: string;
  trail?: [number, number][];
  isFire?: boolean;
}

const Ball: React.FC<BallProps> = ({ radius, position, color = '#FFD54F', trail, isFire }) => {
  const x = position[0] - radius;
  const y = position[1] - radius;

  const baseStyle = useMemo(() => ({
    position: 'absolute' as const,
    left: x,
    top: y,
    width: radius * 2,
    height: radius * 2,
    borderRadius: radius,
    backgroundColor: isFire ? '#FF5252' : '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#000000',
    shadowColor: isFire ? '#F44336' : '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: isFire ? 0.8 : 0,
    shadowRadius: 10,
    elevation: isFire ? 8 : 0,
  }), [x, y, radius, isFire]);

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
            backgroundColor: isFire ? '#FF5252' : color,
            opacity: 0.4 - index * 0.08,
            transform: [{ scale: 1 - index * 0.12 }],
          }}
        />
      ))}

      {/* Main Ball Body */}
      <View style={baseStyle}>
          {/* Main Gloss Highlight */}
          <View style={[styles.gloss, { borderRadius: radius }]} />
          
          {/* Top-left Glint */}
          <View style={[styles.glint, { borderRadius: radius / 2 }]} />
          
          {/* Small Sparkle */}
          <View style={[styles.sparkle, { borderRadius: 2 }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    gloss: {
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '80%',
        height: '40%',
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    glint: {
        position: 'absolute',
        top: '15%',
        left: '20%',
        width: '25%',
        height: '25%',
        backgroundColor: 'rgba(255,255,255,0.6)',
    },
    sparkle: {
        position: 'absolute',
        top: '25%',
        left: '55%',
        width: 4,
        height: 4,
        backgroundColor: 'white',
    }
});

export default React.memo(Ball);
