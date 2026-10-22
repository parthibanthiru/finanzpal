import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthProvider';
import { CATEGORIES, GROUPS } from '@/lib/categories';
import { getBundled } from '@/lib/data';
import { Answers, CATEGORY_KEYS, CATEGORY_META, QUESTIONS, loadAnswers, topPick } from '@/lib/finanzCheck';
import { colors, fonts, radius, spacing } from '@/components/theme';

/** Finanz-Check entry point; shows the saved picks once the quiz is done. */
function FinanzCheckCard() {
  const { user } = useAuth();
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers | null>(null);

  // Reload whenever the tab comes back into view (e.g. right after finishing the quiz).
  useFocusEffect(
    useCallback(() => {
      loadAnswers(user?.id ?? 'anon').then(setAnswers);
    }, [user?.id])
  );

  if (!answers) {
    return (
      <Pressable style={({ pressed }) => [styles.fc, pressed && { opacity: 0.9 }]} onPress={() => router.push('/vergleiche/finanz-check')}>
        <Text style={styles.fcKicker}>Finanz-Check</Text>
        <Text style={styles.fcTitle}>Welches Konto, Depot und welche Karte passen zu dir?</Text>
        <Text style={styles.fcSub}>{QUESTIONS.length} kurze Fragen · eine Empfehlung pro Kategorie</Text>
        <View style={styles.fcBtn}>
          <Text style={styles.fcBtnText}>Jetzt starten ›</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={styles.fc}>
      <Text style={styles.fcKicker}>Deine Empfehlungen</Text>
      {CATEGORY_KEYS.map((cat) => {
        const meta = CATEGORY_META[cat];
        const item = topPick(cat, answers, getBundled(meta.file).items);
        if (!item) return null;
        return (
          <Pressable
            key={cat}
            style={styles.pickRow}
            onPress={() => router.push({ pathname: '/vergleiche/[id]', params: { id: meta.routeId, focus: item.id } })}
          >
            <Text style={styles.pickCat}>{meta.title}</Text>
            <Text style={styles.pickName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.pickChevron}>›</Text>
          </Pressable>
        );
      })}
      <View style={styles.fcLinks}>
        <Pressable onPress={() => router.push({ pathname: '/vergleiche/finanz-check', params: { show: 'result' } })}>
          <Text style={styles.fcLink}>Details ansehen</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/vergleiche/finanz-check')}>
          <Text style={styles.fcLink}>Neu starten</Text>
        </Pressable>
      </View>
    </View>
  );
}

// Home of the app: the same comparison categories as the website nav.
export default function VergleicheScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}>
      <Text style={styles.hero}>Finanzen vergleichen — unabhängig und transparent.</Text>
      <Text style={styles.heroSub}>
        Echte Konditionen, transparenter Finanzpal-Score, keine versteckte Bevorzugung von Partnern.
      </Text>

      <FinanzCheckCard />

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
  fc: { backgroundColor: colors.ink, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg },
  fcKicker: { color: colors.smile, fontWeight: '700', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: spacing.sm },
  fcTitle: { fontFamily: fonts.display, color: '#fff', fontSize: 20, lineHeight: 26 },
  fcSub: { color: '#C9D6E2', fontSize: 13, marginTop: spacing.xs },
  fcBtn: { alignSelf: 'flex-start', backgroundColor: colors.smile, borderRadius: radius.sm, paddingVertical: 9, paddingHorizontal: 14, marginTop: spacing.md },
  fcBtnText: { color: colors.ink, fontWeight: '800' },
  pickRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#2C4A60' },
  pickCat: { color: '#C9D6E2', fontSize: 13, width: 92 },
  pickName: { flex: 1, color: '#fff', fontSize: 15, fontWeight: '600' },
  pickChevron: { color: '#C9D6E2', fontSize: 20, marginLeft: spacing.sm },
  fcLinks: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm },
  fcLink: { color: colors.smile, fontWeight: '700', fontSize: 14 },
});
