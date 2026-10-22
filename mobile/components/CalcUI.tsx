import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fonts, radius, spacing } from './theme';

/** Number field with − / + steppers (no slider dependency needed). */
export function NumberField({
  label, value, onChange, step, min, max, suffix, decimals = 0,
}: {
  label: string; value: number; onChange: (n: number) => void;
  step: number; min: number; max: number; suffix: string; decimals?: number;
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const round = (n: number) => Number(n.toFixed(decimals));
  const shown = value.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Pressable style={styles.step} onPress={() => onChange(round(clamp(value - step)))} accessibilityLabel={`${label} verringern`}>
          <Text style={styles.stepText}>−</Text>
        </Pressable>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            defaultValue={shown}
            key={shown /* re-sync after stepper taps */}
            onEndEditing={(e) => {
              const n = Number(e.nativeEvent.text.replace(/\./g, '').replace(',', '.'));
              onChange(Number.isFinite(n) ? round(clamp(n)) : value);
            }}
            selectTextOnFocus
            accessibilityLabel={label}
          />
          <Text style={styles.suffix}>{suffix}</Text>
        </View>
        <Pressable style={styles.step} onPress={() => onChange(round(clamp(value + step)))} accessibilityLabel={`${label} erhöhen`}>
          <Text style={styles.stepText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function ResultTile({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={[styles.tile, strong && { backgroundColor: colors.ink, borderColor: colors.ink }]}>
      <Text style={[styles.tileLabel, strong && { color: '#C9D6E2' }]}>{label}</Text>
      <Text style={[styles.tileValue, strong && { color: '#fff' }]}>{value}</Text>
    </View>
  );
}

/** Stacked bar chart: bottom segment + top segment per bar (like the website's bar-chart). */
export function BarChart({
  bars, bottomLabel, topLabel,
}: {
  bars: { key: string; bottom: number; top: number; label: string }[];
  bottomLabel: string; topLabel: string;
}) {
  const max = Math.max(1, ...bars.map((b) => b.bottom + b.top));
  return (
    <View>
      <View style={styles.chart}>
        {bars.map((b) => (
          <View key={b.key} style={styles.barCol}>
            <View style={{ height: `${(b.top / max) * 100}%`, backgroundColor: colors.smile, borderTopLeftRadius: 3, borderTopRightRadius: 3 }} />
            <View style={{ height: `${Math.max(1, (b.bottom / max) * 100)}%`, backgroundColor: colors.primary }} />
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
      </View>
    </View>
  );
}

export const calcStyles = StyleSheet.create({
  intro: { fontSize: 15, color: colors.muted, lineHeight: 21, marginBottom: spacing.lg },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginVertical: spacing.md },
  section: { fontFamily: fonts.display, fontSize: 20, color: colors.text, marginTop: spacing.md, marginBottom: spacing.sm },
  disclaimer: { fontSize: 12, color: colors.muted, lineHeight: 17, marginTop: spacing.lg },
});

const styles = StyleSheet.create({
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
});
