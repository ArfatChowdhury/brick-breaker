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
  AdEventType,
  RewardedAdEventType 
} from 'react-native-google-mobile-ads';
import { playSound, setSoundEnabled } from './src/utils/audio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { triggerHaptic } from './src/utils/haptics';
import WeaponSystem from './src/systems/WeaponSystem';
import WeaponBar from './src/components/WeaponBar';
import FlagMiniPreview from './src/components/FlagMiniPreview';
import ShopOverlay from './src/components/ShopOverlay';

const REWARDED_AD_ID = 'ca-app-pub-3315420037530922/8840261664';
const BANNER_AD_ID = 'ca-app-pub-3315420037530922/9091543100';

// One instance for Shop (earn stars), one for in-game revive
const shopRewardedAd = RewardedInterstitialAd.createForAdRequest(REWARDED_AD_ID, {
  requestNonPersonalizedAdsOnly: true,
});
const reviveRewardedAd = RewardedInterstitialAd.createForAdRequest(REWARDED_AD_ID, {
  requestNonPersonalizedAdsOnly: true,
});



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
  const [finalTime, setFinalTime] = useState(0);
  
  const [showShop, setShowShop] = useState(false);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adPurpose, setAdPurpose] = useState<'shop' | 'revive'>('shop');
  const [canRevive, setCanRevive] = useState(false);
  const [adsReady, setAdsReady] = useState(false); // Gate banner until AdMob is initialized
  const [showBranding, setShowBranding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
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
      setAdsReady(true); // Now safe to render BannerAd
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

      // Load branding preference
      const savedBranding = await AsyncStorage.getItem('@show_branding');
      if (savedBranding !== null) {
        setShowBranding(JSON.parse(savedBranding));
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
        setRunning(false); setGo(true); setCanRevive(true); break;
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
    playSound('victory'); triggerHaptic('notificationSuccess');

    // ── Star Calculation ──
    const level = FLAG_LEVELS[currentLevel];
    const thresholds = level.starThresholds || [90, 120];
    let stars = 1;
    if (timeTaken) {
      setFinalTime(timeTaken);
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
    setGo(false); setWin(false); setRunning(true); setWaitingToStart(true); setCanRevive(false);
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

  // ── Revive Player via Rewarded Ad ──
  const handleContinueWithAd = () => {
    setIsWatchingAd(true);
    setAdPurpose('revive');

    // Store unsubscribe fns so we clean up after the ad flow
    let unsubLoaded: (() => void) | undefined;
    let unsubEarned: (() => void) | undefined;
    let unsubClosed: (() => void) | undefined;
    let rewarded = false;

    const cleanup = () => {
      unsubLoaded?.();
      unsubEarned?.();
      unsubClosed?.();
    };

    unsubLoaded = reviveRewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
      reviveRewardedAd.show();
    });
    unsubEarned = reviveRewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      rewarded = true;
      triggerHaptic('notificationSuccess');
      playSound('power_up');
    });
    unsubClosed = reviveRewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
      setIsWatchingAd(false);
      cleanup(); // Remove all listeners — prevents ad from auto-showing again
      if (rewarded) {
        // Restore 1 life without resetting level
        setGo(false);
        setCanRevive(false);
        setRunning(true);
        setWaitingToStart(true);
        if (gameEngineRef.current) {
          const state = gameEngineRef.current.state;
          if (state?.entities?.scoreBoard) {
            state.entities.scoreBoard.lives = 1;
            state.entities.scoreBoard.waitingToStart = true;
          }
        }
      }
    });

    reviveRewardedAd.load();
  };

  const backToMenu = () => {
    playSound('click');
    setCanRevive(false);
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
      setAdPurpose('shop');

      // Store unsub fns — must clean up or listeners accumulate across calls
      let unsubLoaded: (() => void) | undefined;
      let unsubEarned: (() => void) | undefined;
      let unsubClosed: (() => void) | undefined;
      let starsAwarded = false;

      const cleanup = () => {
        unsubLoaded?.();
        unsubEarned?.();
        unsubClosed?.();
      };

      unsubLoaded = shopRewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
        shopRewardedAd.show();
      });

      unsubEarned = shopRewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        starsAwarded = true;
        triggerHaptic('notificationSuccess');
        // Don't call .load() here — let CLOSED handle cleanup
      });

      unsubClosed = shopRewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
        setIsWatchingAd(false);
        cleanup(); // Remove all listeners — prevents ad from auto-showing again
        if (starsAwarded) {
          const newBalance = starBalance + 5;
          setStarBalance(newBalance);
          saveProgress(unlockedLevels, highScores, { stars: newBalance, missiles: missileStock, mines: mineStock, themes: unlockedThemes, currentTheme });
        }
      });

      shopRewardedAd.load();
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
      if (!newThemes.includes(item.id)) newThemes.push(item.id);
      setUnlockedThemes(newThemes);
      // Immediately equip the new theme
      setCurrentTheme(item.id);
      // Apply to running game if mid-level
      if (gameEngineRef.current) {
        const state = gameEngineRef.current.state;
        if (state?.entities?.paddle) {
          state.entities.paddle.themeId = item.id;
        }
      }
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
      currentTheme: item.type === 'THEME' ? item.id : currentTheme,
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
            running={running && !paused && !win && !go && !showShop}
            onEvent={onEvent}
          />

          {/* BACKGROUND BRANDING WATERMARK */}
          {showBranding && !showMenu && (
            <View style={styles.brandingLayer} pointerEvents="none">
              <View style={styles.logoCircleSmall}>
                <Text style={styles.gameLogoSubSmall}>🚀</Text>
              </View>
              <Text style={styles.brandingText}>BRICKSTRIKE</Text>
              <Text style={styles.brandingSubText}>W O R L D  T O U R</Text>
            </View>
          )}

          {!showMenu && !win && !go && (
            <>
              {/* Pause Button */}
              <TouchableOpacity onPress={togglePause} style={styles.pauseButton} activeOpacity={0.7}>
                <View style={styles.pauseButtonInner}>
                  <Text style={styles.pauseIcon}>{paused ? '▶' : '⏸'}</Text>
                </View>
              </TouchableOpacity>

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
                      <TouchableOpacity onPress={() => { setShowShop(true); }} style={[styles.overlayBtn, styles.btnNext]}>
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
            {/* RESTORED ROCKET HEADER */}
            <View style={styles.menuHeader}>
              <View style={styles.logoGroup}>
                <View style={styles.logoCircle}>
                  <Text style={styles.gameLogoSub}>🚀</Text>
                </View>
                <Text style={styles.gameLogo}>BRICKSTRIKE</Text>
                <Text style={styles.gameTagline}>W O R L D  T O U R</Text>
              </View>
              <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.gearButton}>
                <Text style={styles.gearIcon}>⚙️</Text>
              </TouchableOpacity>
            </View>

            {/* Level Grid - Cartoon Board Style */}
            <View style={styles.boardWrapper}>
              <View style={styles.boardInner}>
                
                {/* Overlapping Title Badge */}
                <View style={styles.boardHeaderBadge}>
                  <Text style={styles.boardHeaderTitle}>CHOOSE LEVEL</Text>
                </View>

                <ScrollView
                  contentContainerStyle={styles.boardScroll}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.boardGrid}>
                    {FLAG_LEVELS.map((lvl, index) => {
                      const isUnlocked = unlockedLevels.includes(index);
                      const entry = highScores[lvl.id] || 0;
                      const score = typeof entry === 'string' ? entry.split('|')[0] : entry;
                      const stars = typeof entry === 'string' ? parseInt(entry.split('|')[1]) : (entry > 0 ? 1 : 0);

                      return (
                        <View key={lvl.id} style={styles.boardItemWrapper}>
                          <TouchableOpacity
                            disabled={!isUnlocked}
                            onPress={() => startLevel(index)}
                            style={[styles.boardBtn, !isUnlocked && styles.boardBtnLocked]}
                            activeOpacity={0.7}
                          >
                            <View style={styles.boardFullFlag}>
                              <FlagMiniPreview
                                flagColors={lvl.flagColors}
                                flagOrientation={lvl.flagOrientation}
                                fallbackColor={lvl.backgroundColor}
                              />
                            </View>
                            {!isUnlocked && (
                              <View style={styles.boardBtnLockedInner}>
                                <Text style={styles.boardBtnLockIcon}>🔒</Text>
                              </View>
                            )}
                            {isUnlocked && <View style={styles.boardBtnGloss} />}
                          </TouchableOpacity>

                          <View style={styles.boardItemInfo}>
                            <Text style={styles.boardItemName} numberOfLines={1}>
                              {lvl.name.toUpperCase()}
                            </Text>
                            <View style={styles.boardBtnStarsRow}>
                              {[1, 2, 3].map(i => (
                                <Text key={i} style={[styles.boardBtnStar, i <= stars && styles.boardBtnStarActive]}>★</Text>
                              ))}
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </ScrollView>

                {/* Bottom Bar Controls */}
                <View style={styles.boardBottomBar}>
                  <TouchableOpacity onPress={resetProgress} style={[styles.boardBottomBtn, { backgroundColor: '#F44336' }]}>
                    <Text style={styles.boardBottomBtnIcon}>↺</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowShop(true)} style={[styles.boardBottomBtn, { backgroundColor: '#4CAF50', flex: 1 }]}>
                    <Text style={styles.boardBottomBtnText}>🛒 SHOP</Text>
                  </TouchableOpacity>
                </View>

              </View>
            </View>
          </View>
        )}

        {/* SETTINGS OVERLAY */}
        {showSettings && (
          <View style={styles.overlay}>
            <View style={styles.settingsCard}>
              <Text style={styles.pauseTitle}>SETTINGS</Text>
              <View style={styles.settingsGroup}>
                <Text style={styles.settingLabel}>AUDIO</Text>
                <TouchableOpacity onPress={toggleSound} style={[styles.settingToggle, soundEnabled && styles.toggleActive]}>
                  <Text style={styles.toggleText}>{soundEnabled ? 'ENABLED' : 'MUTED'}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.settingsGroup}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>SOCIAL BRANDING</Text>
                  <Text style={styles.settingSub}>Watermark overlay for recording</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    const newVal = !showBranding;
                    setShowBranding(newVal);
                    AsyncStorage.setItem('@show_branding', JSON.stringify(newVal));
                  }}
                  style={[styles.settingToggle, showBranding && styles.toggleActive]}
                >
                  <Text style={styles.toggleText}>{showBranding ? 'ON' : 'OFF'}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={() => setShowSettings(false)} style={styles.closeSettingsBtn}>
                <Text style={styles.closeSettingsText}>DONE</Text>
              </TouchableOpacity>
            </View>
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
                    <Text style={styles.resultEcoText}>TIME: {Math.floor(finalTime / 60)}:{(finalTime % 60).toString().padStart(2, '0')}</Text>
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
                {/* CONTINUE WITH AD — only on Game Over, not on Win */}
                {go && canRevive && (
                  <TouchableOpacity
                    onPress={handleContinueWithAd}
                    style={[styles.overlayBtn, styles.btnContinueAd]}
                  >
                    <Text style={[styles.overlayBtnText, { color: '#000' }]}>📺  CONTINUE (Watch Ad)</Text>
                  </TouchableOpacity>
                )}
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
            currentTheme={currentTheme}
            onClose={() => setShowShop(false)}
            onBuy={handleBuy}
            onEquipTheme={(themeId) => {
              setCurrentTheme(themeId);
              // Apply immediately to running game
              if (gameEngineRef.current) {
                const state = gameEngineRef.current.state;
                if (state?.entities?.paddle) {
                  state.entities.paddle.themeId = themeId;
                }
              }
              saveProgress(unlockedLevels, highScores, { stars: starBalance, missiles: missileStock, mines: mineStock, themes: unlockedThemes, currentTheme: themeId });
            }}
          />
        )}

        {/* Ad Loading Overlay */}
        {isWatchingAd && (
          <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.95)' }]}>
            <View style={styles.resultCard}>
              <Text style={styles.resultEmoji}>📺</Text>
              <Text style={styles.resultTitle}>LOADING AD...</Text>
              <Text style={styles.resultLevel}>
                {adPurpose === 'revive' ? 'Watch to Continue Playing!' : 'Watch to Earn Stars!'}
              </Text>
            </View>
          </View>
        )}
        {/* Global Fixed Banner Ad — only render once AdMob is initialized */}
        {adsReady && (
          <View style={styles.globalAdContainer}>
            <BannerAd
              unitId={BANNER_AD_ID}
              size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
              requestOptions={{ requestNonPersonalizedAdsOnly: true }}
              onAdLoaded={() => console.log('[Banner] Ad loaded')}
              onAdFailedToLoad={(e) => console.log('[Banner] Ad failed:', e)}
            />
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
  globalAdContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0, right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 15, 0.8)',
    zIndex: 5000,
    paddingBottom: 2, // Slight lift
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
    paddingBottom: 60, // Space for global ad
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
  btnContinueAd: { backgroundColor: '#00E676', borderColor: '#000' },

  // ── Result Card ───────────────────────────
  resultCard: {
    width: '85%',
    backgroundColor: '#FFEB3B',
    borderRadius: 30,
    padding: 30,
    paddingBottom: 60, // Space for global ad
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

  // ── Branding Layer ────────────────────────
  brandingLayer: {
    position: 'absolute',
    bottom: 180, // Moved higher as requested
    left: 0, right: 0,
    alignItems: 'center',
    opacity: 0.15,
    zIndex: 0,
  },
  logoCircleSmall: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  gameLogoSubSmall: { fontSize: 18 },
  brandingText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
  },
  brandingSubText: {
    color: '#4ECDC4',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: -2,
  },

  // ── Main Menu Redesign ────────────────────
  menuContainer: {
    flex: 1,
    backgroundColor: '#0A0B10',
    paddingBottom: 60,
  },
  menuHeader: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#11131A',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    alignItems: 'center', // Centering the logo perfectly
    justifyContent: 'center',
  },
  logoGroup: {
    alignItems: 'center',
  },
  logoCircle: {
      width: 60, height: 60,
      borderRadius: 30,
      backgroundColor: '#4ECDC4',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
      borderWidth: 3,
      borderColor: '#FFF',
  },
  gameLogoSub: { fontSize: 28 },
  gameLogo: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  gameTagline: {
    color: '#4ECDC4',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 3,
  },
  gearButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44, height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  gearIcon: { fontSize: 22 },

  headerShopCard: {
    flexDirection: 'row',
    backgroundColor: '#FFEE58',
    borderRadius: 18,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#000',
  },
  shopCardInfo: { flex: 1 },
  shopCardTitle: {
    color: '#000',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    opacity: 0.6,
  },
  shopCardStars: {
    color: '#000',
    fontSize: 18,
    fontWeight: '900',
  },
  shopCardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  shopCardActionText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    marginRight: 4,
  },
  shopCardArrow: { color: '#FFEE58', fontSize: 12, fontWeight: '900' },

  // ── Cartoon Modal Board ───────────────────
  boardWrapper: {
    flex: 1,
    paddingHorizontal: 15,
    paddingBottom: 20,
    justifyContent: 'center',
  },
  boardInner: {
    flex: 1,
    backgroundColor: '#0F1218', // Deep dark space background
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#00E5FF', // Neon Cyan
    overflow: 'visible',
    marginTop: 20, 
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
  },
  boardHeaderBadge: {
    position: 'absolute',
    top: -30,
    alignSelf: 'center',
    backgroundColor: '#0F1218',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#FF00FF', // Neon Magenta
    zIndex: 10,
    shadowColor: '#FF00FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  boardHeaderTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowColor: '#FF00FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  boardScroll: {
    paddingTop: 45, // Leave room for the overlapping badge
    paddingBottom: 20,
    paddingHorizontal: 15,
  },
  boardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
  },
  boardItemWrapper: {
    width: 85,
    alignItems: 'center',
    marginBottom: 10,
  },
  boardBtn: {
    width: 85,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#1A1C24',
    borderWidth: 2,
    borderColor: '#00E5FF', // Neon Cyan
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
    overflow: 'hidden',
  },
  boardFullFlag: {
    ...StyleSheet.absoluteFillObject,
  },
  boardBtnLocked: {
    backgroundColor: '#9E9E9E',
    borderColor: '#424242',
  },
  boardBtnLockedInner: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  boardBtnLockIcon: {
    fontSize: 20,
    opacity: 0.9,
  },
  boardBtnGloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  boardItemInfo: {
    width: '100%',
    alignItems: 'center',
    marginTop: 6,
  },
  boardItemName: {
    color: '#00E5FF', // Glowing Neon Cyan
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 2,
    textShadowColor: '#00E5FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  boardBtnStarsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 3,
  },
  boardBtnStar: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.1)', // Very faint for inactive star
  },
  boardBtnStarActive: {
    color: '#FFEA00', // Neon Yellow
    textShadowColor: '#FFEA00', // Soft glow
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  
  // Bottom Controls
  boardBottomBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    gap: 15,
  },
  boardBottomBtn: {
    height: 50,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  boardBottomBtnIcon: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
  },
  boardBottomBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  // ── Settings Overlay ─────────────────────
  settingsCard: {
    width: '85%',
    backgroundColor: '#16171D',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
  },
  settingsGroup: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  settingInfo: { flex: 1, marginRight: 10 },
  settingLabel: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  settingSub: {
    color: '#666',
    fontSize: 11,
    marginTop: 2,
  },
  settingToggle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#333',
    minWidth: 90,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#66BB6A',
  },
  toggleText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
  },
  closeSettingsBtn: {
    marginTop: 30,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  closeSettingsText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '900',
  },

  // ── Legacy Compatibility ──────────────────
  resetButton: {
    marginTop: 20,
    marginHorizontal: 100,
    paddingVertical: 10,
    alignItems: 'center',
    opacity: 0.3,
  },
  resetText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
});
