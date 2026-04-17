import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface WeaponBarProps {
  missiles: number;
  mines: number;
  weaponMode: 'NORMAL' | 'AIM' | 'MINE';
  onMissilePress: () => void;
  onMinePress: () => void;
}

const WeaponBar: React.FC<WeaponBarProps> = ({
  missiles,
  mines,
  weaponMode,
  onMissilePress,
  onMinePress,
}) => {
  const isMissileActive = weaponMode === 'AIM';
  const isMineActive = weaponMode === 'MINE';
  const missileDisabled = missiles === 0 && !isMissileActive;
  const mineDisabled = mines === 0 && !isMineActive;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Missile Button */}
      <TouchableOpacity
        id="weapon-missile-btn"
        style={[
          styles.btn,
          isMissileActive && styles.btnActive,
          missileDisabled && styles.btnEmpty,
        ]}
        onPress={onMissilePress}
        activeOpacity={0.75}
        disabled={missileDisabled}
      >
        <Text style={styles.icon}>🚀</Text>
        <View style={[styles.badge, missiles === 0 && styles.badgeEmpty]}>
          <Text style={[styles.badgeText, missiles === 0 && styles.badgeTextEmpty]}>
            {missiles}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Mine Button */}
      <TouchableOpacity
        id="weapon-mine-btn"
        style={[
          styles.btn,
          isMineActive && styles.btnActive,
          mineDisabled && styles.btnEmpty,
        ]}
        onPress={onMinePress}
        activeOpacity={0.75}
        disabled={mineDisabled}
      >
        <Text style={styles.icon}>💣</Text>
        <View style={[styles.badge, mines === 0 && styles.badgeEmpty]}>
          <Text style={[styles.badgeText, mines === 0 && styles.badgeTextEmpty]}>
            {mines}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 12,
    top: SCREEN_HEIGHT * 0.30,
    gap: 12,
    zIndex: 200,
  },
  btn: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 15, 25, 0.95)',
    borderWidth: 2,
    borderColor: '#3A3A4A',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
  },
  btnActive: {
    backgroundColor: 'rgba(78, 205, 196, 0.18)',
    borderColor: '#4ECDC4',
    elevation: 20,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1.0,
    shadowRadius: 16,
  },
  btnEmpty: {
    opacity: 0.28,
  },
  icon: {
    fontSize: 28,
    lineHeight: 34,
  },
  badge: {
    position: 'absolute',
    top: -7,
    right: -7,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFEB3B',
    borderWidth: 2,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeEmpty: {
    backgroundColor: '#555',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000',
    lineHeight: 14,
  },
  badgeTextEmpty: {
    color: '#BBB',
  },
});

export default WeaponBar;
