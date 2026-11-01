import { memo } from 'react';
import { Text, View } from 'react-native';
import { SvgCss } from 'react-native-svg/css';
import { makeStyles, spacing, useColors } from './theme';

// Provider logos from the website (assets/logos/*.svg via data/logos.json, written by
// tools/sync-data.mjs). SvgCss because several logos style their shapes with <style> classes.
const LOGOS: Record<string, string> = require('../data/logos.json');

export const hasLogo = (logo?: string | null) => !!logo && !!LOGOS[logo];

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
  const box = { width: size, height: size, borderRadius: Math.round(size * 0.23) };
  if (logo && LOGOS[logo]) {
    return (
      <View style={[styles.box, styles.chip, box]} accessible={false} importantForAccessibility="no-hide-descendants">
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
  chip: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, padding: 5 },
  initials: { color: '#fff', fontWeight: '700' },
}));
