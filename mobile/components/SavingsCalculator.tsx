import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { calcSavings } from '@/lib/calc';
import { formatEUR } from '@/lib/format';
import { BarChart, NumberField, ResultTile, calcStyles } from './CalcUI';
import { spacing } from './theme';

type Range = { def: number; min: number; max: number; step: number };

/** Shared by Sparplanrechner and Zinseszinsrechner — one engine, like on the website. */
export function SavingsCalculator({
  intro, initial: i, monthly: mo, years: y, rate: r, disclaimer,
}: {
  intro: string; initial: Range; monthly: Range; years: Range; rate: Range; disclaimer: string | null;
}) {
  const [initial, setInitial] = useState(i.def);
  const [monthly, setMonthly] = useState(mo.def);
  const [years, setYears] = useState(y.def);
  const [rate, setRate] = useState(r.def);

  const series = useMemo(() => calcSavings(initial, monthly, years, rate), [initial, monthly, years, rate]);
  const last = series[series.length - 1];
  const step = series.length > 20 ? Math.ceil(series.length / 20) : 1;
  const bars = series
    .filter((p, idx) => idx % step === 0 || idx === series.length - 1)
    .map((p) => ({ key: String(p.year), bottom: p.contributed, top: Math.max(0, p.interest), label: `Jahr ${p.year}` }));

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }} keyboardShouldPersistTaps="handled">
      <Text style={calcStyles.intro}>{intro}</Text>
      <NumberField label="Einmalanlage" value={initial} onChange={setInitial} step={i.step} min={i.min} max={i.max} suffix="€" />
      <NumberField label="Monatliche Sparrate" value={monthly} onChange={setMonthly} step={mo.step} min={mo.min} max={mo.max} suffix="€" />
      <NumberField label="Anlagedauer" value={years} onChange={setYears} step={y.step} min={y.min} max={y.max} suffix="Jahre" />
      <NumberField label="Zins / Rendite p. a." value={rate} onChange={setRate} step={r.step} min={r.min} max={r.max} suffix="%" decimals={1} />

      <View style={calcStyles.tiles}>
        <ResultTile strong label={`Endkapital nach ${years} ${years === 1 ? 'Jahr' : 'Jahren'}`} value={formatEUR(last.balance)} />
        <ResultTile label="Eingezahlt" value={formatEUR(last.contributed)} />
        <ResultTile label="Zinsen & Erträge" value={formatEUR(last.interest)} />
      </View>

      <Text style={calcStyles.section}>Entwicklung</Text>
      <BarChart bars={bars} bottomLabel="Eingezahlt" topLabel="Zinsen & Erträge" />

      {disclaimer ? <Text style={calcStyles.disclaimer}>{disclaimer}</Text> : null}
    </ScrollView>
  );
}
