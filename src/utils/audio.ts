import Sound from 'react-native-sound';

// Enable playback in silence mode
Sound.setCategory('Playback');

const sounds: { [key: string]: Sound } = {};

const loadSound = (name: string) => {
  const s = new Sound(`${name}.mp3`, Sound.MAIN_BUNDLE, (error) => {
    if (error) {
      console.log('failed to load the sound', name, error);
      return;
    }
  });
  sounds[name] = s;
};

// Initial load for common sounds
// Note: These must exist in android/app/src/main/res/raw/
['hit', 'break', 'wall', 'powerup', 'win', 'lose'].forEach(loadSound);

export const playSound = (name: string) => {
  if (sounds[name]) {
    sounds[name].stop(() => {
      sounds[name].play();
    });
  }
};
