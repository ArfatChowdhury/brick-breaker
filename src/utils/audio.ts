import Sound from 'react-native-sound';
import { Platform } from 'react-native';

// Enable playback in silence mode - second argument is required in Kotlin versions
Sound.setCategory('Playback', true);

// Global sound enabled flag (persisted via App.tsx / AsyncStorage)
let _soundEnabled = true;

export const setSoundEnabled = (enabled: boolean) => {
  _soundEnabled = enabled;
  if (!enabled) {
    // Stop any looping sounds immediately
    Object.keys(sounds).forEach(stopSound);
  }
};

export const isSoundEnabled = () => _soundEnabled;

const sounds: { [key: string]: Sound } = {};

const loadSound = (name: string) => {
  // Android resources in res/raw must not include the extension
  const soundPath = Platform.OS === 'android' ? name : `${name}.wav`;

  const s = new Sound(soundPath, Sound.MAIN_BUNDLE, (error) => {
    if (error) {
      console.log(`[Audio] ❌ Failed to load ${name}:`, error.message || error);
      return;
    }
    console.log(`[Audio] ✅ Successfully loaded ${name}`);
    s.setVolume(1.0);
  });
  sounds[name] = s;
};

// Initial load for common sounds
// Note: These must exist in android/app/src/main/res/raw/
const soundAssets = [
  'blip_select', 'clear', 'click', 'explosion_blast',
  'explosion', 'game_over', 'hit_hurt', 'laser_shoot',
  'pickup_coin', 'power_up', 'tink', 'victory',
  'game_sfx', 'game_start',
];

soundAssets.forEach(loadSound);

export const stopSound = (name: string) => {
  if (sounds[name]) {
    sounds[name].stop();
  }
};

export const playSound = (name: string, loop: boolean = false) => {
  if (!_soundEnabled) return;
  const s = sounds[name];
  if (s) {
    if (loop) {
      s.setNumberOfLoops(-1);
    } else {
      s.setNumberOfLoops(0);
    }
    
    s.stop(() => {
      s.play((success) => {
        if (!success) console.log(`[Audio] ❌ Playback failed for ${name}`);
      });
    });
  }
};
