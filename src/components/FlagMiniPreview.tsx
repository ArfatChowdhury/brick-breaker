import React from 'react';
import { View, StyleSheet } from 'react-native';

interface FlagMiniPreviewProps {
  flagColors?: string[];
  flagOrientation?: 'h' | 'v';
  fallbackColor?: string;
}

/**
 * Renders a mini flag preview as color stripes.
 * Uses StyleSheet.absoluteFillObject to fill its container.
 * Works for horizontal (h) and vertical (v) stripe layouts.
 */
const FlagMiniPreview: React.FC<FlagMiniPreviewProps> = ({
  flagColors,
  flagOrientation = 'h',
  fallbackColor = '#1C1D24',
}) => {
  const colors = flagColors && flagColors.length > 0 ? flagColors : [fallbackColor];
  const isVertical = flagOrientation === 'v';

  return (
    <View style={[StyleSheet.absoluteFillObject, { flexDirection: isVertical ? 'row' : 'column' }]}>
      {colors.map((color, idx) => (
        <View key={idx} style={{ flex: 1, backgroundColor: color }} />
      ))}
    </View>
  );
};

export default FlagMiniPreview;
