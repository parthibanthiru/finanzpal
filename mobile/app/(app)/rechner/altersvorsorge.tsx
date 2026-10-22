import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { calcMonthlyPayout, calcPayoutSeries, calcSavings } from '@/lib/calc';
import { disclosure } from '@/lib/disclosures';
import { formatEUR } from '@/lib/format';
import { BarChart, NumberField, ResultTile, calcStyles } from '@/components/CalcUI';
import { colors, spacing } from '@/components/theme';

// Defaults and ranges = the sliders on altersvorsorge-rechner.html.
export default function AltersvorsorgeScreen() {
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
      ...growth.map((p) => ({ key: `s${p.year}`, bottom: p.contributed, top: Math.max(0, p.interest), label: `Alter ${age + p.year}` })),
      ...payoutSeries.map((p) => ({ key: `a${p.age}`, bottom: p.balance, top: 0, label: `Alter ${p.age}`, bottomColor: colors.accent })),
    ];
    const step = full.length > 24 ? Math.ceil(full.length / 24) : 1;
    return {
      last: lastPoint,
      monthlyPayout: payout,
      bars: full.filter((_, i) => i % step === 0 || i === full.length - 1),
    };
  }, [age, retireAge, initial, monthly, rateSpar, ratePayout, payoutYears]);

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }} keyboardShouldPersistTaps="handled">
      <Text style={calcStyles.intro}>
        Wie viel Vermögen baust du bis zur Rente auf — und wie viel kannst du dir daraus monatlich auszahlen?
      </Text>
      <Text style={calcStyles.section}>Sparphase</Text>
      <NumberField label="Dein Alter heute" value={age} onChange={setAge} step={1} min={18} max={65} suffix="Jahre" />
      <NumberField label="Renteneintritt mit" value={retireAge} onChange={setRetireAge} step={1} min={55} max={75} suffix="Jahren" />
      <NumberField label="Startkapital" value={initial} onChange={setInitial} step={1000} min={0} max={100000} suffix="€" />
      <NumberField label="Monatliche Sparrate" value={monthly} onChange={setMonthly} step={25} min={0} max={2000} suffix="€" />
      <NumberField label="Rendite in der Sparphase p. a." value={rateSpar} onChange={setRateSpar} step={0.5} min={0} max={12} suffix="%" decimals={1} />
      <Text style={calcStyles.section}>Auszahlphase</Text>
      <NumberField label="Rendite in der Auszahlphase p. a." value={ratePayout} onChange={setRatePayout} step={0.5} min={0} max={8} suffix="%" decimals={1} />
      <NumberField label="Auszahldauer" value={payoutYears} onChange={setPayoutYears} step={1} min={5} max={40} suffix="Jahre" />

      <View style={calcStyles.tiles}>
        <ResultTile strong label="Monatliche Zusatzrente" value={formatEUR(monthlyPayout)} />
        <ResultTile label={`Vermögen mit ${retireAge}`} value={formatEUR(last.balance)} />
        <ResultTile label="Eingezahlt" value={formatEUR(last.contributed)} />
        <ResultTile label="Zinsen & Erträge" value={formatEUR(last.interest)} />
      </View>

      <Text style={calcStyles.section}>Vermögensverlauf</Text>
      <BarChart bars={bars} bottomLabel="Eingezahlt" topLabel="Erträge" extraLegend={{ label: 'Auszahlphase', color: colors.accent }} />

      {disclosure('rechner:altersvorsorge-rechner') ? (
        <Text style={calcStyles.disclaimer}>{disclosure('rechner:altersvorsorge-rechner')}</Text>
      ) : null}
    </ScrollView>
  );
}
