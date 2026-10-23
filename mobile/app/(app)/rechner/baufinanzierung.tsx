import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { calcBaufi, estimateFullPayoffYears } from '@/lib/calc';
import { disclosure } from '@/lib/disclosures';
import { useT } from '@/lib/i18n';
import { formatEUR } from '@/lib/format';
import { BarChart, NumberField, ResultTile, useCalcStyles } from '@/components/CalcUI';
import { spacing, useColors } from '@/components/theme';

// Defaults and ranges = the sliders on baufinanzierungsrechner.html.
export default function BaufinanzierungScreen() {
  const calcStyles = useCalcStyles();
  const t = useT();
  const L = t.calc.baufi;
  const colors = useColors();
  const router = useRouter();
  const [darlehen, setDarlehen] = useState(300000);
  const [zins, setZins] = useState(3.5);
  const [tilgung, setTilgung] = useState(2);
  const [zinsbindung, setZinsbindung] = useState(15);

  const res = useMemo(() => calcBaufi(darlehen, zins, tilgung, zinsbindung), [darlehen, zins, tilgung, zinsbindung]);
  const payoffYears = estimateFullPayoffYears(darlehen, zins, tilgung);

  const step = res.series.length > 20 ? Math.ceil(res.series.length / 20) : 1;
  const bars = res.series
    .filter((p, i) => i % step === 0 || i === res.series.length - 1)
    .map((p) => ({ key: String(p.year), bottom: p.principalPaid, top: p.interestPaid, label: t.common.yearLabel(p.year) }));

  // Same wording as the website's bf-payoff-note.
  const payoffNote = payoffYears === null ? L.notCovered : L.payoff(Math.round(payoffYears));

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }} keyboardShouldPersistTaps="handled">
      <Text style={calcStyles.intro}>{L.intro}</Text>
      <NumberField label={L.amount} value={darlehen} onChange={setDarlehen} step={5000} min={50000} max={1000000} suffix="€" />
      <NumberField label={L.rate} value={zins} onChange={setZins} step={0.05} min={1} max={6} suffix="%" decimals={2} />
      <NumberField label={L.repayment} value={tilgung} onChange={setTilgung} step={0.1} min={1} max={5} suffix="%" decimals={1} />
      <NumberField label={L.fixed} value={zinsbindung} onChange={setZinsbindung} step={1} min={5} max={30} suffix={t.calc.unitYears} />

      <View style={calcStyles.tiles}>
        <ResultTile strong label={L.payment} value={L.perMonth(formatEUR(res.monthlyRate))} />
        <ResultTile label={L.balanceAfter(zinsbindung)} value={formatEUR(res.restschuld)} />
        <ResultTile label={L.interest} value={formatEUR(res.totalInterest)} />
      </View>
      <Text style={[calcStyles.disclaimer, { marginTop: 0, color: payoffYears === null ? colors.danger : colors.muted }]}>{payoffNote}</Text>

      <Text style={calcStyles.section}>{L.chart}</Text>
      <BarChart bars={bars} bottomLabel={L.principal} topLabel={L.interestShort} />

      <Pressable onPress={() => router.push({ pathname: '/vergleiche/[id]', params: { id: 'baufinanzierung' } })} style={{ marginTop: spacing.lg }}>
        <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 15 }}>{L.compare}</Text>
      </Pressable>

      {disclosure('rechner:baufinanzierungsrechner') ? (
        <Text style={calcStyles.disclaimer}>{disclosure('rechner:baufinanzierungsrechner')}</Text>
      ) : null}
    </ScrollView>
  );
}
