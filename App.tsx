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
import { playSound, setSoundEnabled } from './src/utils/audio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { triggerHaptic } from './src/utils/haptics';
import WeaponSystem from './src/systems/WeaponSystem';
import WeaponBar from './src/components/WeaponBar';
import FlagMiniPreview from './src/components/FlagMiniPreview';



// Difficulty stars for each level (1-5)
const LEVEL_DIFFICULTY: Record<string, number> = {
  BD: 1, JP: 1, TR: 2, PS: 2, SA: 2, US: 2,
  NP: 3, FORTRESS: 3, UK: 3, BR: 4, KR: 3,
  HOURGLASS: 5, DIAMOND_CORE: 5, SA_MAZE: 5,
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
  const [weaponMode, setWeaponMode] = useState<'NORMAL' | 'AIM' | 'MINE'>('NORMAL');
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [weaponCounts, setWeaponCounts] = useState({ missiles: 3, mines: 2 });
  const gameEngineRef = useRef<any>(null);


  // Visual Polish Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const introAnim = useRef(new Animated.Value(0)).current;

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
      
      let parsedLevels: number[] = [];
      if (savedLevels) {
        parsedLevels = JSON.parse(savedLevels);
      }

      // Force unlock all newly added levels globally
      let newlyUnlocked = false;
      FLAG_LEVELS.forEach((_, index) => {
        if (!parsedLevels.includes(index)) {
          parsedLevels.push(index);
          newlyUnlocked = true;
        }
      });
      
      if (newlyUnlocked || !savedLevels) {
        saveProgress(parsedLevels, JSON.parse(savedScores || '{}'));
      }
      
      setUnlockedLevels(parsedLevels);
      if (savedScores) setHighScores(JSON.parse(savedScores));
      // Load sound preference
      const savedSound = await AsyncStorage.getItem('@sound_enabled');
      if (savedSound !== null) {
        const enabled = JSON.parse(savedSound);
        setSoundEnabledState(enabled);
        setSoundEnabled(enabled);
      }
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
        setRunning(false); setGo(true); break;
      case 'win':
        handleWin(e.score); break;
      case 'lose-life':
        setWaitingToStart(true); break;
      case 'shake':
        triggerShake(e.intensity); break;
      case 'weapon-mode-change':
        setWeaponMode(e.mode); break;
      case 'weapon-counts':
        setWeaponCounts({ missiles: e.missiles, mines: e.mines }); break;
    }
  };


  const triggerShake = (intensity: number) => {
    const val = intensity * 0.8;
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: { x: (Math.random()-0.5)*val, y: (Math.random()-0.5)*val }, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: { x: (Math.random()-0.5)*val, y: (Math.random()-0.5)*val }, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: { x: 0, y: 0 }, duration: 40, useNativeDriver: true }),
    ]).start();
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
    setWeaponCounts({ missiles: 3, mines: 2 }); setWeaponMode('NORMAL');

    if (gameEngineRef.current) {
      const ents = getEntities(index);
      ents.scoreBoard.waitingToStart = true;
      gameEngineRef.current.swap(ents);
      
      // Trigger Level Intro
      introAnim.setValue(0);
      Animated.sequence([
        Animated.timing(introAnim, { toValue: 1, duration: 600, useNativeDriver: true, easing: Easing.out(Easing.back(1.5)) }),
        Animated.delay(1200),
        Animated.timing(introAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
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
    setWeaponCounts({ missiles: 3, mines: 2 }); setWeaponMode('NORMAL');
    if (gameEngineRef.current) {

      const ents = getEntities(currentLevel);
      ents.scoreBoard.waitingToStart = true;
      gameEngineRef.current.swap(ents);
    }
  };

  const backToMenu = () => {
    setShowMenu(true); setRunning(false); setWin(false); setGo(false); setPaused(false);
  };

  const toggleSound = () => {
    const newVal = !soundEnabled;
    setSoundEnabledState(newVal);
    setSoundEnabled(newVal);
    AsyncStorage.setItem('@sound_enabled', JSON.stringify(newVal));
    if (newVal) playSound('blip_select');
    triggerHaptic('impactLight');
  };

  const toggleWeaponMode = (mode: 'AIM' | 'MINE') => {
    const newMode = weaponMode === mode ? 'NORMAL' : mode;
    if (newMode === 'AIM' && weaponCounts.missiles === 0) return;
    if (newMode === 'MINE' && weaponCounts.mines === 0) return;
    setWeaponMode(newMode);
    if (gameEngineRef.current) {
      gameEngineRef.current.dispatch({ type: 'set-weapon-mode', mode: newMode });
    }
    triggerHaptic('impactLight');
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

        {/* Background Pattern Layer */}
        {!showMenu && (
          <View style={styles.backgroundPattern} pointerEvents="none">
            {Array.from({ length: 120 }).map((_, i) => (
              <View key={i} style={styles.bgDot} />
            ))}
          </View>
        )}

        {/* Game Layer */}
        <Animated.View
          style={[
            styles.gameWrapper, 
            showMenu && { opacity: 0 },
            { transform: shakeAnim.getTranslateTransform() }
          ]}
          pointerEvents={showMenu ? 'none' : 'auto'}
        >
          <GameEngine
            ref={gameEngineRef}
            style={styles.gameContainer}
            systems={[MovePaddle, WeaponSystem, Physics]}
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

              {/* Level Intro Overlay */}
              <Animated.View 
                pointerEvents="none"
                style={[styles.introOverlay, { 
                  opacity: introAnim,
                  transform: [
                    { scale: introAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) },
                    { translateY: introAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }
                  ]
                }]}
              >
                <Text style={styles.introSub}>DESTINATION</Text>
                <Text style={styles.introTitle}>{FLAG_LEVELS[currentLevel]?.name?.toUpperCase()}</Text>
              </Animated.View>

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

              {/* Weapon Instructions Overlay */}
              {!waitingToStart && !paused && weaponMode !== 'NORMAL' && (
                <View style={styles.weaponInstructionOverlay} pointerEvents="none">
                  <Animated.Text style={[styles.weaponInstructionText, { transform: [{ scale: pulseAnim }] }]}>
                    {weaponMode === 'AIM' ? '🚀 TAP ANYWHERE TO SHOOT' : '💣 TAP BRICK TO PLACE STICKY BOMB'}
                  </Animated.Text>
                </View>
              )}

              {/* Weapon Bar — Stable React TouchableOpacity buttons (replaces fragile WeaponSystem UI hacks) */}
              {!paused && (
                <WeaponBar
                  missiles={weaponCounts.missiles}
                  mines={weaponCounts.mines}
                  weaponMode={weaponMode}
                  onMissilePress={() => toggleWeaponMode('AIM')}
                  onMinePress={() => toggleWeaponMode('MINE')}
                />
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
                      <TouchableOpacity id="sound-toggle-pause" onPress={toggleSound} style={[styles.overlayBtn, styles.btnSound]}>
                        <Text style={styles.overlayBtnText}>{soundEnabled ? '🔊  SOUND ON' : '🔇  SOUND OFF'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

            </>
          )}
        </Animated.View>

        {/* Main Menu */}
        {showMenu && (
          <View style={styles.menuContainer}>
            {/* Header */}
            <View style={styles.menuHeader}>
              <View style={styles.logoCircle}>
                <Text style={styles.gameLogoSub}>🚀</Text>
              </View>
              <Text style={styles.gameLogo}>BRICKSTRIKE</Text>
              <Text style={styles.gameTagline}>W O R L D  T O U R</Text>
              <TouchableOpacity id="sound-toggle-menu" onPress={toggleSound} style={styles.soundToggleBtn}>
                <Text style={styles.soundToggleText}>
                  {soundEnabled ? '🔊  SOUND ON' : '🔇  SOUND OFF'}
                </Text>
              </TouchableOpacity>
            </View>


            {/* Level Grid */}
            <ScrollView
              contentContainerStyle={styles.levelGrid}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.gridTitle}>CHOOSE YOUR DESTINATION</Text>
              <View style={styles.gridContent}>
                {FLAG_LEVELS.map((lvl, index) => {
                  const isUnlocked = unlockedLevels.includes(index);
                  const best = highScores[lvl.id] || 0;
                  return (
                    <TouchableOpacity
                      key={lvl.id}
                      disabled={!isUnlocked}
                      onPress={() => startLevel(index)}
                      style={[styles.levelCard, !isUnlocked && styles.levelCardLocked]}
                      activeOpacity={0.7}
                    >
                      <View style={styles.flagPreview}>
                        <FlagMiniPreview
                          flagColors={lvl.flagColors}
                          flagOrientation={lvl.flagOrientation}
                          fallbackColor={lvl.backgroundColor}
                        />
                        {!isUnlocked && (
                          <View style={styles.lockOverlay}>
                            <Text style={styles.lockIcon}>🔒</Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.levelInfo}>
                        <Text style={styles.levelName}>{lvl.name}</Text>
                        {renderDifficultyStars(lvl.id)}
                        {isUnlocked && best > 0 && (
                          <Text style={styles.bestScore}>⭐ {best.toLocaleString()}</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
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
  backgroundPattern: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingTop: 100,
    opacity: 0.1,
  },
  bgDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    margin: 20,
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
    bottom: 40,
    left: 0, right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  hudLevelText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  pauseButton: {
    position: 'absolute',
    top: 20, right: 20,
    zIndex: 20,
  },
  pauseButtonInner: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: '#FFEB3B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000',
  },
  pauseIcon: {
    color: '#000',
    fontSize: 18,
    fontWeight: '900',
  },

  // ── Serve Overlay ──────────────────────────
  serveOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 15,
  },
  serveCard: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 24,
    borderRadius: 30,
    backgroundColor: '#FFEB3B',
    borderWidth: 4,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 10,
  },
  serveText: {
    color: '#000',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  serveSubText: {
    color: 'rgba(0,0,0,0.6)',
    fontSize: 13,
    marginTop: 6,
    fontWeight: '700',
  },

  // ── Pause Card ────────────────────────────
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 30,
  },
  pauseCard: {
    width: '85%',
    backgroundColor: '#FFEB3B',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  pauseTitle: {
    color: '#000',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 4,
  },
  pauseLevel: {
    color: 'rgba(0,0,0,0.5)',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 24,
  },
  pauseButtons: {
    width: '100%',
    gap: 15,
  },

  // ── Overlay Buttons ───────────────────────
  overlayBtn: {
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000',
  },
  overlayBtnText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  btnResume: { backgroundColor: '#4CAF50' },
  btnRestart: { backgroundColor: '#2196F3' },
  btnExit: { backgroundColor: '#F44336' },
  btnNext: { backgroundColor: '#FFC107' },

  // ── Result Card ───────────────────────────
  resultCard: {
    width: '85%',
    backgroundColor: '#FFEB3B',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  resultEmoji: { fontSize: 60, marginBottom: 10 },
  resultTitle: {
    color: '#000',
    fontSize: 34,
    fontWeight: '900',
    marginBottom: 4,
  },
  resultLevel: {
    color: 'rgba(0,0,0,0.5)',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 20,
  },
  resultButtons: {
    width: '100%',
    gap: 12,
  },

  // ── Main Menu ─────────────────────────────
  menuContainer: {
    flex: 1,
    backgroundColor: '#0F1014', // Extreme Dark
    paddingBottom: 20,
  },
  menuHeader: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: '#16171D',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  logoCircle: {
      width: 70, height: 70,
      borderRadius: 35,
      backgroundColor: '#4ECDC4',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 15,
      borderWidth: 3,
      borderColor: '#FFF',
  },
  gameLogoSub: {
    fontSize: 32,
  },
  gameLogo: {
    color: '#FFF',
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -1,
  },
  gameTagline: {
    color: '#4ECDC4',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 3,
    marginTop: 4,
  },

  // ── Level Grid ─────────────────────────────
  levelGrid: {
    paddingBottom: 40,
  },
  gridTitle: {
      color: '#666',
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 2,
      textAlign: 'center',
      marginTop: 25,
      marginBottom: 15,
  },
  gridContent: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      paddingHorizontal: 10,
  },
  levelCard: {
    width: '44%',
    margin: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1D24',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  levelCardLocked: {
    opacity: 0.5,
    backgroundColor: '#16171D',
  },
  levelInfo: {
      flex: 1,
      marginLeft: 10,
  },
  flagPreview: {
    width: 50, height: 35,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  lockIcon: { fontSize: 14 },
  levelName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 2,
  },
  starsRow: {
    flexDirection: 'row',
  },
  star: { fontSize: 8, color: '#444' },
  starActive: { color: '#FFD54F' },
  bestScore: {
    color: '#4ECDC4',
    fontSize: 10,
    fontWeight: '900',
    marginTop: 4,
  },

  // ── Reset Button ─────────────────────────
  resetButton: {
    marginTop: 40,
    marginHorizontal: 80,
    paddingVertical: 12,
    backgroundColor: 'transparent',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  resetText: {
    color: '#666',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  introOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  introSub: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 5,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  introTitle: {
    color: '#FFF',
    fontSize: 56,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 10,
  },
  weaponInstructionOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 200,
  },
  weaponInstructionText: {
    color: '#FFEB3B',
    fontSize: 22,
    fontWeight: '900',
    textShadowColor: '#000',
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 8,
    textAlign: 'center',
  },
  // Sound toggle styles
  soundToggleBtn: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 9,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  soundToggleText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  btnSound: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.3)',
  },
});
