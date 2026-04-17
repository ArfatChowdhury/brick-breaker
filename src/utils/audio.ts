import Sound from 'react-native-sound';
import { Platform } from 'react-native';

// Enable playback in silence mode - second argument is required in some Kotlin versions!
Sound.setCategory('Playback', true);

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
  'pickup_coin', 'power_up', 'tink', 'victory'
];

soundAssets.forEach(loadSound);

export const playSound = (name: string) => {
  if (sounds[name]) {
    sounds[name].stop(() => {
      sounds[name].play();
    });
  }
};
