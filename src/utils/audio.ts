import Sound from 'react-native-sound';

// Enable playback in silence mode
Sound.setCategory('Playback');

const sounds: { [key: string]: Sound } = {};

const loadSound = (name: string) => {
  const s = new Sound(`${name}.wav`, Sound.MAIN_BUNDLE, (error) => {
    if (error) {
      console.log('failed to load the sound', name, error);
      return;
    }
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
