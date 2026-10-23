import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { openSite } from '@/lib/site';
import { useI18n } from '@/lib/i18n';
import { Colors, fonts, makeStyles, radius, spacing, useColors } from '@/components/theme';

// The guides from ratgeber.html / en/ratgeber.html (titles, teasers, topics), synced into
// data/ratgeber.json by tools/sync-data.mjs. Articles open on the website in the app's language,
// so content is maintained in one place only.
type Guide = { page: string; cat: number; catLabel: string; title: string; teaser: string };
const GUIDES: Record<'de' | 'en', { topics: string[]; articles: Guide[] }> = require('../../data/ratgeber.json');

// Accent color per topic, in the website's chip order:
// Investieren · Zahlen · Sparen · Finanzieren · Absichern · Vorsorge
const topicColors = (colors: Colors) => [colors.primary, colors.slate, colors.teal, colors.accent, colors.primaryDark, colors.pal];

export default function RatgeberScreen() {
  const styles = useStyles();
  const colors = useColors();
  const { t, lang } = useI18n();
  const accents = topicColors(colors);
  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}>
      <Text style={styles.intro}>{t.guides.intro}</Text>
      {GUIDES[lang].articles.map((a) => (
        <Pressable key={a.page} style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]} onPress={() => openSite(a.page)}>
          <View style={[styles.stripe, { backgroundColor: accents[a.cat] ?? colors.primary }]} />
          <View style={{ flex: 1, padding: spacing.md }}>
            <Text style={[styles.cat, { color: accents[a.cat] ?? colors.primary }]}>{a.catLabel}</Text>
            <Text style={styles.title}>{a.title}</Text>
            <Text style={styles.teaser}>{a.teaser}</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const useStyles = makeStyles((colors) => ({
  intro: { fontSize: 15, color: colors.muted, lineHeight: 21, marginBottom: spacing.md },
  card: {
    flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1,
    borderColor: colors.border, marginBottom: spacing.sm, overflow: 'hidden',
  },
  stripe: { width: 5 },
  cat: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  title: { fontFamily: fonts.display, fontSize: 18, color: colors.text, marginTop: 4, lineHeight: 23 },
  teaser: { fontSize: 14, color: colors.muted, marginTop: 4, lineHeight: 20 },
}));
