import React from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';

interface ScoreBoardProps {
  score: number;
  lives: number;
  missiles?: number;
  mines?: number;
  weaponMode?: 'NORMAL' | 'AIM' | 'MINE';
  powerUpState?: Record<string, number>;
  multiplier?: number;
  startTime?: number;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({
  score,
  lives,
  powerUpState,
  multiplier = 1,
  startTime,
}) => {
  const currentTime = Date.now();
  
  const formattedTime = startTime ? (() => {
    const s = Math.floor((currentTime - startTime) / 1000);
    const m = Math.floor(s / 60);
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  })() : '0:00';

  const getPowerUpProgress = (expiry?: number) => {
    if (!expiry) return 0;
    const duration = 15000;
    const remaining = expiry - currentTime;
    return Math.max(0, Math.min(1, remaining / duration));
  };

  const fireProgress = getPowerUpProgress(powerUpState?.FIRE);
  const wideProgress = getPowerUpProgress(powerUpState?.WIDE);
  const hasPowerUps = fireProgress > 0 || wideProgress > 0;

  return (
    <View style={styles.hud} pointerEvents="none">
      {/* Main HUD Pill */}
      <View style={styles.hudPill}>
        {/* Score Section */}
        <View style={styles.scoreSection}>
          <Text style={styles.hudLabel}>SCORE</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
            {multiplier > 1 && (
              <View style={styles.multiBadge}>
                <Text style={styles.multiText}>{multiplier}×</Text>
              </View>
            )}
            <View style={styles.timerTag}>
              <Text style={styles.timerText}>{formattedTime}</Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Lives Section */}
        <View style={styles.livesSection}>
          <Text style={styles.hudLabel}>LIVES</Text>
          <View style={styles.heartsRow}>
            {[0, 1, 2].map((i) => (
              <Text
                key={i}
                style={[styles.heart, i >= lives && styles.heartDead]}
              >
                ♥
              </Text>
            ))}
          </View>
        </View>
      </View>

      {/* Power-up Progress Bars */}
      {hasPowerUps && (
        <View style={styles.powerUpBars}>
          {fireProgress > 0 && (
            <View style={styles.barRow}>
              <Text style={styles.barIcon}>🔥</Text>
              <View style={styles.barBg}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${fireProgress * 100}%`, backgroundColor: '#FF5252' },
                  ]}
                />
              </View>
            </View>
          )}
          {wideProgress > 0 && (
            <View style={styles.barRow}>
              <Text style={styles.barIcon}>↔</Text>
              <View style={styles.barBg}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${wideProgress * 100}%`, backgroundColor: '#4CAF50' },
                  ]}
                />
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  hud: {
    ...StyleSheet.absoluteFillObject,
    paddingTop: 22,
    paddingHorizontal: 14,
    zIndex: 100,
    justifyContent: 'flex-start',
  },
  hudPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(8, 8, 18, 0.90)',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    // Leave space on right for the WeaponBar overlay
    marginRight: 76,
  },
  scoreSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  hudLabel: {
    color: 'rgba(255,255,255,0.30)',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 2.5,
    marginBottom: 2,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scoreValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  multiBadge: {
    backgroundColor: '#FFEB3B',
    borderRadius: 7,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.25)',
  },
  multiText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '900',
  },
  divider: {
    width: 1,
    height: 38,
    backgroundColor: 'rgba(255,255,255,0.09)',
    marginHorizontal: 16,
  },
  livesSection: {
    alignItems: 'flex-end',
  },
  heartsRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
  },
  heart: {
    fontSize: 18,
    color: '#FF4C6E',
    lineHeight: 22,
  },
  heartDead: {
    color: 'rgba(255,255,255,0.10)',
  },
  powerUpBars: {
    marginTop: 8,
    gap: 5,
    width: '58%',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barIcon: {
    fontSize: 11,
    width: 16,
    textAlign: 'center',
  },
  barBg: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
  timerTag: {
    marginLeft: 8,
    backgroundColor: 'rgba(255, 0, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FF00FF',
  },
  timerText: {
    color: '#FF00FF',
    fontSize: 12,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});

export default ScoreBoard;
