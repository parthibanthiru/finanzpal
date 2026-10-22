// Mirrors the website's design tokens (assets/style.css :root) and the FP5 logo colors,
// so app and finanzpal.de look like one product. Change them together.
import { Platform } from 'react-native';

export const colors = {
  primary: '#2E5F9E',      // --green  (site name kept for history; it is the blue action color)
  primaryDark: '#163A66',  // --green-deep
  ink: '#0F2A3D',          // --logo-ink (header, wordmark "finanz")
  pal: '#17855A',          // --logo-pal (wordmark "pal")
  smile: '#2FBF7F',        // logo smile, accents on dark backgrounds
  accent: '#B8901F',       // --gold
  bg: '#F1F4EF',           // --bg
  card: '#FFFFFF',         // --bg-raised
  text: '#16241C',         // --ink
  muted: '#4B594E',        // --ink-soft
  border: '#D7DED3',       // --line
  tag: '#E3EAF5',          // --tag-bg
  rowAlt: '#E8EDF5',       // --row-alt
  danger: '#8A3B33',       // --red-soft
  teal: '#1C6E65',
  slate: '#3C5A72',
  userBubble: '#2E5F9E',
  botBubble: '#FFFFFF',
};

// Finanzpal-Score band colors, same as .fp-score-badge.band-* on the website.
export const bandColors: Record<string, string> = {
  A: colors.primaryDark,
  B: colors.teal,
  C: colors.accent,
  D: colors.slate,
};

// The site uses Source Serif 4 for headings; the closest built-in serif per platform.
export const fonts = {
  display: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' }),
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius = { sm: 8, md: 12, lg: 20 };
