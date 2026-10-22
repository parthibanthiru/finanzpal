import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { openSite } from '@/lib/site';
import { colors, fonts, radius, spacing } from '@/components/theme';

// Same 7 calculators as the website's "Rechner" menu.
// Native = built into the app; the rest open the website page for now.
const RECHNER: { title: string; sub: string; icon: string; route?: '/rechner/sparplan' | '/rechner/kredit'; page?: string }[] = [
  { title: 'Sparplanrechner', sub: 'ETF-Sparplan: Einmalanlage + Sparrate', icon: '📈', route: '/rechner/sparplan' },
  { title: 'Kreditrechner', sub: 'Monatsrate und Zinskosten', icon: '💰', route: '/rechner/kredit' },
  { title: 'Zinseszinsrechner', sub: 'Wie Zinsen auf Zinsen wachsen', icon: '🌱', page: 'zinseszinsrechner.html' },
  { title: 'Baufinanzierungsrechner', sub: 'Rate, Restschuld, Zinskosten', icon: '🏠', page: 'baufinanzierungsrechner.html' },
  { title: 'Brutto-Netto-Rechner', sub: 'Steuerklasse I mit Abgaben-Aufschlüsselung', icon: '🧮', page: 'nettolohnrechner.html' },
  { title: 'Altersvorsorge-Rechner', sub: 'Wie groß ist deine Rentenlücke?', icon: '🧓', page: 'altersvorsorge-rechner.html' },
  { title: 'Haushaltsbuch', sub: 'Einnahmen und Ausgaben im Blick', icon: '📒', page: 'haushaltsbuch.html' },
];

export default function RechnerScreen() {
  const router = useRouter();
  return (
    <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}>
      {RECHNER.map((r) => (
        <Pressable
          key={r.title}
          style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
          onPress={() => (r.route ? router.push(r.route) : openSite(r.page!))}
        >
          <Text style={styles.icon}>{r.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{r.title}</Text>
            <Text style={styles.sub}>{r.sub}</Text>
          </View>
          <Text style={styles.chevron}>{r.route ? '›' : '↗'}</Text>
        </Pressable>
      ))}
      <Text style={styles.hint}>↗ öffnet den Rechner auf finanzpal.de</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm,
  },
  icon: { fontSize: 24, marginRight: spacing.md },
  title: { fontFamily: fonts.display, fontSize: 18, color: colors.text },
  sub: { fontSize: 13, color: colors.muted, marginTop: 2 },
  chevron: { fontSize: 22, color: colors.muted, marginLeft: spacing.sm },
  hint: { fontSize: 12, color: colors.muted, marginTop: spacing.sm, textAlign: 'center' },
});
