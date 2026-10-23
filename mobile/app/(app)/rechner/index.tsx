import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { fonts, makeStyles, radius, spacing } from '@/components/theme';
import { useT, type Strings } from '@/lib/i18n';

// Same 7 calculators as the website's "Rechner" menu, all built into the app
// (math identical to the website's assets/*rechner.js — see lib/calc.ts).
type Route =
  | '/rechner/sparplan' | '/rechner/zinseszins' | '/rechner/kredit' | '/rechner/baufinanzierung'
  | '/rechner/nettolohn' | '/rechner/altersvorsorge' | '/rechner/haushaltsbuch';

// Titles and subtitles: strings.calc.list (the website's "Rechner" menu names)
const RECHNER: { key: keyof Strings['calc']['list']; icon: string; route: Route }[] = [
  { key: 'sparplan', icon: '📈', route: '/rechner/sparplan' },
  { key: 'zinseszins', icon: '🌱', route: '/rechner/zinseszins' },
  { key: 'kredit', icon: '💰', route: '/rechner/kredit' },
  { key: 'baufinanzierung', icon: '🏠', route: '/rechner/baufinanzierung' },
  { key: 'nettolohn', icon: '🧮', route: '/rechner/nettolohn' },
  { key: 'altersvorsorge', icon: '🧓', route: '/rechner/altersvorsorge' },
  { key: 'haushaltsbuch', icon: '📒', route: '/rechner/haushaltsbuch' },
];

export default function RechnerScreen() {
  const styles = useStyles();
  const t = useT();
  const router = useRouter();
  return (
    <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}>
      {RECHNER.map((r) => (
        <Pressable key={r.route} style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]} onPress={() => router.push(r.route)}>
          <Text style={styles.icon}>{r.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{t.calc.list[r.key].title}</Text>
            <Text style={styles.sub}>{t.calc.list[r.key].sub}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm,
  },
  icon: { fontSize: 24, marginRight: spacing.md },
  title: { fontFamily: fonts.display, fontSize: 18, color: colors.text },
  sub: { fontSize: 13, color: colors.muted, marginTop: 2 },
  chevron: { fontSize: 22, color: colors.muted, marginLeft: spacing.sm },
}));
