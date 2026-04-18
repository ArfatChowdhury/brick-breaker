import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { getFlagIcon } from '../utils/FlagMapper';

interface FlagMiniPreviewProps {
  isoCode?: string;
  flagColors?: string[];
  flagOrientation?: 'h' | 'v' | 'grid';
  fallbackColor?: string;
}

const FlagMiniPreview: React.FC<FlagMiniPreviewProps> = ({
  isoCode,
  flagColors,
  flagOrientation = 'h',
  fallbackColor = '#1C1D24',
}) => {
  const FlagSvg = getFlagIcon(isoCode);

  if (FlagSvg) {
    return (
      <View style={[StyleSheet.absoluteFillObject, { overflow: 'hidden' }]}>
        <FlagSvg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
      </View>
    );
  }

  // Fallback to legacy block color style if no SVG exists or for special levels
  const colors = flagColors && flagColors.length > 0 ? flagColors : [fallbackColor];
  const isVertical = flagOrientation === 'v';

  return (
    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: fallbackColor, overflow: 'hidden' }]}>
      <View style={[StyleSheet.absoluteFillObject, { flexDirection: isVertical ? 'row' : 'column' }]}>
        {colors.map((color, idx) => (
          <View key={idx} style={{ flex: 1, backgroundColor: color }} />
        ))}
      </View>
    </View>
  );
};

export default FlagMiniPreview;
