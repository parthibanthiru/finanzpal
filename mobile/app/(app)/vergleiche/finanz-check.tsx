import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthProvider';
import { loadData, type Item } from '@/lib/data';
import {
  Answers, CATEGORY_KEYS, CATEGORY_META, QUESTIONS, factRows, label, loadAnswers, saveAnswers, topPick,
} from '@/lib/finanzCheck';
import { useI18n } from '@/lib/i18n';
import { isRealLink } from '@/lib/site';
import { ScoreBadge } from '@/components/ProviderCard';
import { fonts, makeStyles, radius, spacing, useColors } from '@/components/theme';

type Pick = { cat: string; item: Item };

export default function FinanzCheckScreen() {
  const styles = useStyles();
  const colors = useColors();
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const userId = user?.id ?? 'anon';
  const router = useRouter();
  const params = useLocalSearchParams<{ show?: string }>();

  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<Pick[] | null>(null);
  const [loading, setLoading] = useState(params.show === 'result');

  const done = step >= QUESTIONS.length;

  // Opened from the home screen's "Deine Empfehlungen": jump straight to the saved result.
  useEffect(() => {
    if (params.show !== 'result') return;
    loadAnswers(userId).then((saved) => {
      if (saved) {
        setAnswers(saved);
        setStep(QUESTIONS.length);
      }
      setLoading(false);
    });
  }, [params.show, userId]);

  // Compute the result from the same data files the comparisons use.
  useEffect(() => {
    if (!done) return;
    let cancelled = false;
    Promise.all(CATEGORY_KEYS.map((cat) => loadData(CATEGORY_META[cat].file, lang))).then((datasets) => {
      if (cancelled) return;
      const result: Pick[] = [];
      CATEGORY_KEYS.forEach((cat, i) => {
        const item = topPick(cat, answers, datasets[i].items);
        if (item) result.push({ cat, item });
      });
      setPicks(result);
    });
    return () => {
      cancelled = true;
    };
  }, [done, answers, lang]);

  function choose(qid: string, oid: string) {
    const next = { ...answers, [qid]: oid };
    setAnswers(next);
    setStep(step + 1);
    if (step + 1 >= QUESTIONS.length) saveAnswers(userId, next);
  }

  function restart() {
    setAnswers({});
    setPicks(null);
    setStep(0);
  }

  if (loading) return <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.primary} />;

  const progress = Math.min(1, step / QUESTIONS.length);

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>

      {!done ? (
        <View>
          <Text style={styles.stepLabel}>{t.check.step(step + 1, QUESTIONS.length)}</Text>
          <Text style={styles.question}>{label(QUESTIONS[step].text, lang)}</Text>
          {QUESTIONS[step].options.map((o) => {
            const selected = answers[QUESTIONS[step].id] === o.id;
            return (
              <Pressable
                key={o.id}
                onPress={() => choose(QUESTIONS[step].id, o.id)}
                style={({ pressed }) => [styles.option, selected && styles.optionSelected, pressed && { opacity: 0.85 }]}
                accessibilityRole="button"
              >
                <Text style={[styles.optionText, selected && { color: colors.primaryDark }]}>{label(o.label, lang)}</Text>
              </Pressable>
            );
          })}
          {step > 0 && (
            <Pressable onPress={() => setStep(step - 1)} style={{ marginTop: spacing.md }}>
              <Text style={styles.link}>{t.check.back}</Text>
            </Pressable>
          )}
        </View>
      ) : !picks ? (
        <Text style={styles.lede}>{t.check.loading}</Text>
      ) : (
        <View>
          <Text style={styles.question}>{t.check.resultTitle}</Text>
          <Text style={styles.lede}>{t.check.resultLede}</Text>
          {picks.map(({ cat, item }) => (
            <View key={cat} style={styles.card}>
              <Text style={styles.catLabel}>{t.check.categories[cat]}</Text>
              <View style={styles.head}>
                <View style={[styles.avatar, { backgroundColor: item.color ?? colors.primaryDark }]}>
                  <Text style={styles.avatarText} numberOfLines={1} adjustsFontSizeToFit>
                    {item.initials}
                  </Text>
                </View>
                <Text style={styles.name}>{item.name}</Text>
                {item.score && <ScoreBadge value={item.score.value} band={item.score.band} />}
              </View>
              {factRows(cat, item, t).map(([k, v]) => (
                <View key={k} style={styles.row}>
                  <Text style={styles.k}>{k}</Text>
                  <Text style={styles.v}>{v}</Text>
                </View>
              ))}
              <View style={styles.actions}>
                <Pressable
                  onPress={() =>
                    router.push({ pathname: '/vergleiche/[id]', params: { id: CATEGORY_META[cat].routeId, focus: item.id } })
                  }
                >
                  <Text style={styles.link}>{t.check.seeAll}</Text>
                </Pressable>
                {isRealLink(item.affiliateUrl) && (
                  <Pressable style={styles.cta} onPress={() => Linking.openURL(item.affiliateUrl!)}>
                    <Text style={styles.ctaText}>{t.check.cta}</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))}
          <Pressable style={styles.restart} onPress={restart}>
            <Text style={styles.restartText}>{t.check.restart}</Text>
          </Pressable>
          <Text style={styles.note}>{t.check.note}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const useStyles = makeStyles((colors) => ({
  track: { height: 6, backgroundColor: colors.rowAlt, borderRadius: 3, overflow: 'hidden', marginBottom: spacing.lg },
  fill: { height: 6, backgroundColor: colors.primary, borderRadius: 3 },
  stepLabel: { color: colors.muted, fontSize: 13, fontWeight: '600', marginBottom: spacing.sm },
  question: { fontFamily: fonts.display, fontSize: 23, lineHeight: 30, color: colors.text, marginBottom: spacing.lg },
  option: {
    backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md,
    paddingVertical: 16, paddingHorizontal: spacing.md, marginBottom: spacing.sm,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.tag },
  optionText: { fontSize: 16, color: colors.text, fontWeight: '500' },
  link: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  lede: { color: colors.muted, fontSize: 15, lineHeight: 21, marginBottom: spacing.lg, marginTop: -spacing.sm },
  card: {
    backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, marginBottom: spacing.md,
  },
  catLabel: { fontSize: 12, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: spacing.sm },
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  avatar: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md, paddingHorizontal: 3 },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  name: { flex: 1, fontFamily: fonts.display, fontSize: 18, color: colors.text },
  row: { flexDirection: 'row', paddingVertical: 6, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  k: { flex: 1, color: colors.muted, fontSize: 13 },
  v: { flex: 1.3, color: colors.text, fontSize: 14, fontWeight: '500' },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
  cta: { backgroundColor: colors.primary, paddingVertical: 9, paddingHorizontal: 14, borderRadius: radius.sm },
  ctaText: { color: colors.onPrimary, fontWeight: '700' },
  restart: { borderWidth: 1, borderColor: colors.primary, borderRadius: radius.md, paddingVertical: 12, alignItems: 'center', marginTop: spacing.sm },
  restartText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  note: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: spacing.md },
}));
