/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Color Palette
const primaryWhite = '#FFFFFF';
const primaryAccent = '#00CFFD';
const darkText = '#111113';
const darkBg = '#111113';
const darkBgSecondary = '#222228';
const mediumGray = '#4A4A58';

export const Colors = {
  light: {
    text: darkText,
    background: primaryWhite,
    tint: primaryAccent,
    icon: mediumGray,
    tabIconDefault: mediumGray,
    tabIconSelected: primaryAccent,
  },
  dark: {
    text: primaryWhite,
    background: darkBg,
    tint: primaryAccent,
    icon: mediumGray,
    tabIconDefault: mediumGray,
    tabIconSelected: primaryAccent,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS system sans-serif */
    sans: 'system-ui',
    /** iOS serif */
    serif: 'ui-serif',
    /** iOS rounded */
    rounded: 'ui-rounded',
    /** iOS monospace */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
