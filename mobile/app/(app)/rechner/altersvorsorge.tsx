import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { calcMonthlyPayout, calcPayoutSeries, calcSavings } from '@/lib/calc';
import { disclosure } from '@/lib/disclosures';
import { useT } from '@/lib/i18n';
import { formatEUR } from '@/lib/format';
import { BarChart, NumberField, ResultTile, useCalcStyles } from '@/components/CalcUI';
import { spacing, useColors } from '@/components/theme';

// Defaults and ranges = the sliders on altersvorsorge-rechner.html.
export default function AltersvorsorgeScreen() {
  const calcStyles = useCalcStyles();
  const t = useT();
  const L = t.calc.alters;
  const colors = useColors();
  const [age, setAge] = useState(30);
  const [retireAgeInput, setRetireAge] = useState(67);
  const [initial, setInitial] = useState(5000);
  const [monthly, setMonthly] = useState(200);
  const [rateSpar, setRateSpar] = useState(6);
  const [ratePayout, setRatePayout] = useState(3);
  const [payoutYears, setPayoutYears] = useState(25);

  // Like the website: retirement age is always at least one year after the current age.
  const retireAge = Math.max(retireAgeInput, age + 1);

  const { last, monthlyPayout, bars } = useMemo(() => {
    const growth = calcSavings(initial, monthly, retireAge - age, rateSpar);
    const lastPoint = growth[growth.length - 1];
    const payout = calcMonthlyPayout(lastPoint.balance, ratePayout, payoutYears);
    const payoutSeries = calcPayoutSeries(lastPoint.balance, ratePayout, payoutYears, retireAge, payout);

    const full = [
      ...growth.map((p) => ({ key: `s${p.year}`, bottom: p.contributed, top: Math.max(0, p.interest), label: t.common.ageLabel(age + p.year) })),
      ...payoutSeries.map((p) => ({ key: `a${p.age}`, bottom: p.balance, top: 0, label: t.common.ageLabel(p.age), bottomColor: colors.accent })),
    ];
    const step = full.length > 24 ? Math.ceil(full.length / 24) : 1;
    return {
      last: lastPoint,
      monthlyPayout: payout,
      bars: full.filter((_, i) => i % step === 0 || i === full.length - 1),
    };
  }, [age, retireAge, initial, monthly, rateSpar, ratePayout, payoutYears, t, colors]);

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }} keyboardShouldPersistTaps="handled">
      <Text style={calcStyles.intro}>{L.intro}</Text>
      <Text style={calcStyles.section}>{L.savingPhase}</Text>
      <NumberField label={L.age} value={age} onChange={setAge} step={1} min={18} max={65} suffix={t.calc.unitYears} />
      <NumberField label={L.retire} value={retireAge} onChange={setRetireAge} step={1} min={55} max={75} suffix={L.unitRetire} />
      <NumberField label={L.initial} value={initial} onChange={setInitial} step={1000} min={0} max={100000} suffix="€" />
      <NumberField label={L.monthly} value={monthly} onChange={setMonthly} step={25} min={0} max={2000} suffix="€" />
      <NumberField label={L.rateSave} value={rateSpar} onChange={setRateSpar} step={0.5} min={0} max={12} suffix="%" decimals={1} />
      <Text style={calcStyles.section}>{L.payoutPhase}</Text>
      <NumberField label={L.ratePayout} value={ratePayout} onChange={setRatePayout} step={0.5} min={0} max={8} suffix="%" decimals={1} />
      <NumberField label={L.payoutYears} value={payoutYears} onChange={setPayoutYears} step={1} min={5} max={40} suffix={t.calc.unitYears} />

      <View style={calcStyles.tiles}>
        <ResultTile strong label={L.pension} value={formatEUR(monthlyPayout)} />
        <ResultTile label={L.capitalAt(retireAge)} value={formatEUR(last.balance)} />
        <ResultTile label={L.contributed} value={formatEUR(last.contributed)} />
        <ResultTile label={L.interest} value={formatEUR(last.interest)} />
      </View>

      <Text style={calcStyles.section}>{L.chart}</Text>
      <BarChart bars={bars} bottomLabel={L.contributed} topLabel={L.returns} extraLegend={{ label: L.payoutPhase, color: colors.accent }} />

      {disclosure('rechner:altersvorsorge-rechner') ? (
        <Text style={calcStyles.disclaimer}>{disclosure('rechner:altersvorsorge-rechner')}</Text>
      ) : null}
    </ScrollView>
  );
}
