import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { openSite } from '@/lib/site';
import { Colors, fonts, makeStyles, radius, spacing, useColors } from '@/components/theme';

// The 10 guides from ratgeber.html (same titles, teasers and categories).
// Articles open on finanzpal.de, so content is maintained in one place only.
const ARTIKEL = [
  { cat: 'Investieren', page: 'ratgeber-etf-sparplan.html', title: 'ETF-Sparplan starten: Die ersten Schritte', teaser: 'Was du vor der ersten Order wissen solltest — ohne Fachjargon.' },
  { cat: 'Investieren', page: 'ratgeber-depot-guide.html', title: 'Das richtige Depot für deinen ETF-Sparplan', teaser: 'Nicht jedes Depot, das einen Broker-Test gewinnt, passt auch für Sparpläne.' },
  { cat: 'Zahlen', page: 'ratgeber-girokonto-guide.html', title: 'Kostenloses Girokonto: Worauf es wirklich ankommt', teaser: '0 € Kontoführung ist nur die halbe Miete.' },
  { cat: 'Zahlen', page: 'ratgeber-kreditkarte-guide.html', title: 'Kostenlose Kreditkarte: Worauf du wirklich achten solltest', teaser: '0 € Jahresgebühr ist nur die halbe Miete.' },
  { cat: 'Zahlen', page: 'ratgeber-steuerprogramm-guide.html', title: 'Steuererklärung mit Software: Lohnt sich das?', teaser: 'ELSTER ist kostenlos — warum zahlen trotzdem so viele?' },
  { cat: 'Sparen', page: 'ratgeber-tagesgeld-vs-festgeld.html', title: 'Tagesgeld oder Festgeld: Was passt zu dir?', teaser: 'Der Unterschied in drei Minuten erklärt, mit Rechenbeispiel.' },
  { cat: 'Finanzieren', page: 'ratgeber-ratenkredit-vergleichen.html', title: 'Ratenkredit vergleichen: So findest du den günstigsten Zins', teaser: 'Effektiver Jahreszins statt Sollzins, mit Rechenbeispiel.' },
  { cat: 'Absichern', page: 'ratgeber-haftpflicht-basics.html', title: 'Private Haftpflicht: Was wirklich zählt', teaser: 'Deckungssumme, Ausschlüsse und worauf es beim Abschluss ankommt.' },
  { cat: 'Absichern', page: 'ratgeber-berufsunfaehigkeit-guide.html', title: 'Berufsunfähigkeitsversicherung: Brauchst du sie wirklich?', teaser: 'Warum die gesetzliche Absicherung oft nicht reicht.' },
  { cat: 'Vorsorge', page: 'ratgeber-altersvorsorgedepot.html', title: 'Das Altersvorsorgedepot: Was sich 2027 ändert', teaser: 'Die Riester-Rente wird abgelöst — was feststeht, was noch offen ist.' },
];

const catColors = (colors: Colors): Record<string, string> => ({
  Investieren: colors.primary,
  Zahlen: colors.slate,
  Sparen: colors.teal,
  Finanzieren: colors.accent,
  Absichern: colors.primaryDark,
  Vorsorge: colors.pal,
});

export default function RatgeberScreen() {
  const styles = useStyles();
  const colors = useColors();
  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}>
      <Text style={styles.intro}>Verständlich erklärt, ohne Fachjargon — damit du selbst gut entscheiden kannst.</Text>
      {ARTIKEL.map((a) => (
        <Pressable key={a.page} style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]} onPress={() => openSite(a.page)}>
          <View style={[styles.stripe, { backgroundColor: catColors(colors)[a.cat] ?? colors.primary }]} />
          <View style={{ flex: 1, padding: spacing.md }}>
            <Text style={[styles.cat, { color: catColors(colors)[a.cat] ?? colors.primary }]}>{a.cat}</Text>
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
