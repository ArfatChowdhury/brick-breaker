import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ViewStyle, Animated } from 'react-native';
import FlagMiniPreview from './FlagMiniPreview';

interface PaddleProps {
  size: [number, number];
  position: [number, number];
  color?: string;
  isFire?: boolean;
  flash?: number;
  weaponMode?: 'NORMAL' | 'AIM' | 'MINE';
  recoil?: number;
  themeId?: string;
  flagSkin?: string | null;
}

const Paddle: React.FC<PaddleProps> = ({ 
  size, 
  position, 
  color = '#4DB6AC', 
  isFire, 
  flash = 0, 
  weaponMode = 'NORMAL',
  recoil = 0,
  themeId = 'theme_classic',
  flagSkin = null
}) => {
  const width = size[0];
  const height = size[1];
  const x = position[0] - width / 2;
  const y = position[1] - height / 2;

  // Animation for rising pods
  const riseAnim = useRef(new Animated.Value(0)).current;
  const isWeaponActive = weaponMode === 'AIM' || weaponMode === 'MINE';

  useEffect(() => {
    Animated.spring(riseAnim, {
      toValue: isWeaponActive ? 1 : 0,
      speed: 14,
      bounciness: 8,
      useNativeDriver: true,
    }).start();
  }, [isWeaponActive]);

  // Pods rise from hidden (below paddle top edge) to above the paddle
  const podHeight = 38; 
  const translateY = riseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [podHeight, 0],
  });
  const podOpacity = riseAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0.3, 1],
  });

  // ── Theme Mapping ──
  const isNeon = themeId === 'theme_neon';
  const isInferno = themeId === 'theme_inferno';

  const getThemeStyles = () => {
    if (isFire) return { bgColor: '#FF5252', borderColor: '#000', shadow: '#FF5252', glow: 15 };
    if (isNeon) return { bgColor: '#9C27B0', borderColor: '#E1BEE7', shadow: '#E1BEE7', glow: 20 };
    if (isInferno) return { bgColor: '#BF360C', borderColor: '#FFAB91', shadow: '#D84315', glow: 25 };
    return { bgColor: color, borderColor: '#000000', shadow: '#000', glow: 0 };
  };

  const theme = getThemeStyles();

  const baseStyle: ViewStyle = {
    position: 'absolute' as const,
    left: x,
    top: y + recoil, 
    width: width,
    height: height,
    backgroundColor: theme.bgColor,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: theme.borderColor,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: theme.glow,
    elevation: 6,
    zIndex: 10,
    overflow: 'visible', 
  };

  // Advanced Weapon Pods (Rocket or Bomb)
  const renderPod = (side: 'left' | 'right') => (
    <Animated.View 
      key={side}
      style={[
        styles.launcherPod, 
        { 
          [side]: 10, 
          bottom: '100%',
          opacity: podOpacity,
          transform: [{ translateY }], 
        }
      ]}
    >
      {weaponMode === 'AIM' ? (
        <View style={styles.emojiPod}>
          <Text style={styles.miniRocket}>🚀</Text>
        </View>
      ) : (
        <View style={styles.emojiPod}>
          <Text style={styles.miniMine}>💣</Text>
        </View>
      )}
    </Animated.View>
  );

  return (
      <View style={baseStyle}>
        {/* Flag Skin Background */}
        {flagSkin && (
          <View style={[StyleSheet.absoluteFillObject, { borderRadius: 8, overflow: 'hidden' }]}>
            <FlagMiniPreview isoCode={flagSkin} />
          </View>
        )}

        {/* Glossy Highlight for Cartoon effect */}
      <View style={[
        styles.gloss, 
        { 
          backgroundColor: isNeon ? 'rgba(225,190,231,0.3)' : isInferno ? 'rgba(255,171,145,0.2)' : 'rgba(255,255,255,0.25)' 
        }
      ]} />
      
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

      {/* Rocket Pods — rise above paddle when AIM mode is ON */}
      {renderPod('left')}
      {renderPod('right')}
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
  },
  bottomShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '20%',
    backgroundColor: 'rgba(0,0,0,0.15)',
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
    width: 24,
    height: 40,
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 20, 
    flexDirection: 'column',
  },
  emojiPod: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniRocket: {
    fontSize: 22,
    transform: [{ rotate: '-45deg' }],
  },
  miniMine: {
    fontSize: 18,
  },

});

export default Paddle;
