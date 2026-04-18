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
interface FlagMiniPreviewProps {
  flagColors?: string[];
  flagOrientation?: 'h' | 'v' | 'grid';
  ratios?: number[]; // [2, 1, 1] for Colombia etc.
  symbol?: 'circle' | 'moon' | 'none';
  symbolColor?: string;
  fallbackColor?: string;
}

const FlagMiniPreview: React.FC<FlagMiniPreviewProps> = ({
  flagColors,
  flagOrientation = 'h',
  ratios,
  symbol = 'none',
  symbolColor = '#FFF',
  fallbackColor = '#1C1D24',
}) => {
  const colors = flagColors && flagColors.length > 0 ? flagColors : [fallbackColor];
  const isVertical = flagOrientation === 'v';

  return (
    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: fallbackColor, overflow: 'hidden' }]}>
      <View style={[StyleSheet.absoluteFillObject, { flexDirection: isVertical ? 'row' : 'column' }]}>
        {colors.map((color, idx) => {
          const flexVal = ratios && ratios[idx] ? ratios[idx] : 1;
          return <View key={idx} style={{ flex: flexVal, backgroundColor: color }} />;
        })}
      </View>
      
      {symbol === 'circle' && (
        <View style={styles.symbolContainer}>
          <View style={[styles.circle, { backgroundColor: symbolColor }]} />
        </View>
      )}
      {symbol === 'moon' && (
        <View style={styles.symbolContainer}>
          <View style={[styles.circle, { backgroundColor: symbolColor, opacity: 0.8 }]} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  symbolContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: '40%',
    aspectRatio: 1,
    borderRadius: 50,
  }
});

export default FlagMiniPreview;
