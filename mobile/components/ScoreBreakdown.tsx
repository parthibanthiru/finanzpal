import { Modal, Pressable, Text, View } from 'react-native';
import type { Score } from '@/lib/data';
import { useI18n } from '@/lib/i18n';
import { openSite } from '@/lib/site';
import { scoreRows } from '@/lib/scoreLabels';
import { bandColors, bandTextColor, fonts, makeStyles, radius, spacing, useColors } from './theme';

/**
 * Score breakdown sheet — the app version of the website's score popover
 * (assets/score-popover.js): total out of 100 with grade, one bar per factor, methodology link.
 */
export function ScoreBreakdown({
  visible, onClose, score, file, name,
}: {
  visible: boolean; onClose: () => void; score: Score; file: string; name: string;
}) {
  const styles = useStyles();
  const colors = useColors();
  const { t, lang } = useI18n();
  const c = bandColors(colors)[score.band] ?? colors.slate;
  const rows = scoreRows(file, score, lang);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={t.card.scoreClose} />
      <View style={styles.sheet} accessibilityViewIsModal>
        <View style={styles.handle} />
        <View style={styles.headRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker}>{t.card.scoreTitle}</Text>
            <Text style={styles.name} numberOfLines={2}>{name}</Text>
          </View>
          <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel={t.card.scoreClose}>
            <Text style={styles.close}>×</Text>
          </Pressable>
        </View>
        <View style={styles.total}>
          <Text style={[styles.totalValue, { color: c }]}>{Math.round(score.value)}</Text>
          <Text style={styles.of100}>{t.card.scoreOf100}</Text>
          <Text style={[styles.band, { backgroundColor: c, color: bandTextColor(colors, score.band) }]}>
            {t.card.scoreBand(score.band)}
          </Text>
        </View>
        {rows.map((r) => (
          <View key={r.key} style={styles.row} accessible accessibilityLabel={`${r.label}: ${Math.round(r.value)} ${t.card.scoreOf100}`}>
            <Text style={styles.label}>{r.label}</Text>
            <View style={styles.bar}>
              <View style={[styles.fill, { width: `${Math.max(0, Math.min(100, r.value))}%`, backgroundColor: c }]} />
            </View>
            <Text style={styles.value}>{Math.round(r.value)}</Text>
          </View>
        ))}
        <Text style={styles.each}>{t.card.scoreEach}</Text>
        <Pressable
          onPress={() => {
            onClose();
            openSite('ueber-uns.html#finanzpal-score');
          }}
          accessibilityRole="link"
        >
          <Text style={styles.link}>{t.card.scoreMethodology}</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const useStyles = makeStyles((colors) => ({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    backgroundColor: colors.card, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xl,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: spacing.md },
  headRow: { flexDirection: 'row', alignItems: 'flex-start' },
  kicker: { fontSize: 12, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.6 },
  name: { fontFamily: fonts.display, fontSize: 19, color: colors.text, marginTop: 2 },
  close: { fontSize: 28, lineHeight: 30, color: colors.muted, paddingLeft: spacing.md },
  total: { flexDirection: 'row', alignItems: 'baseline', marginVertical: spacing.md, gap: 6 },
  totalValue: { fontSize: 40, fontWeight: '800' },
  of100: { fontSize: 16, color: colors.muted },
  band: { marginLeft: spacing.sm, fontSize: 13, fontWeight: '800', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7 },
  label: { flex: 1.3, fontSize: 14, color: colors.text, paddingRight: spacing.sm },
  bar: { flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.rowAlt, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  value: { width: 34, textAlign: 'right', fontSize: 14, fontWeight: '700', color: colors.text },
  each: { fontSize: 12, color: colors.muted, marginTop: spacing.sm, lineHeight: 17 },
  link: { color: colors.primary, fontWeight: '700', fontSize: 15, marginTop: spacing.md },
}));
