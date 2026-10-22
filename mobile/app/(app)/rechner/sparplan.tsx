import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { calcSavings } from '@/lib/calc';
import { formatEUR } from '@/lib/format';
import { BarChart, NumberField, ResultTile, calcStyles } from '@/components/CalcUI';
import { spacing } from '@/components/theme';

// Defaults and ranges = the sliders on sparplanrechner.html.
export default function SparplanScreen() {
  const [initial, setInitial] = useState(1000);
  const [monthly, setMonthly] = useState(100);
  const [years, setYears] = useState(15);
  const [rate, setRate] = useState(7);

  const series = useMemo(() => calcSavings(initial, monthly, years, rate), [initial, monthly, years, rate]);
  const last = series[series.length - 1];
  const step = series.length > 20 ? Math.ceil(series.length / 20) : 1;
  const bars = series
    .filter((p, i) => i % step === 0 || i === series.length - 1)
    .map((p) => ({ key: String(p.year), bottom: p.contributed, top: Math.max(0, p.interest), label: `Jahr ${p.year}` }));

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }} keyboardShouldPersistTaps="handled">
      <Text style={calcStyles.intro}>Wie viel wird aus deiner Einmalanlage und deiner monatlichen Sparrate?</Text>
      <NumberField label="Einmalanlage" value={initial} onChange={setInitial} step={500} min={0} max={50000} suffix="€" />
      <NumberField label="Monatliche Sparrate" value={monthly} onChange={setMonthly} step={25} min={0} max={2000} suffix="€" />
      <NumberField label="Anlagedauer" value={years} onChange={setYears} step={1} min={1} max={40} suffix="Jahre" />
      <NumberField label="Erwartete Rendite p. a." value={rate} onChange={setRate} step={0.5} min={0} max={12} suffix="%" decimals={1} />

      <View style={calcStyles.tiles}>
        <ResultTile strong label={`Endkapital nach ${years} ${years === 1 ? 'Jahr' : 'Jahren'}`} value={formatEUR(last.balance)} />
        <ResultTile label="Eingezahlt" value={formatEUR(last.contributed)} />
        <ResultTile label="Zinsen & Erträge" value={formatEUR(last.interest)} />
      </View>

      <Text style={calcStyles.section}>Entwicklung</Text>
      <BarChart bars={bars} bottomLabel="Eingezahlt" topLabel="Erträge" />

      <Text style={calcStyles.disclaimer}>
        Modellrechnung mit monatlicher Verzinsung und gleichbleibender Rendite. Echte Renditen schwanken; Kosten, Steuern und
        Inflation sind nicht berücksichtigt. Keine Anlageberatung.
      </Text>
    </ScrollView>
  );
}
