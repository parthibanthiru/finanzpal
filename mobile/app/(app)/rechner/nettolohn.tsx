import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { calcNetto } from '@/lib/calc';
import { disclosure } from '@/lib/disclosures';
import { useT } from '@/lib/i18n';
import { formatEURCents } from '@/lib/format';
import { BreakdownRow, ChoiceField, NumberField, ResultTile, SwitchField, useCalcStyles } from '@/components/CalcUI';
import { spacing } from '@/components/theme';

// Defaults, ranges and options = nettolohnrechner.html (Steuerklasse I, Werte 2026).
export default function NettolohnScreen() {
  const calcStyles = useCalcStyles();
  const t = useT();
  const L = t.calc.netto;
  const [brutto, setBrutto] = useState(4000);
  const [zusatz, setZusatz] = useState(2.9);
  const [kinderlos, setKinderlos] = useState(false);
  const [kist, setKist] = useState(0);

  const r = useMemo(() => calcNetto(brutto, zusatz, kinderlos, kist), [brutto, zusatz, kinderlos, kist]);
  const steuern = r.estMonat + r.soliMonat + r.kistMonat;

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }} keyboardShouldPersistTaps="handled">
      <Text style={calcStyles.intro}>{L.intro}</Text>
      <NumberField label={L.gross} value={brutto} onChange={setBrutto} step={50} min={1000} max={15000} suffix="€" />
      <NumberField label={L.surcharge} value={zusatz} onChange={setZusatz} step={0.05} min={0} max={3.5} suffix="%" decimals={2} />
      <ChoiceField
        label={L.church}
        value={kist}
        onChange={setKist}
        options={[
          { value: 0, label: L.churchNone },
          { value: 9, label: L.church9 },
          { value: 8, label: L.church8 },
        ]}
      />
      <SwitchField label={L.childless} value={kinderlos} onChange={setKinderlos} />

      <View style={calcStyles.tiles}>
        <ResultTile strong label={L.net} value={formatEURCents(r.nettoMonat)} />
        <ResultTile label={L.social} value={formatEURCents(r.svMonat)} />
        <ResultTile label={L.taxes} value={formatEURCents(steuern)} />
      </View>

      <Text style={calcStyles.section}>{L.breakdown}</Text>
      <BreakdownRow label={L.rowGross} value={formatEURCents(r.bruttoMonat)} />
      <BreakdownRow label={L.rv} value={`− ${formatEURCents(r.rv)}`} />
      <BreakdownRow label={L.alv} value={`− ${formatEURCents(r.alv)}`} />
      <BreakdownRow label={L.kv} value={`− ${formatEURCents(r.kv)}`} />
      <BreakdownRow label={L.pv} value={`− ${formatEURCents(r.pv)}`} />
      <BreakdownRow label={L.est} value={`− ${formatEURCents(r.estMonat)}`} />
      <BreakdownRow label={L.soli} value={`− ${formatEURCents(r.soliMonat)}`} />
      <BreakdownRow label={L.kist} value={`− ${formatEURCents(r.kistMonat)}`} />
      <BreakdownRow strong label={L.rowNet} value={formatEURCents(r.nettoMonat)} />

      {disclosure('rechner:nettolohnrechner') ? <Text style={calcStyles.disclaimer}>{disclosure('rechner:nettolohnrechner')}</Text> : null}
    </ScrollView>
  );
}
