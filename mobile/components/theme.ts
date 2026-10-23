// Light and dark palettes mirror the website's design tokens (assets/style.css :root and
// :root[data-theme="dark"]) plus the FP5 logo colors, so app and finanzpal.de look like one
// product in both themes. Change them together.
//
// Screens read colors through the active theme:
//   const colors = useColors();                     // inside a component
//   const useStyles = makeStyles((colors) => ({ … })); const styles = useStyles();
import { createContext, useContext } from 'react';
import { Platform, StyleSheet } from 'react-native';

const light = {
  primary: '#2E5F9E',      // --green  (site name kept for history; it is the blue action color)
  primaryDark: '#163A66',  // --green-deep
  onPrimary: '#FFFFFF',    // text/icons on primary backgrounds
  ink: '#0F2A3D',          // brand surface: headers, Finanz-Check card, strong tiles (white text on it)
  inkMuted: '#C9D6E2',     // secondary text on ink surfaces
  inkLine: '#2C4A60',      // dividers on ink surfaces
  logoInk: '#0F2A3D',      // wordmark "finanz" (--logo-ink)
  pal: '#17855A',          // wordmark "pal" (--logo-pal)
  smile: '#2FBF7F',        // logo smile, accents on ink surfaces
  accent: '#B8901F',       // --gold
  bg: '#F1F4EF',           // --bg
  card: '#FFFFFF',         // --bg-raised
  text: '#16241C',         // --ink
  muted: '#4B594E',        // --ink-soft
  border: '#D7DED3',       // --line
  tag: '#E3EAF5',          // --tag-bg
  rowAlt: '#E8EDF5',       // --row-alt
  danger: '#8A3B33',       // --red-soft
  dangerBg: '#FBEAE8',
  infoBg: '#E3F1EE',
  infoText: '#0A4239',
  teal: '#1C6E65',
  slate: '#3C5A72',
  userBubble: '#2E5F9E',
  onUserBubble: '#FFFFFF',
  botBubble: '#FFFFFF',
};

export type Colors = typeof light;

const dark: Colors = {
  primary: '#7FB0E0',      // --green (dark)
  primaryDark: '#9CC2EF',  // --green-deep (dark)
  onPrimary: '#0F2A3D',
  ink: '#1C2A3D',          // --tag-bg (dark): stays a distinct, dark brand surface
  inkMuted: '#B9C7D6',
  inkLine: '#33465C',
  logoInk: '#FFFFFF',      // --logo-ink (dark)
  pal: '#2FBF7F',          // --logo-pal (dark)
  smile: '#2FBF7F',
  accent: '#E0B347',       // --gold (dark)
  bg: '#12190F',           // --bg (dark)
  card: '#1A2417',         // --bg-raised (dark)
  text: '#EEF2EA',         // --ink (dark)
  muted: '#A9B7A2',        // --ink-soft (dark)
  border: '#2C3A28',       // --line (dark)
  tag: '#1C2A3D',          // --tag-bg (dark)
  rowAlt: '#202C1C',
  danger: '#D98A80',       // --red-soft (dark)
  dangerBg: '#3A1F1C',
  infoBg: '#17302B',
  infoText: '#BFE3DA',
  teal: '#5FBFB0',         // --teal (dark)
  slate: '#93B4CE',        // --slate (dark)
  userBubble: '#2E5F9E',
  onUserBubble: '#FFFFFF',
  botBubble: '#1A2417',
};

export const palettes = { light, dark };
export type Scheme = 'light' | 'dark';
export type ThemePreference = 'system' | 'light' | 'dark';

export type Theme = {
  colors: Colors;
  scheme: Scheme;
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
};

export const ThemeContext = createContext<Theme>({
  colors: light,
  scheme: 'light',
  preference: 'system',
  setPreference: () => {},
});

export const useTheme = () => useContext(ThemeContext);
export const useColors = () => useContext(ThemeContext).colors;

/** Theme-aware StyleSheet: built once per palette and cached. */
export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  factory: (colors: Colors) => T
): () => T {
  const cache = new Map<Colors, T>();
  return function useStyles() {
    const colors = useColors();
    let styles = cache.get(colors);
    if (!styles) {
      styles = StyleSheet.create(factory(colors)) as T;
      cache.set(colors, styles);
    }
    return styles;
  };
}

// Finanzpal-Score band colors, same as .fp-score-badge.band-* on the website.
export function bandColors(colors: Colors): Record<string, string> {
  return { A: colors.primaryDark, B: colors.teal, C: colors.accent, D: colors.slate };
}

/** Letter color on a score badge: dark on gold (band C), otherwise the on-primary color. */
export function bandTextColor(colors: Colors, band: string): string {
  return band === 'C' ? '#0F2A3D' : colors.onPrimary;
}

// The site uses Source Serif 4 for headings; the closest built-in serif per platform.
export const fonts = {
  display: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' }),
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius = { sm: 8, md: 12, lg: 20 };
