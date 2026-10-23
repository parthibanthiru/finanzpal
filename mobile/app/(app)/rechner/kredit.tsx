import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { calcLoan } from '@/lib/calc';
import { disclosure } from '@/lib/disclosures';
import { formatEUR, formatEURCents } from '@/lib/format';
import { BarChart, NumberField, ResultTile, useCalcStyles } from '@/components/CalcUI';
import { spacing, useColors } from '@/components/theme';

// Defaults and ranges = the sliders on kreditrechner.html.
export default function KreditScreen() {
  const calcStyles = useCalcStyles();
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
    label: `Jahr ${p.year}`,
  }));

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }} keyboardShouldPersistTaps="handled">
      <Text style={calcStyles.intro}>Was kostet dein Ratenkredit pro Monat und insgesamt?</Text>
      <NumberField label="Kreditbetrag" value={amount} onChange={setAmount} step={500} min={500} max={100000} suffix="€" />
      <NumberField label="Effektiver Jahreszins" value={rate} onChange={setRate} step={0.1} min={0} max={15} suffix="%" decimals={1} />
      <NumberField label="Laufzeit" value={term} onChange={setTerm} step={6} min={6} max={120} suffix="Monate" />

      <View style={calcStyles.tiles}>
        <ResultTile strong label="Monatliche Rate" value={formatEURCents(res.payment)} />
        <ResultTile label="Zinskosten gesamt" value={formatEUR(res.totalInterest)} />
        <ResultTile label="Gesamtkosten" value={formatEUR(res.totalCost)} />
      </View>

      <Text style={calcStyles.section}>Restschuld pro Jahr</Text>
      <BarChart bars={bars} bottomLabel="Restschuld" topLabel="Getilgt" />

      <Pressable onPress={() => router.push({ pathname: '/vergleiche/[id]', params: { id: 'kredite' } })} style={{ marginTop: spacing.lg }}>
        <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 15 }}>Ratenkredite vergleichen ›</Text>
      </Pressable>

      {disclosure('rechner:kreditrechner') ? <Text style={calcStyles.disclaimer}>{disclosure('rechner:kreditrechner')}</Text> : null}
    </ScrollView>
  );
}
