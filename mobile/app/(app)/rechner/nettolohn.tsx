import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { calcNetto } from '@/lib/calc';
import { disclosure } from '@/lib/disclosures';
import { formatEURCents } from '@/lib/format';
import { BreakdownRow, ChoiceField, NumberField, ResultTile, SwitchField, calcStyles } from '@/components/CalcUI';
import { spacing } from '@/components/theme';

// Defaults, ranges and options = nettolohnrechner.html (Steuerklasse I, Werte 2026).
export default function NettolohnScreen() {
  const [brutto, setBrutto] = useState(4000);
  const [zusatz, setZusatz] = useState(2.9);
  const [kinderlos, setKinderlos] = useState(false);
  const [kist, setKist] = useState(0);

  const r = useMemo(() => calcNetto(brutto, zusatz, kinderlos, kist), [brutto, zusatz, kinderlos, kist]);
  const steuern = r.estMonat + r.soliMonat + r.kistMonat;

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }} keyboardShouldPersistTaps="handled">
      <Text style={calcStyles.intro}>Was bleibt von deinem Bruttogehalt übrig? Steuerklasse I, mit allen Abgaben einzeln aufgeschlüsselt.</Text>
      <NumberField label="Bruttogehalt pro Monat" value={brutto} onChange={setBrutto} step={50} min={1000} max={15000} suffix="€" />
      <NumberField label="Zusatzbeitrag deiner Krankenkasse" value={zusatz} onChange={setZusatz} step={0.05} min={0} max={3.5} suffix="%" decimals={2} />
      <ChoiceField
        label="Kirchensteuer"
        value={kist}
        onChange={setKist}
        options={[
          { value: 0, label: 'Keine' },
          { value: 9, label: '9 % (die meisten Bundesländer)' },
          { value: 8, label: '8 % (Bayern, Baden-Württemberg)' },
        ]}
      />
      <SwitchField label="Kinderlos und 23 Jahre oder älter (Pflegeversicherungs-Zuschlag)" value={kinderlos} onChange={setKinderlos} />

      <View style={calcStyles.tiles}>
        <ResultTile strong label="Netto pro Monat" value={formatEURCents(r.nettoMonat)} />
        <ResultTile label="Sozialabgaben" value={formatEURCents(r.svMonat)} />
        <ResultTile label="Steuern" value={formatEURCents(steuern)} />
      </View>

      <Text style={calcStyles.section}>Aufschlüsselung pro Monat</Text>
      <BreakdownRow label="Bruttogehalt" value={formatEURCents(r.bruttoMonat)} />
      <BreakdownRow label="Rentenversicherung" value={`− ${formatEURCents(r.rv)}`} />
      <BreakdownRow label="Arbeitslosenversicherung" value={`− ${formatEURCents(r.alv)}`} />
      <BreakdownRow label="Krankenversicherung" value={`− ${formatEURCents(r.kv)}`} />
      <BreakdownRow label="Pflegeversicherung" value={`− ${formatEURCents(r.pv)}`} />
      <BreakdownRow label="Lohnsteuer" value={`− ${formatEURCents(r.estMonat)}`} />
      <BreakdownRow label="Solidaritätszuschlag" value={`− ${formatEURCents(r.soliMonat)}`} />
      <BreakdownRow label="Kirchensteuer" value={`− ${formatEURCents(r.kistMonat)}`} />
      <BreakdownRow strong label="Netto" value={formatEURCents(r.nettoMonat)} />

      {disclosure('rechner:nettolohnrechner') ? <Text style={calcStyles.disclaimer}>{disclosure('rechner:nettolohnrechner')}</Text> : null}
    </ScrollView>
  );
}
