import React from 'react';
import { StyleSheet, View, Text, ViewStyle, TextStyle } from 'react-native';

interface ScoreBoardProps {
  score: number;
  lives: number;
  missiles: number;
  mines: number;
  weaponMode?: 'NORMAL' | 'AIM' | 'MINE';
  powerUpState?: Record<string, number>;
  multiplier?: number;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ score, lives, missiles, mines, weaponMode, powerUpState, multiplier = 1 }) => {
  const currentTime = Date.now();
  
  // Calculate remaining progress for power-ups (0.0 to 1.0)
  const getPowerUpProgress = (expiry?: number) => {
    if (!expiry) return 0;
    const duration = 15000; // Assuming 15s avg
    const remaining = expiry - currentTime;
    return Math.max(0, Math.min(1, remaining / duration));
  };

  const fireProgress = getPowerUpProgress(powerUpState?.FIRE);
  const wideProgress = getPowerUpProgress(powerUpState?.WIDE);

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        {/* Left Side: Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.label}>SCORE</Text>
            <View style={styles.scoreRow}>
              <Text style={styles.value}>{score.toLocaleString()}</Text>
              {multiplier > 1 && (
                <View style={styles.multiplierBadge}>
                  <Text style={styles.multiplierText}>{multiplier}X</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.label}>LIVES</Text>
            <Text style={styles.value}>{'❤️'.repeat(lives)}</Text>
          </View>
        </View>

      </View>

      {/* Vertical Weapon Bar - Right Side */}
      <View style={styles.weaponBarVertical}>
        <View style={[
          styles.weaponBtn, 
          weaponMode === 'AIM' && styles.weaponActive,
          missiles === 0 && styles.weaponEmpty
        ]}>
          <Text style={styles.weaponIcon}>🚀</Text>
          <Text style={[styles.weaponCount, missiles === 0 && styles.weaponCountEmpty]}>{missiles}</Text>
        </View>
        <View style={[
          styles.weaponBtn, 
          weaponMode === 'MINE' && styles.weaponActive,
          mines === 0 && styles.weaponEmpty
        ]}>
          <Text style={styles.weaponIcon}>💣</Text>
          <Text style={[styles.weaponCount, mines === 0 && styles.weaponCountEmpty]}>{mines}</Text>
        </View>
      </View>

      {/* Power-up Progress Bars */}
      <View style={styles.timerContainer}>
        {fireProgress > 0 && (
          <View style={styles.timerRow}>
            <Text style={styles.timerIcon}>🔥</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${fireProgress * 100}%`, backgroundColor: '#FF5252' }]} />
            </View>
          </View>
        )}
        {wideProgress > 0 && (
          <View style={styles.timerRow}>
            <Text style={styles.timerIcon}>↔️</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${wideProgress * 100}%`, backgroundColor: '#4CAF50' }]} />
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: 15,
    marginTop: 40,
    zIndex: 100,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'rgba(25, 25, 35, 0.9)', // Deep Dark Blue Translucent
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#444',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  statBox: {
    alignItems: 'flex-start',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    color: '#888',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: -2,
  },
  value: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
  },
  multiplierBadge: {
    backgroundColor: '#FFEB3B',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: '#000',
  },
  multiplierText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '900',
  },
  weaponBarVertical: {
    position: 'absolute',
    top: 200,
    right: 15,
    gap: 12,
    zIndex: 150,
  },
  weaponBtn: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(40, 40, 50, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#444',
    minWidth: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  weaponActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#FFF',
    transform: [{ scale: 1.05 }],
  },
  weaponIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  weaponCount: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFF',
  },
  weaponEmpty: {
    opacity: 0.4,
    borderColor: '#333',
  },
  weaponCountEmpty: {
    color: '#888',
  },
  timerContainer: {
    marginTop: 8,
    gap: 5,
    width: '60%',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerIcon: {
    fontSize: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});

export default ScoreBoard;
