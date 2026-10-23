import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Item, Score } from '@/lib/data';
import { ScoreBreakdown } from './ScoreBreakdown';
import type { Field } from '@/lib/categories';
import { isRealLink, openSite } from '@/lib/site';
import { getLang, useT } from '@/lib/i18n';
import { bandColors, bandTextColor, fonts, makeStyles, radius, spacing, useColors } from './theme';

/**
 * Finanzpal-Score badge: same signal as the website's ring badge (0–100 + band A–D).
 * Tapping it opens the breakdown sheet (like the website's score popover).
 * `file` = data file of the comparison (picks the factor labels), `name` = provider name.
 */
export function ScoreBadge({ score, file, name }: { score: Score; file: string; name: string }) {
  const t = useT();
  const styles = useStyles();
  const colors = useColors();
  const [open, setOpen] = useState(false);
  const { value, band } = score;
  const c = bandColors(colors)[band] ?? colors.slate;
  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={t.card.scoreA11y(Math.round(value), band)}
        accessibilityHint={t.card.scoreShow}
        style={[styles.score, { borderColor: c }]}
        hitSlop={6}
      >
        <Text style={[styles.scoreValue, { color: c }]}>{Math.round(value)}</Text>
        <Text style={[styles.scoreBand, { backgroundColor: c, color: bandTextColor(colors, band) }]}>{band}</Text>
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
  item, file, fields, highlight, favorite, onToggleFavorite,
}: {
  item: Item; file: string; fields: Field[]; highlight?: string; favorite?: boolean; onToggleFavorite?: () => void;
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
      </View>

      <View style={styles.head}>
        <View style={[styles.avatar, { backgroundColor: item.color ?? colors.ink }]}>
          <Text style={styles.avatarText} numberOfLines={1} adjustsFontSizeToFit>
            {item.initials ?? item.name.slice(0, 2).toUpperCase()}
          </Text>
        </View>
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
  avatar: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md, paddingHorizontal: 3 },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  name: { fontFamily: fonts.display, fontSize: 18, color: colors.text, fontWeight: '600' },
  anbieter: { fontSize: 12, color: colors.muted },
  rating: { fontSize: 13, color: colors.muted, marginTop: 2 },
  score: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderRadius: 999, paddingLeft: 9, paddingRight: 3, paddingVertical: 3, marginLeft: spacing.sm },
  scoreValue: { fontWeight: '800', fontSize: 15, marginRight: 5 },
  scoreBand: { color: colors.onPrimary, fontWeight: '800', fontSize: 12, width: 20, height: 20, borderRadius: 10, textAlign: 'center', lineHeight: 20, overflow: 'hidden' },
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
