import { Pressable, StyleSheet, Text, View } from 'react-native';
import { openSite } from '@/lib/site';
import { colors, spacing } from './theme';

// Both pages must exist on the website before the app goes to the stores.
// Apple and Google ask for the privacy-policy URL in the store listing as well.
// The website already has both pages (still placeholders there — fill them before launch).
const LEGAL_PAGES = {
  datenschutz: 'datenschutz.html',
  impressum: 'impressum.html',
};

export function openLegal(page: keyof typeof LEGAL_PAGES) {
  return openSite(LEGAL_PAGES[page]);
}

export function LegalLinks() {
  return (
    <View style={styles.row}>
      <Pressable onPress={() => openLegal('datenschutz')} accessibilityRole="link">
        <Text style={styles.link}>Datenschutz</Text>
      </Pressable>
      <Text style={styles.sep}>·</Text>
      <Pressable onPress={() => openLegal('impressum')} accessibilityRole="link">
        <Text style={styles.link}>Impressum</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: spacing.lg },
  link: { color: colors.muted, fontSize: 13, textDecorationLine: 'underline' },
  sep: { color: colors.muted, marginHorizontal: spacing.sm },
});
