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
import mobileAds, { 
  BannerAd, 
  BannerAdSize, 
  TestIds, 
  RewardedInterstitialAd, 
  AdEventType 
} from 'react-native-google-mobile-ads';
import { playSound, setSoundEnabled } from './src/utils/audio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { triggerHaptic } from './src/utils/haptics';
import WeaponSystem from './src/systems/WeaponSystem';
import WeaponBar from './src/components/WeaponBar';
import FlagMiniPreview from './src/components/FlagMiniPreview';
import ShopOverlay from './src/components/ShopOverlay';

const AD_UNIT_ID = 'ca-app-pub-3315420037530922/8840261664';
const BANNER_AD_ID = 'ca-app-pub-3315420037530922/9091543100';

const rewardedInterstitial = RewardedInterstitialAd.createForAdUnitID(AD_UNIT_ID);



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
  
  // Economy State (Lifetime)
  const [starBalance, setStarBalance] = useState(0);
  const [missileStock, setMissileStock] = useState(3);
  const [mineStock, setMineStock] = useState(3);
  const [unlockedThemes, setUnlockedThemes] = useState<string[]>(['theme_classic']);
  const [currentTheme, setCurrentTheme] = useState('theme_classic');
  const [weaponCounts, setWeaponCounts] = useState({ missiles: 3, mines: 3 });
  const [lastStarsEarned, setLastStarsEarned] = useState(0);
  
  const [showShop, setShowShop] = useState(false);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  
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

  useEffect(() => {
    mobileAds().initialize().then(() => {
      console.log('AdMob Initialized');
    });
    loadProgress();
  }, []);

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
      
      // Load economy
      const savedEconomy = await AsyncStorage.getItem('@game_economy');
      if (savedEconomy) {
        const eco = JSON.parse(savedEconomy);
        setStarBalance(eco.stars || 0);
        setMissileStock(eco.missiles !== undefined ? eco.missiles : 3);
        setMineStock(eco.mines !== undefined ? eco.mines : 3);
        setUnlockedThemes(eco.themes || ['theme_classic']);
        setCurrentTheme(eco.currentTheme || 'theme_classic');
        setWeaponCounts({ 
          missiles: eco.missiles !== undefined ? eco.missiles : 3, 
          mines: eco.mines !== undefined ? eco.mines : 3 
        });
      }

      // Load sound preference
      const savedSound = await AsyncStorage.getItem('@sound_enabled');
      if (savedSound !== null) {
        const enabled = JSON.parse(savedSound);
        setSoundEnabledState(enabled);
        setSoundEnabled(enabled);
      }
    } catch (e) { console.log('Error loading progress', e); }

  };

  const saveProgress = async (levels: number[], scores: any, economy?: any) => {
    try {
      await AsyncStorage.setItem('@unlocked_levels', JSON.stringify(levels));
      await AsyncStorage.setItem('@high_scores', JSON.stringify(scores));
      if (economy) {
        await AsyncStorage.setItem('@game_economy', JSON.stringify(economy));
      }
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
        setWeaponCounts({ missiles: e.missiles, mines: e.mines });
        setMissileStock(e.missiles);
        setMineStock(e.mines);
        saveProgress(unlockedLevels, highScores, { 
          stars: starBalance, 
          missiles: e.missiles, 
          mines: e.mines 
        });
        break;
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

  const handleWin = (finalScore: number, timeTaken?: number) => {
    setRunning(false); setWin(true); setWaitingToStart(true);
    playSound('win'); triggerHaptic('notificationSuccess');

    // ── Star Calculation ──
    const level = FLAG_LEVELS[currentLevel];
    const thresholds = level.starThresholds || [45, 90];
    let stars = 1;
    if (timeTaken) {
      if (timeTaken < thresholds[0]) stars = 3;
      else if (timeTaken < thresholds[1]) stars = 2;
    }
    setLastStarsEarned(stars);
    const newStarBalance = starBalance + stars;
    setStarBalance(newStarBalance);

    const currentScore = finalScore || 0;
    const levelId = level.id;
    const newScores = { ...highScores };
    
    // Store score and stars in highScores
    // We'll store it as a encoded string "score|stars" to keep it compatible with existing parse
    const prevEntry = newScores[levelId] || 0;
    const prevScore = typeof prevEntry === 'string' ? parseInt(prevEntry.split('|')[0]) : prevEntry;
    const prevStars = typeof prevEntry === 'string' ? parseInt(prevEntry.split('|')[1]) : 0;
    
    if (currentScore > prevScore || stars > prevStars) {
      newScores[levelId] = `${Math.max(currentScore, prevScore)}|${Math.max(stars, prevStars)}` as any;
    }
    
    setHighScores(newScores);

    let newUnlocked = [...unlockedLevels];
    if (currentLevel + 1 < FLAG_LEVELS.length && !unlockedLevels.includes(currentLevel + 1)) {
      newUnlocked = [...unlockedLevels, currentLevel + 1];
      setUnlockedLevels(newUnlocked);
    }
    
    saveProgress(newUnlocked, newScores, { 
      stars: newStarBalance, 
      missiles: missileStock, 
      mines: mineStock,
      themes: unlockedThemes,
      currentTheme,
    });
  };

  const startLevel = (index: number) => {
    setCurrentLevel(index); setShowMenu(false); setRunning(true);
    setPaused(false); setWaitingToStart(true); setWin(false); setGo(false);
    setWeaponCounts({ missiles: missileStock, mines: mineStock }); setWeaponMode('NORMAL');

    if (gameEngineRef.current) {
      const ents = getEntities(index);
      ents.scoreBoard.waitingToStart = true;
      // Inject global weapons stock
      ents.scoreBoard.missiles = missileStock;
      ents.scoreBoard.mines = mineStock;
      if (ents.paddle) ents.paddle.themeId = currentTheme;
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
    setWeaponCounts({ missiles: missileStock, mines: mineStock }); setWeaponMode('NORMAL');
    if (gameEngineRef.current) {
      const ents = getEntities(currentLevel);
      ents.scoreBoard.waitingToStart = true;
      ents.scoreBoard.missiles = missileStock;
      ents.scoreBoard.mines = mineStock;
      if (ents.paddle) ents.paddle.themeId = currentTheme;
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
    triggerHaptic('impactLight');
  };

  const handleBuy = (item: any) => {
    if (item.type === 'AD') {
      setIsWatchingAd(true);
      
      const unsubscribeLoaded = rewardedInterstitial.addAdEventListener(AdEventType.LOADED, () => {
        rewardedInterstitial.show();
      });

      const unsubscribeEarned = rewardedInterstitial.addAdEventListener(
        AdEventType.EARNED_REWARD,
        reward => {
          const newBalance = starBalance + 5;
          setStarBalance(newBalance);
          setIsWatchingAd(false);
          saveProgress(unlockedLevels, highScores, { stars: newBalance, missiles: missileStock, mines: mineStock, themes: unlockedThemes, currentTheme });
          triggerHaptic('notificationSuccess');
          rewardedInterstitial.load();
        },
      );

      const unsubscribeClosed = rewardedInterstitial.addAdEventListener(AdEventType.CLOSED, () => {
        setIsWatchingAd(false);
        rewardedInterstitial.load();
      });

      rewardedInterstitial.load();
      return;
    }

    if (starBalance < item.cost) return;

    const newBalance = starBalance - item.cost;
    let newMissiles = missileStock;
    let newMines = mineStock;
    let newThemes = [...unlockedThemes];

    if (item.id === 'missile_3') newMissiles += 3;
    if (item.id === 'mine_2') newMines += 2;
    if (item.type === 'THEME') {
      newThemes.push(item.id);
      setUnlockedThemes(newThemes);
    }

    setStarBalance(newBalance);
    setMissileStock(newMissiles);
    setMineStock(newMines);
    setWeaponCounts({ missiles: newMissiles, mines: newMines });

    saveProgress(unlockedLevels, highScores, { 
      stars: newBalance, 
      missiles: newMissiles, 
      mines: newMines,
      themes: newThemes,
      currentTheme
    });
    triggerHaptic('notificationSuccess');
    playSound('blip_select');
  };


  const renderDifficultyStars = (levelId: string) => {
    const entry = highScores[levelId];
    let stars = 0;
    if (entry) {
      if (typeof entry === 'string' && entry.includes('|')) {
        stars = parseInt(entry.split('|')[1]);
      } else {
        // Fallback for old scores
        stars = 1; 
      }
    }
    
    // If NOT won yet, show difficulty from static record
    if (stars === 0) {
      const diff = LEVEL_DIFFICULTY[levelId] || 1;
      return (
        <View style={styles.starsRow}>
          {[1,2,3,4,5].map(i => (
            <Text key={i} style={[styles.star, i <= diff && { color: 'rgba(255,255,255,0.2)' }]}>★</Text>
          ))}
        </View>
      );
    }

    return (
      <View style={styles.starsRow}>
        {[1,2,3].map(i => (
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

              {/* Fixed Banner Ad during Gameplay */}
              <View style={styles.gameBannerContainer}>
                <BannerAd
                  unitId={BANNER_AD_ID}
                  size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                  requestOptions={{ requestNonPersonalizedAdsOnly: true }}
                />
              </View>

              {/* Level name in-game HUD — Moved up to stay clear of the ad */}
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
                  onShopPress={() => setShowShop(true)}
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
                      <TouchableOpacity onPress={() => { setShowShop(true); setPaused(false); }} style={[styles.overlayBtn, styles.btnNext]}>
                        <Text style={[styles.overlayBtnText, { color: '#000' }]}>🛒  GO TO SHOP</Text>
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
              <TouchableOpacity onPress={() => setShowShop(true)} style={[styles.soundToggleBtn, { top: 70, backgroundColor: '#FFEE58' }]}>
                <Text style={[styles.soundToggleText, { color: '#000' }]}>🛒  GET MORE WEAPONS</Text>
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
                        {isUnlocked && best > 0 && (() => {
                          const s = typeof best === 'string' ? best.split('|')[0] : best;
                          return <Text style={styles.bestScore}>⭐ {parseInt(s).toLocaleString()}</Text>;
                        })()}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={{ alignItems: 'center', marginVertical: 10 }}>
              <BannerAd
                unitId={BANNER_AD_ID}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                requestOptions={{ requestNonPersonalizedAdsOnly: true }}
              />
            </View>

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
              
              {win && (
                <View style={styles.winDetails}>
                  <View style={styles.resultStarsRow}>
                    {[1, 2, 3].map(i => (
                      <Text key={i} style={[styles.resultStar, i <= lastStarsEarned && styles.resultStarActive]}>
                        ★
                      </Text>
                    ))}
                  </View>
                  <Text style={styles.resultStarSub}>+{lastStarsEarned} STARS EARNED</Text>
                  <View style={styles.resultEconomy}>
                    <Text style={styles.resultEcoText}>TOTAL ⭐ {starBalance}</Text>
                  </View>
                </View>
              )}

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

        {/* Shop Overlay */}
        {showShop && (
          <ShopOverlay
            starBalance={starBalance}
            unlockedThemes={unlockedThemes}
            onClose={() => setShowShop(false)}
            onBuy={handleBuy}
          />
        )}

        {/* Ad Loading Overlay */}
        {isWatchingAd && (
          <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.95)' }]}>
            <View style={styles.resultCard}>
              <Text style={styles.resultEmoji}>📺</Text>
              <Text style={styles.resultTitle}>LOADING AD...</Text>
              <Text style={styles.resultLevel}>Wait for Reward</Text>
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
    bottom: 95, // Raised up to avoid overlapping Banner Ad
    left: 0, right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  gameBannerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0, right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 4,
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
    marginTop: 5,
  },
  winDetails: {
    alignItems: 'center',
    marginBottom: 15,
  },
  resultStarsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 5,
  },
  resultStar: {
    fontSize: 42,
    color: 'rgba(0,0,0,0.1)',
  },
  resultStarActive: {
    color: '#000',
  },
  resultStarSub: {
    color: '#000',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  resultEconomy: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  resultEcoText: {
    color: 'rgba(0,0,0,0.6)',
    fontSize: 12,
    fontWeight: '800',
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
