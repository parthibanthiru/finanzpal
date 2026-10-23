import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { calcSavings } from '@/lib/calc';
import { formatEUR } from '@/lib/format';
import { BarChart, NumberField, ResultTile, useCalcStyles } from './CalcUI';
import { spacing } from './theme';
import { useT } from '@/lib/i18n';

type Range = { def: number; min: number; max: number; step: number };

/** Shared by Sparplanrechner and Zinseszinsrechner — one engine, like on the website. */
export function SavingsCalculator({
  intro, initial: i, monthly: mo, years: y, rate: r, disclaimer,
}: {
  intro: string; initial: Range; monthly: Range; years: Range; rate: Range; disclaimer: string | null; // intro: already translated by the screen
}) {
  const calcStyles = useCalcStyles();
  const t = useT();
  const L = t.calc.savings;
  const [initial, setInitial] = useState(i.def);
  const [monthly, setMonthly] = useState(mo.def);
  const [years, setYears] = useState(y.def);
  const [rate, setRate] = useState(r.def);

  const series = useMemo(() => calcSavings(initial, monthly, years, rate), [initial, monthly, years, rate]);
  const last = series[series.length - 1];
  const step = series.length > 20 ? Math.ceil(series.length / 20) : 1;
  const bars = series
    .filter((p, idx) => idx % step === 0 || idx === series.length - 1)
    .map((p) => ({ key: String(p.year), bottom: p.contributed, top: Math.max(0, p.interest), label: t.common.yearLabel(p.year) }));

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }} keyboardShouldPersistTaps="handled">
      <Text style={calcStyles.intro}>{intro}</Text>
      <NumberField label={L.initial} value={initial} onChange={setInitial} step={i.step} min={i.min} max={i.max} suffix="€" />
      <NumberField label={L.monthly} value={monthly} onChange={setMonthly} step={mo.step} min={mo.min} max={mo.max} suffix="€" />
      <NumberField label={L.years} value={years} onChange={setYears} step={y.step} min={y.min} max={y.max} suffix={t.calc.unitYears} />
      <NumberField label={L.rate} value={rate} onChange={setRate} step={r.step} min={r.min} max={r.max} suffix="%" decimals={1} />

      <View style={calcStyles.tiles}>
        <ResultTile strong label={L.final(years)} value={formatEUR(last.balance)} />
        <ResultTile label={L.contributed} value={formatEUR(last.contributed)} />
        <ResultTile label={L.interest} value={formatEUR(last.interest)} />
      </View>

      <Text style={calcStyles.section}>{L.chart}</Text>
      <BarChart bars={bars} bottomLabel={L.contributed} topLabel={L.interest} />

      {disclaimer ? <Text style={calcStyles.disclaimer}>{disclaimer}</Text> : null}
    </ScrollView>
  );
}
