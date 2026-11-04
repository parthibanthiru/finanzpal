import { useState } from 'react';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Item, Score } from '@/lib/data';
import { ScoreBreakdown } from './ScoreBreakdown';
import type { Field } from '@/lib/categories';
import { isRealLink, openSite } from '@/lib/site';
import { getLang, useT } from '@/lib/i18n';
import { toFive } from '@/lib/scoreLabels';
import { ProviderMark } from './ProviderMark';
import { bandColors, fonts, makeStyles, radius, spacing, useColors } from './theme';

/**
 * Finanzpal-Score badge — the website's medallion (design "Option 10"): gradient disc in
 * navy -> band colour, white progress ring (fill = score/100), score out of 5 in the centre,
 * "Note A" underneath. Tapping it opens the breakdown sheet (like the website's score popover).
 * `file` = data file of the comparison (picks the factor labels), `name` = provider name.
 */
const DISC = 56;
const RING_R = 24;
const RING_C = 2 * Math.PI * RING_R;
export function ScoreBadge({ score, file, name }: { score: Score; file: string; name: string }) {
  const t = useT();
  const styles = useStyles();
  const colors = useColors();
  const [open, setOpen] = useState(false);
  const { value, band } = score;
  const c = bandColors(colors)[band] ?? colors.slate;
  const five = toFive(value);
  const gradId = `fpScoreGrad${band}`; // one gradient per band: ids are global on web
  const pct = Math.max(0, Math.min(100, value)) / 100;
  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={t.card.scoreA11y(five, band)}
        accessibilityHint={t.card.scoreShow}
        style={styles.score}
        hitSlop={6}
      >
        <Svg width={DISC} height={DISC} viewBox={`0 0 ${DISC} ${DISC}`}>
          <Defs>
            <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#0F2A3D" />
              <Stop offset="1" stopColor={c} />
            </LinearGradient>
          </Defs>
          <Circle cx={DISC / 2} cy={DISC / 2} r={DISC / 2} fill={`url(#${gradId})`} />
          <Circle cx={DISC / 2} cy={DISC / 2} r={RING_R} stroke="rgba(255,255,255,0.2)" strokeWidth={3.5} fill="none" />
          <Circle
            cx={DISC / 2} cy={DISC / 2} r={RING_R} stroke="#fff" strokeWidth={3.5} fill="none" strokeLinecap="round"
            strokeDasharray={`${RING_C}`} strokeDashoffset={RING_C * (1 - pct)}
            transform={`rotate(-90 ${DISC / 2} ${DISC / 2})`}
          />
        </Svg>
        <View style={styles.scoreCenter} pointerEvents="none">
          <Text style={styles.scoreValue}>{five}</Text>
          <Text style={styles.scoreBand}>{t.card.scoreBand(band)}</Text>
        </View>
      </Pressable>
      <ScoreBreakdown visible={open} onClose={() => setOpen(false)} score={score} file={file} name={name} />
    </>
  );
}

/** Heart toggle for the Merkliste. */
export function FavoriteButton({ active, onPress }: { active: boolean; onPress: () => void }) {
  const t = useT();
  const styles = useStyles();
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={styles.fav}
      accessibilityRole="button"
      accessibilityLabel={active ? t.card.favRemove : t.card.favAdd}
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.favIcon, active && { color: colors.danger }]}>{active ? '♥' : '♡'}</Text>
    </Pressable>
  );
}

export function ProviderCard({
  item, file, fields, highlight, match, favorite, onToggleFavorite,
}: {
  item: Item; file: string; fields: Field[]; highlight?: string; match?: string; favorite?: boolean; onToggleFavorite?: () => void;
}) {
  const t = useT();
  const styles = useStyles();
  const colors = useColors();
  const hasLink = isRealLink(item.affiliateUrl);
  const ratingText = item.rating != null ? (getLang() === 'en' ? String(item.rating) : String(item.rating).replace('.', ',')) : '';
  return (
    <View style={[styles.card, item.recommended && styles.cardRecommended, highlight && styles.cardHighlight]}>
      <View style={styles.badges}>
        {highlight ? <Text style={[styles.recommended, styles.highlightBadge]}>{highlight}</Text> : null}
        {item.recommended && <Text style={styles.recommended}>{t.card.recommended}</Text>}
        {match ? <Text style={[styles.recommended, styles.matchBadge]}>{match}</Text> : null}
      </View>

      <View style={styles.head}>
        <ProviderMark logo={item.logo} initials={item.initials} color={item.color} name={item.name} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          {item.anbieter ? <Text style={styles.anbieter}>{item.anbieter}</Text> : null}
          {item.rating != null && (
            <Text style={styles.rating} accessibilityLabel={t.card.ratingA11y(ratingText)}>
              <Text style={{ color: colors.accent }}>{item.ratingStars ?? '★'}</Text> {ratingText}
            </Text>
          )}
        </View>
        {item.score && <ScoreBadge score={item.score} file={file} name={item.name} />}
        {onToggleFavorite && <FavoriteButton active={!!favorite} onPress={onToggleFavorite} />}
      </View>

      {fields.map((f) => (
        <View key={f.label} style={styles.row}>
          <Text style={styles.label}>{f.label}</Text>
          <View style={{ flex: 1.4 }}>
            <Text style={styles.value}>{f.value}</Text>
            {f.note ? <Text style={styles.note}>ⓘ {f.note}</Text> : null}
          </View>
        </View>
      ))}

      <View style={styles.actions}>
        {item.detailUrl ? (
          <Pressable style={styles.secondaryBtn} onPress={() => openSite(item.detailUrl)}>
            <Text style={styles.secondaryText}>{t.card.details}</Text>
          </Pressable>
        ) : null}
        {hasLink && (
          <Pressable style={styles.primaryBtn} onPress={() => Linking.openURL(item.affiliateUrl!)}>
            <Text style={styles.primaryText}>{t.card.toProvider}</Text>
          </Pressable>
        )}
      </View>
      {hasLink && <Text style={styles.ad}>{t.card.ad}</Text>}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardRecommended: { borderColor: colors.primary, borderWidth: 2 },
  cardHighlight: { borderColor: colors.smile, borderWidth: 3 },
  fav: { marginLeft: spacing.sm, paddingHorizontal: 4 },
  favIcon: { fontSize: 24, color: colors.muted, lineHeight: 28 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  highlightBadge: { backgroundColor: colors.ink, color: colors.smile },
  matchBadge: { backgroundColor: colors.primary, color: colors.onPrimary },
  recommended: {
    alignSelf: 'flex-start',
    backgroundColor: colors.tag,
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  name: { fontFamily: fonts.display, fontSize: 18, color: colors.text, fontWeight: '600' },
  anbieter: { fontSize: 12, color: colors.muted },
  rating: { fontSize: 13, color: colors.muted, marginTop: 2 },
  score: { width: DISC, height: DISC, marginLeft: spacing.sm },
  scoreCenter: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  scoreValue: { fontFamily: fonts.display, fontWeight: '700', fontSize: 17, lineHeight: 19, color: '#fff' },
  scoreBand: { fontSize: 7, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)', marginTop: 1 },
  row: { flexDirection: 'row', paddingVertical: 7, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  label: { flex: 1, color: colors.muted, fontSize: 13, paddingRight: spacing.sm },
  value: { color: colors.text, fontSize: 14, fontWeight: '500' },
  note: { color: colors.muted, fontSize: 12, marginTop: 3, lineHeight: 16 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.sm },
  primaryBtn: { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 16, borderRadius: radius.sm },
  primaryText: { color: colors.onPrimary, fontWeight: '700' },
  secondaryBtn: { borderWidth: 1, borderColor: colors.primary, paddingVertical: 9, paddingHorizontal: 16, borderRadius: radius.sm },
  secondaryText: { color: colors.primary, fontWeight: '700' },
  ad: { textAlign: 'right', fontSize: 11, color: colors.muted, marginTop: 4 },
}));
