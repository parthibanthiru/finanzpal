import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { calcNetto, NettoParams, Steuerklasse, KvTyp } from '@/lib/calc';
import { disclosure } from '@/lib/disclosures';
import { useT } from '@/lib/i18n';
import { formatEURCents } from '@/lib/format';
import { BreakdownRow, ChoiceField, NumberField, ResultTile, SwitchField, useCalcStyles } from '@/components/CalcUI';
import { spacing } from '@/components/theme';

// Defaults, ranges and options = nettolohnrechner.html (2026 Werte). Steuerklasse
// V/VI werden wie auf der Website bewusst nicht berechnet — siehe L.notComputed.
export default function NettolohnScreen() {
  const calcStyles = useCalcStyles();
  const t = useT();
  const L = t.calc.netto;
  const [brutto, setBrutto] = useState(4000);
  const [steuerklasse, setSteuerklasse] = useState<Steuerklasse>('1');
  const [faktor, setFaktor] = useState(0.89);
  const [zkf, setZkf] = useState(0);
  const [bundesland, setBundesland] = useState('be');
  const [kirchensteuerpflichtig, setKirchensteuerpflichtig] = useState(false);
  const [kvTyp, setKvTyp] = useState<KvTyp>('gesetzlich');
  const [zusatz, setZusatz] = useState(2.9);
  const [pkvPraemie, setPkvPraemie] = useState(550);
  const [kinderlos, setKinderlos] = useState(false);

  const params: NettoParams = {
    bruttoMonat: brutto,
    steuerklasse,
    faktor,
    zkf,
    bundesland,
    kirchensteuerpflichtig,
    kvTyp,
    zusatzbeitragPct: zusatz,
    pkvPraemieMonat: pkvPraemie,
    kinderlos: zkf > 0 ? false : kinderlos,
  };
  const r = useMemo(() => calcNetto(params), [
    brutto, steuerklasse, faktor, zkf, bundesland, kirchensteuerpflichtig, kvTyp, zusatz, pkvPraemie, kinderlos,
  ]);

  const isPrivat = kvTyp === 'privat';
  const notComputed = r === null;
  const steuern = r ? r.estMonat + r.soliMonat + r.kistMonat : 0;

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }} keyboardShouldPersistTaps="handled">
      <Text style={calcStyles.intro}>{L.intro}</Text>
      <NumberField label={L.gross} value={brutto} onChange={setBrutto} step={50} min={1000} max={15000} suffix="€" />
      <ChoiceField
        label={L.steuerklasse}
        value={steuerklasse}
        onChange={setSteuerklasse}
        options={[
          { value: '1', label: L.stkl1 },
          { value: '2', label: L.stkl2 },
          { value: '3', label: L.stkl3 },
          { value: '4', label: L.stkl4 },
          { value: '4f', label: L.stkl4f },
          { value: '5', label: L.stkl5 },
          { value: '6', label: L.stkl6 },
        ]}
      />
      {steuerklasse === '4f' && (
        <NumberField label={L.faktor} value={faktor} onChange={setFaktor} step={0.001} min={0.001} max={0.999} suffix="" decimals={3} />
      )}
      <NumberField label={L.kinderfreibetrag} value={zkf} onChange={setZkf} step={0.5} min={0} max={6} suffix="" decimals={1} />
      <ChoiceField
        label={L.bundesland}
        value={bundesland}
        onChange={setBundesland}
        options={[
          { value: 'bw', label: L.landBw }, { value: 'by', label: L.landBy }, { value: 'be', label: L.landBe },
          { value: 'bb', label: L.landBb }, { value: 'hb', label: L.landHb }, { value: 'hh', label: L.landHh },
          { value: 'he', label: L.landHe }, { value: 'mv', label: L.landMv }, { value: 'ni', label: L.landNi },
          { value: 'nw', label: L.landNw }, { value: 'rp', label: L.landRp }, { value: 'sl', label: L.landSl },
          { value: 'sn', label: L.landSn }, { value: 'st', label: L.landSt }, { value: 'sh', label: L.landSh },
          { value: 'th', label: L.landTh },
        ]}
      />
      <SwitchField label={L.kirchensteuerpflichtig} value={kirchensteuerpflichtig} onChange={setKirchensteuerpflichtig} />
      <ChoiceField
        label={L.kvtyp}
        value={kvTyp}
        onChange={setKvTyp}
        options={[
          { value: 'gesetzlich', label: L.kvGesetzlich },
          { value: 'privat', label: L.kvPrivat },
        ]}
      />
      {!isPrivat && (
        <NumberField label={L.surcharge} value={zusatz} onChange={setZusatz} step={0.05} min={0} max={3.5} suffix="%" decimals={2} />
      )}
      {isPrivat && (
        <NumberField label={L.pkvPraemie} value={pkvPraemie} onChange={setPkvPraemie} step={10} min={0} max={2000} suffix="€" />
      )}
      {!isPrivat && <SwitchField label={L.childless} value={kinderlos} onChange={setKinderlos} />}

      {notComputed ? (
        <View style={calcStyles.tiles}>
          <Text style={calcStyles.disclaimer}>{L.notComputed}</Text>
        </View>
      ) : (
        <>
          <View style={calcStyles.tiles}>
            <ResultTile strong label={L.net} value={formatEURCents(r.nettoMonat)} />
            <ResultTile label={L.social} value={formatEURCents(r.svMonat)} />
            <ResultTile label={L.taxes} value={formatEURCents(steuern)} />
          </View>

          <Text style={calcStyles.section}>{L.breakdown}</Text>
          <BreakdownRow label={L.rowGross} value={formatEURCents(r.bruttoMonat)} />
          <BreakdownRow label={L.rv} value={`− ${formatEURCents(r.rv)}`} />
          <BreakdownRow label={L.alv} value={`− ${formatEURCents(r.alv)}`} />
          <BreakdownRow label={isPrivat ? L.kvPrivatRow : L.kv} value={`− ${formatEURCents(r.kv)}`} />
          {!isPrivat && <BreakdownRow label={L.pv} value={`− ${formatEURCents(r.pv)}`} />}
          <BreakdownRow label={L.est} value={`− ${formatEURCents(r.estMonat)}`} />
          <BreakdownRow label={L.soli} value={`− ${formatEURCents(r.soliMonat)}`} />
          <BreakdownRow label={L.kist} value={`− ${formatEURCents(r.kistMonat)}`} />
          <BreakdownRow strong label={L.rowNet} value={formatEURCents(r.nettoMonat)} />
        </>
      )}

      {disclosure('rechner:nettolohnrechner') ? <Text style={calcStyles.disclaimer}>{disclosure('rechner:nettolohnrechner')}</Text> : null}
    </ScrollView>
  );
}
