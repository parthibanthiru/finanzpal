import { memo } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import { SvgCss } from 'react-native-svg/css';
import { makeStyles, spacing, useColors } from './theme';

// Provider logos from the website (assets/logos/*.svg via data/logos.json, written by
// tools/sync-data.mjs). SvgCss because several logos style their shapes with <style> classes.
const LOGOS: Record<string, string> = require('../data/logos.json');

export const hasLogo = (logo?: string | null) => !!logo && !!LOGOS[logo];

/** Width ÷ height of a logo, read from its SVG viewBox (1 when unknown). */
export function logoAspect(logo?: string | null): number {
  const svg = logo ? LOGOS[logo] : undefined;
  const vb = svg?.match(/<svg[^>]*\sviewBox="([^"]+)"/)?.[1].trim().split(/[\s,]+/).map(Number);
  return vb && vb.length === 4 && vb[2] > 0 && vb[3] > 0 ? vb[2] / vb[3] : 1;
}

const CHIP_PADDING = 5;
/** Wordmarks wider than this get a wider chip instead of shrinking inside the square. */
export const WIDE_LOGO_ASPECT = 2;
/** A wide chip grows to at most this many times its height. */
export const MAX_CHIP_WIDTH = 2.4;
/** On narrow phones (< NARROW_SCREEN dp wide) wide chips stay smaller, so a one-word provider name
 *  next to the logo, score and heart still fits on one line (360 dp showed "Openba-nk"). */
export const NARROW_SCREEN = 400;
export const NARROW_MAX_CHIP_WIDTH = 1.8;

/** Chip width for a logo at a given chip height: square, or wider for wordmarks (same height). */
export function chipWidth(logo: string | null | undefined, size: number, maxFactor = MAX_CHIP_WIDTH): number {
  const aspect = logoAspect(logo);
  if (aspect <= WIDE_LOGO_ASPECT) return size;
  const inner = size - 2 * CHIP_PADDING;
  return Math.floor(Math.min(inner * aspect + 2 * CHIP_PADDING, size * maxFactor));
}

/**
 * The provider's mark: its logo on a white chip like the website's `.logo-chip`
 * (white in dark mode too, so brand colours stay right), otherwise the coloured initials box.
 */
export const ProviderMark = memo(function ProviderMark({
  logo, initials, color, name, size = 44,
}: {
  logo?: string | null; initials?: string | null; color?: string | null; name: string; size?: number;
}) {
  const styles = useStyles();
  const colors = useColors();
  const { width: screenWidth } = useWindowDimensions();
  const maxFactor = screenWidth < NARROW_SCREEN ? NARROW_MAX_CHIP_WIDTH : MAX_CHIP_WIDTH;
  const box = { width: size, height: size, borderRadius: Math.round(size * 0.23) };
  if (logo && LOGOS[logo]) {
    return (
      <View
        testID="provider-logo"
        style={[styles.box, styles.chip, box, { width: chipWidth(logo, size, maxFactor) }]}
        accessible={false} importantForAccessibility="no-hide-descendants">
        <SvgCss xml={LOGOS[logo]} width="100%" height="100%" />
      </View>
    );
  }
  return (
    <View style={[styles.box, box, { backgroundColor: color ?? colors.ink }]}>
      <Text style={[styles.initials, { fontSize: Math.round(size * 0.31) }]} numberOfLines={1} adjustsFontSizeToFit>
        {initials ?? name.slice(0, 2).toUpperCase()}
      </Text>
    </View>
  );
});

const useStyles = makeStyles((colors) => ({
  box: { alignItems: 'center', justifyContent: 'center', marginRight: spacing.md, paddingHorizontal: 3 },
  chip: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, padding: CHIP_PADDING },
  initials: { color: '#fff', fontWeight: '700' },
}));
