import React, { useState, useRef, useEffect } from 'react';
import {
  StatusBar, StyleSheet, View, Text, TouchableOpacity,
  Animated, Easing, ScrollView,
} from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import { getEntities } from './src/entities';
import MovePaddle from './src/systems/MovePaddle';
import Physics from './src/systems/Physics';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { FLAG_LEVELS } from './src/levels';
import { playSound } from './src/utils/audio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { triggerHaptic } from './src/utils/haptics';

// Difficulty stars for each level (1-5)
const LEVEL_DIFFICULTY: Record<string, number> = {
  BD: 1, JP: 1, TR: 2, PS: 2, SA: 2, US: 2,
  NP: 3, FORTRESS: 3, UK: 3, BR: 4, KR: 3,
  HOURGLASS: 5, DIAMOND_CORE: 5,
};

export default function App() {
  const [running, setRunning] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [unlockedLevels, setUnlockedLevels] = useState(FLAG_LEVELS.map((_, i) => i));
  const [highScores, setHighScores] = useState<{ [key: string]: number }>({});
  const [go, setGo] = useState(false);
  const [win, setWin] = useState(false);
  const [paused, setPaused] = useState(false);
  const [waitingToStart, setWaitingToStart] = useState(true);
  const gameEngineRef = useRef<any>(null);

  // Pulsing animation for TAP TO SERVE
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (waitingToStart && !paused) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [waitingToStart, paused]);

  useEffect(() => { loadProgress(); }, []);

  const loadProgress = async () => {
    try {
      const savedLevels = await AsyncStorage.getItem('@unlocked_levels');
      const savedScores = await AsyncStorage.getItem('@high_scores');
      if (savedLevels) setUnlockedLevels(JSON.parse(savedLevels));
      if (savedScores) setHighScores(JSON.parse(savedScores));
    } catch (e) { console.log('Error loading progress', e); }
  };

  const saveProgress = async (levels: number[], scores: any) => {
    try {
      await AsyncStorage.setItem('@unlocked_levels', JSON.stringify(levels));
      await AsyncStorage.setItem('@high_scores', JSON.stringify(scores));
    } catch (e) { console.log('Error saving progress', e); }
  };

  const resetProgress = async () => {
    try {
      await AsyncStorage.clear();
      setUnlockedLevels([0]);
      setHighScores({});
      triggerHaptic('notificationSuccess');
    } catch (e) { console.log('Error resetting progress', e); }
  };

  const onEvent = (e: any) => {
    switch (e.type) {
      case 'game-over':
        setRunning(false); setGo(true); playSound('lose'); break;
      case 'win':
        handleWin(e.score); break;
      case 'paddle-hit': playSound('hit'); break;
      case 'brick-hit':  playSound('hit'); break;
      case 'brick-break': playSound('break'); break;
      case 'wall-hit':  playSound('wall'); break;
      case 'powerup-collect': playSound('powerup'); break;
      case 'lose-life':
        playSound('lose');
        setWaitingToStart(true);
        break;
    }
  };

  const handleWin = (finalScore: number) => {
    setRunning(false); setWin(true); setWaitingToStart(true);
    playSound('win'); triggerHaptic('notificationSuccess');

    const currentScore = finalScore || 0;
    const levelId = FLAG_LEVELS[currentLevel].id;
    const newScores = { ...highScores };
    if (!newScores[levelId] || currentScore > newScores[levelId]) newScores[levelId] = currentScore;
    setHighScores(newScores);

    let newUnlocked = [...unlockedLevels];
    if (currentLevel + 1 < FLAG_LEVELS.length && !unlockedLevels.includes(currentLevel + 1)) {
      newUnlocked = [...unlockedLevels, currentLevel + 1];
      setUnlockedLevels(newUnlocked);
    }
    saveProgress(newUnlocked, newScores);
  };

  const startLevel = (index: number) => {
    setCurrentLevel(index); setShowMenu(false); setRunning(true);
    setPaused(false); setWaitingToStart(true); setWin(false); setGo(false);
    if (gameEngineRef.current) {
      const ents = getEntities(index);
      ents.scoreBoard.waitingToStart = true;
      gameEngineRef.current.swap(ents);
    }
  };

  const launchBall = () => {
    if (waitingToStart && !paused && !showMenu && !win && !go) {
      if (gameEngineRef.current && typeof gameEngineRef.current.dispatch === 'function') {
        setWaitingToStart(false);
        gameEngineRef.current.dispatch({ type: 'launch' });
      }
    }
  };

  const togglePause = () => { setPaused(p => !p); triggerHaptic('impactLight'); };

  const reset = () => {
    setGo(false); setWin(false); setRunning(true); setWaitingToStart(true);
    if (gameEngineRef.current) {
      const ents = getEntities(currentLevel);
      ents.scoreBoard.waitingToStart = true;
      gameEngineRef.current.swap(ents);
    }
  };

  const backToMenu = () => {
    setShowMenu(true); setRunning(false); setWin(false); setGo(false); setPaused(false);
  };

  const renderDifficultyStars = (levelId: string) => {
    const stars = LEVEL_DIFFICULTY[levelId] || 1;
    return (
      <View style={styles.starsRow}>
        {[1,2,3,4,5].map(i => (
          <Text key={i} style={[styles.star, i <= stars && styles.starActive]}>★</Text>
        ))}
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar hidden />

        {/* Game Layer */}
        <View
          style={[styles.gameWrapper, showMenu && { opacity: 0 }]}
          pointerEvents={showMenu ? 'none' : 'auto'}
        >
          <GameEngine
            ref={gameEngineRef}
            style={styles.gameContainer}
            systems={[MovePaddle, Physics]}
            entities={getEntities(currentLevel)}
            running={running && !paused && !win && !go}
            onEvent={onEvent}
          />

          {!showMenu && !win && !go && (
            <>
              {/* Pause Button */}
              <TouchableOpacity onPress={togglePause} style={styles.pauseButton} activeOpacity={0.7}>
                <View style={styles.pauseButtonInner}>
                  <Text style={styles.pauseIcon}>{paused ? '▶' : '⏸'}</Text>
                </View>
              </TouchableOpacity>

              {/* Level name in-game HUD */}
              <View style={styles.hudLevelName} pointerEvents="none">
                <Text style={styles.hudLevelText}>{FLAG_LEVELS[currentLevel]?.name?.toUpperCase()}</Text>
              </View>

              {/* TAP TO SERVE — pulsing overlay */}
              {waitingToStart && !paused && (
                <TouchableOpacity activeOpacity={1} onPress={launchBall} style={styles.serveOverlay}>
                  <View style={styles.serveCard}>
                    <Animated.Text style={[styles.serveText, { transform: [{ scale: pulseAnim }] }]}>
                      TAP TO SERVE
                    </Animated.Text>
                    <Text style={styles.serveSubText}>Move paddle to aim</Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* Pause Overlay */}
              {paused && (
                <View style={styles.overlay}>
                  <View style={styles.pauseCard}>
                    <Text style={styles.pauseTitle}>PAUSED</Text>
                    <Text style={styles.pauseLevel}>{FLAG_LEVELS[currentLevel]?.name}</Text>
                    <View style={styles.pauseButtons}>
                      <TouchableOpacity onPress={togglePause} style={[styles.overlayBtn, styles.btnResume]}>
                        <Text style={styles.overlayBtnText}>▶  RESUME</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={reset} style={[styles.overlayBtn, styles.btnRestart]}>
                        <Text style={styles.overlayBtnText}>↺  RESTART</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={backToMenu} style={[styles.overlayBtn, styles.btnExit]}>
                        <Text style={styles.overlayBtnText}>✕  EXIT</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </>
          )}
        </View>

        {/* Main Menu */}
        {showMenu && (
          <View style={styles.menuContainer}>
            {/* Header */}
            <View style={styles.menuHeader}>
              <Text style={styles.gameLogoSub}>🌍</Text>
              <Text style={styles.gameLogo}>BrickStrike</Text>
              <Text style={styles.gameTagline}>W O R L D  T O U R</Text>
            </View>

            {/* Level Grid */}
            <ScrollView
              contentContainerStyle={styles.levelGrid}
              showsVerticalScrollIndicator={false}
            >
              {FLAG_LEVELS.map((lvl, index) => {
                const isUnlocked = unlockedLevels.includes(index);
                const best = highScores[lvl.id] || 0;
                return (
                  <TouchableOpacity
                    key={lvl.id}
                    disabled={!isUnlocked}
                    onPress={() => startLevel(index)}
                    style={[styles.levelCard, !isUnlocked && styles.levelCardLocked]}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.flagPreview, { backgroundColor: lvl.backgroundColor }]}>
                      {!isUnlocked && (
                        <View style={styles.lockOverlay}>
                          <Text style={styles.lockIcon}>🔒</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.levelName}>{lvl.name}</Text>
                    {renderDifficultyStars(lvl.id)}
                    {isUnlocked && best > 0 && (
                      <Text style={styles.bestScore}>⭐ {best}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity onPress={resetProgress} style={styles.resetButton}>
              <Text style={styles.resetText}>RESET PROGRESS</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Game Over / Win Overlay */}
        {(go || win) && (
          <View style={styles.overlay}>
            <View style={styles.resultCard}>
              <Text style={styles.resultEmoji}>{go ? '💀' : '🏆'}</Text>
              <Text style={[styles.resultTitle, win && { color: '#FFD54F' }]}>
                {go ? 'GAME OVER' : 'LEVEL CLEAR!'}
              </Text>
              {win && <Text style={styles.resultLevel}>{FLAG_LEVELS[currentLevel]?.name}</Text>}
              <View style={styles.resultButtons}>
                <TouchableOpacity onPress={backToMenu} style={[styles.overlayBtn, styles.btnRestart]}>
                  <Text style={styles.overlayBtnText}>⌂  MENU</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={reset} style={[styles.overlayBtn, styles.btnResume]}>
                  <Text style={styles.overlayBtnText}>{go ? '↺  RETRY' : '↺  REPLAY'}</Text>
                </TouchableOpacity>
                {win && currentLevel + 1 < FLAG_LEVELS.length && (
                  <TouchableOpacity
                    onPress={() => startLevel(currentLevel + 1)}
                    style={[styles.overlayBtn, styles.btnNext]}
                  >
                    <Text style={[styles.overlayBtnText, { color: '#000' }]}>▶  NEXT</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  gameContainer: { flex: 1 },
  gameWrapper: {
    flex: 1,
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 1,
  },

  // ── In-Game HUD ────────────────────────────
  hudLevelName: {
    position: 'absolute',
    top: 24,
    left: 0, right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  hudLevelText: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
  },
  pauseButton: {
    position: 'absolute',
    top: 16, right: 16,
    zIndex: 20,
  },
  pauseButtonInner: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  pauseIcon: {
    color: '#FFF',
    fontSize: 16,
  },

  // ── Serve Overlay ──────────────────────────
  serveOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    zIndex: 15,
  },
  serveCard: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 24,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  serveText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 4,
  },
  serveSubText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 6,
    letterSpacing: 1,
  },

  // ── Pause Card ────────────────────────────
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 30,
  },
  pauseCard: {
    width: '80%',
    backgroundColor: '#16161E',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  pauseTitle: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 6,
    marginBottom: 4,
  },
  pauseLevel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    letterSpacing: 2,
    marginBottom: 28,
  },
  pauseButtons: {
    width: '100%',
    gap: 12,
  },

  // ── Overlay Buttons ───────────────────────
  overlayBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  overlayBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
  },
  btnResume: { backgroundColor: '#00C897' },
  btnRestart: { backgroundColor: '#3E4560' },
  btnExit: { backgroundColor: '#C62828' },
  btnNext: { backgroundColor: '#FFD54F' },

  // ── Result Card ───────────────────────────
  resultCard: {
    width: '82%',
    backgroundColor: '#14141C',
    borderRadius: 28,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  resultEmoji: { fontSize: 52, marginBottom: 12 },
  resultTitle: {
    color: '#FFF',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 4,
  },
  resultLevel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    letterSpacing: 2,
    marginBottom: 28,
  },
  resultButtons: {
    width: '100%',
    gap: 10,
  },

  // ── Main Menu ─────────────────────────────
  menuContainer: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    paddingBottom: 20,
  },
  menuHeader: {
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  gameLogoSub: {
    fontSize: 36,
    marginBottom: 8,
  },
  gameLogo: {
    color: '#FFD54F',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 1,
  },
  gameTagline: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    letterSpacing: 6,
    marginTop: 4,
  },

  // ── Level Grid ─────────────────────────────
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingTop: 20,
    paddingBottom: 10,
  },
  levelCard: {
    width: 96,
    margin: 8,
    alignItems: 'center',
    backgroundColor: '#16161E',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  levelCardLocked: {
    opacity: 0.35,
  },
  flagPreview: {
    width: 72, height: 44,
    borderRadius: 8,
    marginBottom: 7,
    overflow: 'hidden',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  lockIcon: { fontSize: 18 },
  levelName: {
    color: '#DDD',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  star: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.2)',
    marginHorizontal: 0.5,
  },
  starActive: {
    color: '#FFD54F',
  },
  bestScore: {
    color: '#FFD54F',
    fontSize: 10,
    fontWeight: '700',
  },

  // ── Reset Button ─────────────────────────
  resetButton: {
    marginTop: 16,
    marginHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,80,80,0.25)',
    alignItems: 'center',
  },
  resetText: {
    color: 'rgba(255,80,80,0.7)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
});
