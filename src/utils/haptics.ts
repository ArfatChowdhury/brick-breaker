import ReactNativeHapticFeedback from "react-native-haptic-feedback";

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export const triggerHaptic = (type = "impactLight") => {
  if (ReactNativeHapticFeedback && typeof ReactNativeHapticFeedback.trigger === 'function') {
    ReactNativeHapticFeedback.trigger(type, options);
  } else {
    console.log('Haptic feedback module not found. Rebuild the app to enable.');
  }
};
