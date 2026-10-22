import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { CATEGORIES, GROUPS } from '@/lib/categories';
import { getBundled } from '@/lib/data';
import { colors, fonts, radius, spacing } from '@/components/theme';

// Home of the app: the same comparison categories as the website nav.
export default function VergleicheScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}>
      <Text style={styles.hero}>Finanzen vergleichen — unabhängig und transparent.</Text>
      <Text style={styles.heroSub}>
        Echte Konditionen, transparenter Finanzpal-Score, keine versteckte Bevorzugung von Partnern.
      </Text>

      {GROUPS.map((group) => {
        const cats = CATEGORIES.filter((c) => c.group === group);
        return (
          <View key={group} style={{ marginBottom: spacing.lg }}>
            <Text style={styles.group}>{group}</Text>
            {cats.map((c) => {
              const count = getBundled(c.file).items.length;
              return (
                <Link key={c.id} href={{ pathname: '/vergleiche/[id]', params: { id: c.id } }} asChild>
                  <Pressable style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
                    <Text style={styles.icon}>{c.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.title}>{c.title}</Text>
                      <Text style={styles.sub}>
                        {c.subtitle} · {count} Anbieter
                      </Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </Pressable>
                </Link>
              );
            })}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { fontFamily: fonts.display, fontSize: 26, lineHeight: 32, color: colors.text, fontWeight: '500', marginTop: spacing.sm },
  heroSub: { fontSize: 15, color: colors.muted, lineHeight: 21, marginTop: spacing.sm, marginBottom: spacing.lg },
  group: { fontSize: 13, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  icon: { fontSize: 24, marginRight: spacing.md },
  title: { fontFamily: fonts.display, fontSize: 18, color: colors.text, fontWeight: '500' },
  sub: { fontSize: 13, color: colors.muted, marginTop: 2 },
  chevron: { fontSize: 24, color: colors.muted, marginLeft: spacing.sm },
});
