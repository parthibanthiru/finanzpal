import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { fonts, makeStyles, radius, spacing, useColors } from './theme';
import { useI18n } from '@/lib/i18n';
import { formatNumber, parseNumber } from '@/lib/format';

/**
 * Number field with − / + steppers (no slider dependency needed).
 * Shows and reads numbers in the app language ("1.000,5" / "1,000.5"); a "€" unit sits
 * after the number in German and before it in English.
 */
export function NumberField({
  label, value, onChange, step, min, max, suffix, decimals = 0,
}: {
  label: string; value: number; onChange: (n: number) => void;
  step: number; min: number; max: number; suffix: string; decimals?: number;
}) {
  const styles = useStyles();
  const { t, lang } = useI18n();
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const round = (n: number) => Number(n.toFixed(decimals));
  const shown = formatNumber(value, decimals);
  const prefix = suffix === '€' && lang === 'en';
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Pressable style={styles.step} onPress={() => onChange(round(clamp(value - step)))} accessibilityLabel={t.calc.decrease(label)}>
          <Text style={styles.stepText}>−</Text>
        </Pressable>
        <View style={styles.inputWrap}>
          {prefix && <Text style={[styles.suffix, { marginRight: 4 }]}>€</Text>}
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            defaultValue={shown}
            key={`${lang}:${shown}` /* re-sync after stepper taps or a language change */}
            onEndEditing={(e) => {
              const n = parseNumber(e.nativeEvent.text);
              onChange(Number.isFinite(n) ? round(clamp(n)) : value);
            }}
            selectTextOnFocus
            accessibilityLabel={label}
          />
          {!prefix && <Text style={styles.suffix}>{suffix}</Text>}
        </View>
        <Pressable style={styles.step} onPress={() => onChange(round(clamp(value + step)))} accessibilityLabel={t.calc.increase(label)}>
          <Text style={styles.stepText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function ResultTile({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  const styles = useStyles();
  const colors = useColors();
  return (
    <View style={[styles.tile, strong && { backgroundColor: colors.ink, borderColor: colors.ink }]}>
      <Text style={[styles.tileLabel, strong && { color: colors.inkMuted }]}>{label}</Text>
      <Text style={[styles.tileValue, strong && { color: '#fff' }]}>{value}</Text>
    </View>
  );
}

/** Stacked bar chart: bottom segment + top segment per bar (like the website's bar-chart). */
export function BarChart({
  bars, bottomLabel, topLabel, extraLegend,
}: {
  bars: { key: string; bottom: number; top: number; label: string; bottomColor?: string }[];
  bottomLabel: string; topLabel: string;
  extraLegend?: { label: string; color: string };
}) {
  const styles = useStyles();
  const colors = useColors();
  const max = Math.max(1, ...bars.map((b) => b.bottom + b.top));
  return (
    <View>
      <View style={styles.chart}>
        {bars.map((b) => (
          <View key={b.key} style={styles.barCol}>
            <View style={{ height: `${(b.top / max) * 100}%`, backgroundColor: colors.smile, borderTopLeftRadius: 3, borderTopRightRadius: 3 }} />
            <View style={{ height: `${Math.max(1, (b.bottom / max) * 100)}%`, backgroundColor: b.bottomColor ?? colors.primary }} />
          </View>
        ))}
      </View>
      <View style={styles.axis}>
        <Text style={styles.axisText}>{bars[0]?.label}</Text>
        <Text style={styles.axisText}>{bars[bars.length - 1]?.label}</Text>
      </View>
      <View style={styles.legend}>
        <View style={[styles.dot, { backgroundColor: colors.primary }]} />
        <Text style={styles.legendText}>{bottomLabel}</Text>
        <View style={[styles.dot, { backgroundColor: colors.smile, marginLeft: spacing.md }]} />
        <Text style={styles.legendText}>{topLabel}</Text>
        {extraLegend && (
          <>
            <View style={[styles.dot, { backgroundColor: extraLegend.color, marginLeft: spacing.md }]} />
            <Text style={styles.legendText}>{extraLegend.label}</Text>
          </>
        )}
      </View>
    </View>
  );
}

/** Single choice between a few options (e.g. Kirchensteuer). */
export function ChoiceField<T extends string | number>({
  label, value, options, onChange,
}: {
  label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void;
}) {
  const colors = useColors();
  const styles = useStyles();
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.choices}>
        {options.map((o) => {
          const on = o.value === value;
          return (
            <Pressable
              key={String(o.value)}
              onPress={() => onChange(o.value)}
              style={[styles.choice, on && styles.choiceOn]}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
            >
              <Text style={[styles.choiceText, on && { color: colors.onPrimary }]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function SwitchField({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  const styles = useStyles();
  const colors = useColors();
  return (
    <View style={[styles.field, styles.switchRow]}>
      <Text style={[styles.label, { flex: 1, marginBottom: 0, fontWeight: '500' }]}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary, false: colors.border }} />
    </View>
  );
}

/** Label/value line for breakdown tables (e.g. Abgaben-Aufschlüsselung). */
export function BreakdownRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  const styles = useStyles();
  const colors = useColors();
  return (
    <View style={[styles.bRow, strong && styles.bRowStrong]}>
      <Text style={[styles.bLabel, strong && { fontWeight: '700', color: colors.text }]}>{label}</Text>
      <Text style={[styles.bValue, strong && { fontWeight: '800' }]}>{value}</Text>
    </View>
  );
}

export const useCalcStyles = makeStyles((colors) => ({
  intro: { fontSize: 15, color: colors.muted, lineHeight: 21, marginBottom: spacing.lg },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginVertical: spacing.md },
  section: { fontFamily: fonts.display, fontSize: 20, color: colors.text, marginTop: spacing.md, marginBottom: spacing.sm },
  disclaimer: { fontSize: 12, color: colors.muted, lineHeight: 17, marginTop: spacing.lg },
}));

const useStyles = makeStyles((colors) => ({
  field: { marginBottom: spacing.md },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center' },
  step: { width: 44, height: 44, borderRadius: radius.sm, backgroundColor: colors.tag, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontSize: 22, color: colors.primaryDark, fontWeight: '600' },
  inputWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.sm,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.md,
  },
  input: { flex: 1, fontSize: 17, paddingVertical: 10, color: colors.text, fontWeight: '600' },
  suffix: { color: colors.muted, fontSize: 15 },
  tile: { flexGrow: 1, flexBasis: '45%', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md },
  tileLabel: { fontSize: 12, color: colors.muted },
  tileValue: { fontFamily: fonts.display, fontSize: 22, color: colors.text, marginTop: 2 },
  chart: { height: 160, flexDirection: 'row', alignItems: 'flex-end', gap: 3, borderBottomWidth: 1, borderBottomColor: colors.border },
  barCol: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  axis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  axisText: { fontSize: 11, color: colors.muted },
  legend: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  dot: { width: 10, height: 10, borderRadius: 2, marginRight: 6 },
  legendText: { fontSize: 12, color: colors.muted },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  choice: { borderWidth: 1, borderColor: colors.primary, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: colors.card },
  choiceOn: { backgroundColor: colors.primary },
  choiceText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  bRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  bRowStrong: { borderBottomWidth: 0, borderTopWidth: 2, borderTopColor: colors.text, marginTop: 2 },
  bLabel: { color: colors.muted, fontSize: 14, flex: 1, paddingRight: spacing.sm },
  bValue: { color: colors.text, fontSize: 14, fontWeight: '600' },
}));
