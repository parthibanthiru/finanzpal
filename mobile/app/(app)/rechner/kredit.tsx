import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { calcLoan } from '@/lib/calc';
import { disclosure } from '@/lib/disclosures';
import { useT } from '@/lib/i18n';
import { formatEUR, formatEURCents } from '@/lib/format';
import { BarChart, NumberField, ResultTile, useCalcStyles } from '@/components/CalcUI';
import { spacing, useColors } from '@/components/theme';

// Defaults and ranges = the sliders on kreditrechner.html.
export default function KreditScreen() {
  const calcStyles = useCalcStyles();
  const t = useT();
  const L = t.calc.kredit;
  const colors = useColors();
  const router = useRouter();
  const [amount, setAmount] = useState(10000);
  const [rate, setRate] = useState(4);
  const [term, setTerm] = useState(48);

  const res = useMemo(() => calcLoan(amount, rate, term), [amount, rate, term]);
  const bars = res.series.map((p) => ({
    key: String(p.year),
    bottom: p.balance,
    top: Math.max(0, amount - p.balance),
    label: t.common.yearLabel(p.year),
  }));

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }} keyboardShouldPersistTaps="handled">
      <Text style={calcStyles.intro}>{L.intro}</Text>
      <NumberField label={L.amount} value={amount} onChange={setAmount} step={500} min={500} max={100000} suffix="€" />
      <NumberField label={L.rate} value={rate} onChange={setRate} step={0.1} min={0} max={15} suffix="%" decimals={1} />
      <NumberField label={L.term} value={term} onChange={setTerm} step={6} min={6} max={120} suffix={t.calc.unitMonths} />

      <View style={calcStyles.tiles}>
        <ResultTile strong label={L.payment} value={formatEURCents(res.payment)} />
        <ResultTile label={L.totalInterest} value={formatEUR(res.totalInterest)} />
        <ResultTile label={L.totalCost} value={formatEUR(res.totalCost)} />
      </View>

      <Text style={calcStyles.section}>{L.chart}</Text>
      <BarChart bars={bars} bottomLabel={L.balance} topLabel={L.repaid} />

      <Pressable onPress={() => router.push({ pathname: '/vergleiche/[id]', params: { id: 'kredite' } })} style={{ marginTop: spacing.lg }}>
        <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 15 }}>{L.compare}</Text>
      </Pressable>

      {disclosure('rechner:kreditrechner') ? <Text style={calcStyles.disclaimer}>{disclosure('rechner:kreditrechner')}</Text> : null}
    </ScrollView>
  );
}
