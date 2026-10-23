import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthProvider';
import { useFavorites } from '@/context/FavoritesProvider';
import { CATEGORIES, GROUPS } from '@/lib/categories';
import { useI18n } from '@/lib/i18n';
import { getBundled } from '@/lib/data';
import { Answers, CATEGORY_KEYS, CATEGORY_META, QUESTIONS, loadAnswers, topPick } from '@/lib/finanzCheck';
import { fonts, makeStyles, radius, spacing, useColors } from '@/components/theme';

/** Finanz-Check entry point; shows the saved picks once the quiz is done. */
function FinanzCheckCard() {
  const { t, lang } = useI18n();
  const styles = useStyles();
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
        <Text style={styles.fcKicker}>{t.home.fcKicker}</Text>
        <Text style={styles.fcTitle}>{t.home.fcTitle}</Text>
        <Text style={styles.fcSub}>{t.home.fcSub(QUESTIONS.length)}</Text>
        <View style={styles.fcBtn}>
          <Text style={styles.fcBtnText}>{t.home.fcStart}</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={styles.fc}>
      <Text style={styles.fcKicker}>{t.home.fcPicks}</Text>
      {CATEGORY_KEYS.map((cat) => {
        const meta = CATEGORY_META[cat];
        const item = topPick(cat, answers, getBundled(meta.file, lang).items);
        if (!item) return null;
        return (
          <Pressable
            key={cat}
            style={styles.pickRow}
            onPress={() => router.push({ pathname: '/vergleiche/[id]', params: { id: meta.routeId, focus: item.id } })}
          >
            <Text style={styles.pickCat}>{t.check.categories[cat]}</Text>
            <Text style={styles.pickName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.pickChevron}>›</Text>
          </Pressable>
        );
      })}
      <View style={styles.fcLinks}>
        <Pressable onPress={() => router.push({ pathname: '/vergleiche/finanz-check', params: { show: 'result' } })}>
          <Text style={styles.fcLink}>{t.home.fcDetails}</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/vergleiche/finanz-check')}>
          <Text style={styles.fcLink}>{t.home.fcRestart}</Text>
        </Pressable>
      </View>
    </View>
  );
}

/** Entry to the Merkliste; shows how many providers are saved. */
function MerklisteRow() {
  const { t } = useI18n();
  const styles = useStyles();
  const colors = useColors();
  const router = useRouter();
  const { favorites } = useFavorites();
  const n = favorites.length;
  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]} onPress={() => router.push('/vergleiche/merkliste')}>
      <Text style={[styles.icon, { color: n ? colors.danger : colors.muted }]}>{n ? '♥' : '♡'}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{t.home.favTitle}</Text>
        <Text style={styles.sub}>{n ? t.home.favCount(n) : t.home.favEmpty}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

// Home of the app: the same comparison categories as the website nav.
export default function VergleicheScreen() {
  const { t, lang } = useI18n();
  const styles = useStyles();
  return (
    <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}>
      <Text style={styles.hero}>{t.home.hero}</Text>
      <Text style={styles.heroSub}>{t.home.heroSub}</Text>

      <FinanzCheckCard />
      <View style={{ marginBottom: spacing.lg }}>
        <MerklisteRow />
      </View>

      {GROUPS.map((group) => {
        const cats = CATEGORIES.filter((c) => c.group === group);
        return (
          <View key={group} style={{ marginBottom: spacing.lg }}>
            <Text style={styles.group}>{t.groups[group]}</Text>
            {cats.map((c) => {
              const count = getBundled(c.file, lang).items.length;
              return (
                <Link key={c.id} href={{ pathname: '/vergleiche/[id]', params: { id: c.id } }} asChild>
                  <Pressable style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
                    <Text style={styles.icon}>{c.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.title}>{t.categories[c.id].title}</Text>
                      <Text style={styles.sub}>
                        {t.categories[c.id].subtitle} · {t.common.providers(count)}
                      </Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </Pressable>
                </Link>
              );
            })}
            {group === 'Broker' && (
              // ETF-Suche sits in the website's Broker menu too
              <Link href="/vergleiche/etf" asChild>
                <Pressable style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
                  <Text style={styles.icon}>🔎</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{t.etf.title}</Text>
                    <Text style={styles.sub}>{t.etf.homeSub(getBundled('etf', lang).items.length)}</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </Pressable>
              </Link>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const useStyles = makeStyles((colors) => ({
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
  fcSub: { color: colors.inkMuted, fontSize: 13, marginTop: spacing.xs },
  fcBtn: { alignSelf: 'flex-start', backgroundColor: colors.smile, borderRadius: radius.sm, paddingVertical: 9, paddingHorizontal: 14, marginTop: spacing.md },
  fcBtnText: { color: colors.ink, fontWeight: '800' },
  pickRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.inkLine },
  pickCat: { color: colors.inkMuted, fontSize: 13, width: 92 },
  pickName: { flex: 1, color: '#fff', fontSize: 15, fontWeight: '600' },
  pickChevron: { color: colors.inkMuted, fontSize: 20, marginLeft: spacing.sm },
  fcLinks: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm },
  fcLink: { color: colors.smile, fontWeight: '700', fontSize: 14 },
}));
