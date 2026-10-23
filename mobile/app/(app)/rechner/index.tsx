import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { fonts, makeStyles, radius, spacing } from '@/components/theme';

// Same 7 calculators as the website's "Rechner" menu, all built into the app
// (math identical to the website's assets/*rechner.js — see lib/calc.ts).
type Route =
  | '/rechner/sparplan' | '/rechner/zinseszins' | '/rechner/kredit' | '/rechner/baufinanzierung'
  | '/rechner/nettolohn' | '/rechner/altersvorsorge' | '/rechner/haushaltsbuch';

const RECHNER: { title: string; sub: string; icon: string; route: Route }[] = [
  { title: 'Sparplanrechner', sub: 'ETF-Sparplan: Einmalanlage + Sparrate', icon: '📈', route: '/rechner/sparplan' },
  { title: 'Zinseszinsrechner', sub: 'Wie Zinsen auf Zinsen wachsen', icon: '🌱', route: '/rechner/zinseszins' },
  { title: 'Kreditrechner', sub: 'Monatsrate und Zinskosten', icon: '💰', route: '/rechner/kredit' },
  { title: 'Baufinanzierungsrechner', sub: 'Rate, Restschuld, Zinskosten', icon: '🏠', route: '/rechner/baufinanzierung' },
  { title: 'Brutto-Netto-Rechner', sub: 'Steuerklasse I mit Abgaben-Aufschlüsselung', icon: '🧮', route: '/rechner/nettolohn' },
  { title: 'Altersvorsorge-Rechner', sub: 'Vermögen zur Rente und monatliche Auszahlung', icon: '🧓', route: '/rechner/altersvorsorge' },
  { title: 'Haushaltsbuch', sub: 'Einnahmen und Ausgaben im Blick', icon: '📒', route: '/rechner/haushaltsbuch' },
];

export default function RechnerScreen() {
  const styles = useStyles();
  const router = useRouter();
  return (
    <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}>
      {RECHNER.map((r) => (
        <Pressable key={r.route} style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]} onPress={() => router.push(r.route)}>
          <Text style={styles.icon}>{r.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{r.title}</Text>
            <Text style={styles.sub}>{r.sub}</Text>
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
