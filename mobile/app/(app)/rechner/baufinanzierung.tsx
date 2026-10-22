import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { calcBaufi, estimateFullPayoffYears } from '@/lib/calc';
import { disclosure } from '@/lib/disclosures';
import { formatEUR } from '@/lib/format';
import { BarChart, NumberField, ResultTile, calcStyles } from '@/components/CalcUI';
import { colors, spacing } from '@/components/theme';

// Defaults and ranges = the sliders on baufinanzierungsrechner.html.
export default function BaufinanzierungScreen() {
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
    .map((p) => ({ key: String(p.year), bottom: p.principalPaid, top: p.interestPaid, label: `Jahr ${p.year}` }));

  // Same wording as the website's bf-payoff-note.
  const payoffNote =
    payoffYears === null
      ? 'Bei diesem Zins deckt die Monatsrate nicht einmal die Zinsen — die Restschuld würde wachsen statt sinken. Erhöhe die Tilgungsrate.'
      : `Bliebe der Zinssatz über die gesamte Laufzeit exakt wie oben eingegeben (nur zur Orientierung — bei einer echten Finanzierung wird der Zins nach der Zinsbindung neu verhandelt), wärst du nach rund ${Math.round(payoffYears)} ${Math.round(payoffYears) === 1 ? 'Jahr' : 'Jahren'} schuldenfrei.`;

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }} keyboardShouldPersistTaps="handled">
      <Text style={calcStyles.intro}>Monatsrate, Zinskosten und Restschuld nach der Zinsbindung deiner Immobilienfinanzierung.</Text>
      <NumberField label="Darlehensbetrag" value={darlehen} onChange={setDarlehen} step={5000} min={50000} max={1000000} suffix="€" />
      <NumberField label="Sollzins p. a." value={zins} onChange={setZins} step={0.05} min={1} max={6} suffix="%" decimals={2} />
      <NumberField label="Anfängliche Tilgung p. a." value={tilgung} onChange={setTilgung} step={0.1} min={1} max={5} suffix="%" decimals={1} />
      <NumberField label="Zinsbindung" value={zinsbindung} onChange={setZinsbindung} step={1} min={5} max={30} suffix="Jahre" />

      <View style={calcStyles.tiles}>
        <ResultTile strong label="Monatliche Rate" value={`${formatEUR(res.monthlyRate)}/Monat`} />
        <ResultTile label={`Restschuld nach ${zinsbindung} Jahren`} value={formatEUR(res.restschuld)} />
        <ResultTile label="Zinsen in der Zinsbindung" value={formatEUR(res.totalInterest)} />
      </View>
      <Text style={[calcStyles.disclaimer, { marginTop: 0, color: payoffYears === null ? colors.danger : colors.muted }]}>{payoffNote}</Text>

      <Text style={calcStyles.section}>Tilgung und Zinsen pro Jahr</Text>
      <BarChart bars={bars} bottomLabel="Tilgung" topLabel="Zinsen" />

      <Pressable onPress={() => router.push({ pathname: '/vergleiche/[id]', params: { id: 'baufinanzierung' } })} style={{ marginTop: spacing.lg }}>
        <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 15 }}>Baufinanzierungs-Vermittler vergleichen ›</Text>
      </Pressable>

      {disclosure('rechner:baufinanzierungsrechner') ? (
        <Text style={calcStyles.disclaimer}>{disclosure('rechner:baufinanzierungsrechner')}</Text>
      ) : null}
    </ScrollView>
  );
}
