import React, { useState, useRef } from 'react';
import { StatusBar, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import { getEntities } from './src/entities';
import MovePaddle from './src/systems/MovePaddle';
import Physics from './src/systems/Physics';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { FLAG_LEVELS } from './src/levels';

import { playSound } from './src/utils/audio';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { triggerHaptic } from './src/utils/haptics';

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

  // Load Progress on Mount
  React.useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const savedLevels = await AsyncStorage.getItem('@unlocked_levels');
      const savedScores = await AsyncStorage.getItem('@high_scores');
      if (savedLevels) setUnlockedLevels(JSON.parse(savedLevels));
      if (savedScores) setHighScores(JSON.parse(savedScores));
    } catch (e) {
      console.log('Error loading progress', e);
    }
  };

  const saveProgress = async (levels: number[], scores: any) => {
    try {
      await AsyncStorage.setItem('@unlocked_levels', JSON.stringify(levels));
      await AsyncStorage.setItem('@high_scores', JSON.stringify(scores));
    } catch (e) {
      console.log('Error saving progress', e);
    }
  };

  const resetProgress = async () => {
    try {
      await AsyncStorage.clear();
      setUnlockedLevels([0]);
      setHighScores({});
      triggerHaptic('notificationSuccess');
    } catch (e) {
      console.log('Error resetting progress', e);
    }
  };

  const onEvent = (e: any) => {
    switch (e.type) {
      case 'game-over':
        setRunning(false);
        setGo(true);
        playSound('lose');
        break;
      case 'win':
        handleWin(e.score);
        break;
      case 'paddle-hit':
        playSound('hit');
        break;
      case 'brick-hit':
        playSound('hit');
        break;
      case 'brick-break':
        playSound('break');
        break;
      case 'wall-hit':
        playSound('wall');
        break;
      case 'powerup-collect':
        playSound('powerup');
        break;
      case 'lose-life':
        playSound('lose');
        setWaitingToStart(true);
        break;
    }
  };

  const handleWin = (finalScore: number) => {
    setRunning(false);
    setWin(true);
    setWaitingToStart(true);
    playSound('win');
    triggerHaptic('notificationSuccess');

    // Update High Scores
    const currentScore = finalScore || 0;
    const levelId = FLAG_LEVELS[currentLevel].id;
    const newScores = { ...highScores };
    if (!newScores[levelId] || currentScore > newScores[levelId]) {
      newScores[levelId] = currentScore;
    }
    setHighScores(newScores);

    // Unlock Next Level
    let newUnlocked = [...unlockedLevels];
    if (currentLevel + 1 < FLAG_LEVELS.length && !unlockedLevels.includes(currentLevel + 1)) {
      newUnlocked = [...unlockedLevels, currentLevel + 1];
      setUnlockedLevels(newUnlocked);
    }

    saveProgress(newUnlocked, newScores);
  };

  const startLevel = (index: number) => {
    setCurrentLevel(index);
    setShowMenu(false);
    setRunning(true);
    setPaused(false);
    setWaitingToStart(true);
    setWin(false);
    setGo(false);
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

  const togglePause = () => {
    setPaused(!paused);
    triggerHaptic('impactLight');
  };

  const reset = () => {
    setGo(false);
    setWin(false);
    setRunning(true);
    if (gameEngineRef.current) {
      gameEngineRef.current.swap(getEntities(currentLevel));
    }
  };

  const backToMenu = () => {
    setShowMenu(true);
    setRunning(false);
    setWin(false);
    setGo(false);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar hidden />
        
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
              <TouchableOpacity onPress={togglePause} style={styles.pauseButton}>
                <Text style={styles.pauseIcon}>{paused ? '▶' : '||'}</Text>
              </TouchableOpacity>

              {/* Tap to Start / Serve Overlay */}
              {waitingToStart && !paused && (
                <TouchableOpacity activeOpacity={1} onPress={launchBall} style={styles.serveOverlay}>
                  <Text style={styles.serveText}>TAP TO SERVE</Text>
                </TouchableOpacity>
              )}

              {/* Pause Menu Overlay */}
              {paused && (
                <View style={styles.overlay}>
                  <Text style={styles.title}>PAUSED</Text>
                  <View style={styles.buttonRow}>
                    <TouchableOpacity onPress={togglePause} style={styles.button}>
                      <Text style={styles.buttonText}>RESUME</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={reset} style={[styles.button, { backgroundColor: '#78909C' }]}>
                      <Text style={styles.buttonText}>RESTART</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={backToMenu} style={[styles.button, { backgroundColor: '#FF5252' }]}>
                      <Text style={styles.buttonText}>EXIT</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          )}
        </View>

        {showMenu && (
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>BRICK MANIA</Text>
              <Text style={styles.menuSubtitle}>WORLD TOUR</Text>
            </View>

            <View style={styles.levelGrid}>
              {FLAG_LEVELS.map((lvl, index) => {
                const isUnlocked = unlockedLevels.includes(index);
                const best = highScores[lvl.id] || 0;
                return (
                  <TouchableOpacity
                    key={lvl.id}
                    disabled={!isUnlocked}
                    onPress={() => startLevel(index)}
                    style={[styles.levelCard, !isUnlocked && styles.levelCardLocked]}
                  >
                    <View style={[styles.flagPreview, { backgroundColor: lvl.backgroundColor }]}>
                      {!isUnlocked && <Text style={styles.lockIcon}>🔒</Text>}
                    </View>
                    <Text style={styles.levelName}>{lvl.name}</Text>
                    {isUnlocked && <Text style={styles.bestScore}>BEST: {best}</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity onPress={resetProgress} style={styles.resetButton}>
              <Text style={styles.resetText}>RESET PROGRESS</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {(go || win) && (
          <View style={styles.overlay}>
            <Text style={styles.title}>{go ? 'GAME OVER' : 'LEVEL CLEAR!'}</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={backToMenu} style={[styles.button, { backgroundColor: '#78909C' }]}>
                <Text style={styles.buttonText}>MENU</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={reset} style={styles.button}>
                <Text style={styles.buttonText}>{go ? 'RETRY' : 'REPLAY'}</Text>
              </TouchableOpacity>
              {win && currentLevel + 1 < FLAG_LEVELS.length && (
                <TouchableOpacity onPress={() => startLevel(currentLevel + 1)} style={[styles.button, { backgroundColor: '#FFD54F' }]}>
                  <Text style={[styles.buttonText, { color: '#000' }]}>NEXT</Text>
                </TouchableOpacity>
              )}
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
    backgroundColor: '#121212',
  },
  gameContainer: {
    flex: 1,
  },
  gameWrapper: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  menuContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
  },
  menuHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  menuTitle: {
    color: '#FFD54F',
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 2,
  },
  menuSubtitle: {
    color: '#FFFFFF',
    fontSize: 18,
    opacity: 0.7,
    letterSpacing: 8,
  },
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  levelCard: {
    width: 100,
    margin: 10,
    alignItems: 'center',
    height: 110,
  },
  levelCardLocked: {
    opacity: 0.4,
  },
  flagPreview: {
    width: 80,
    height: 50,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  lockIcon: {
    fontSize: 20,
  },
  levelName: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bestScore: {
    color: '#FFD54F',
    fontSize: 10,
    marginTop: 2,
    opacity: 0.8,
  },
  resetButton: {
    marginTop: 40,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,50,50,0.3)',
    borderRadius: 8,
  },
  resetText: {
    color: '#FF5252',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  pauseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 20,
    padding: 10,
  },
  pauseIcon: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    opacity: 0.8,
  },
  serveOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    zIndex: 15,
  },
  serveText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 30,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
  },
  button: {
    backgroundColor: '#4DB6AC',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
