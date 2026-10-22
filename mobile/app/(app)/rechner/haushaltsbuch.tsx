import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '@/context/AuthProvider';
import {
  Buchung, KATEGORIEN, Typ, katLabel, loadBuchungen, newBuchung, saveBuchungen, summarize,
} from '@/lib/haushaltsbuch';
import { formatEURCents } from '@/lib/format';
import { ChoiceField, ResultTile, calcStyles } from '@/components/CalcUI';
import { Button } from '@/components/ui';
import { colors, radius, spacing } from '@/components/theme';

export default function HaushaltsbuchScreen() {
  const { user } = useAuth();
  const userId = user?.id ?? 'anon';
  const [items, setItems] = useState<Buchung[] | null>(null);
  const [typ, setTyp] = useState<Typ>('ausgabe');
  const [kategorie, setKategorie] = useState(KATEGORIEN.ausgabe[0].id);
  const [beschreibung, setBeschreibung] = useState('');
  const [betrag, setBetrag] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBuchungen(userId).then(setItems);
  }, [userId]);

  const sum = useMemo(() => summarize(items ?? []), [items]);
  const sorted = useMemo(() => [...(items ?? [])].sort((a, b) => b.createdAt - a.createdAt), [items]);

  function update(next: Buchung[]) {
    setItems(next);
    saveBuchungen(userId, next);
  }

  function changeTyp(t: Typ) {
    setTyp(t);
    setKategorie(KATEGORIEN[t][0].id);
  }

  function add() {
    const value = parseFloat(betrag.replace(/\./g, '').replace(',', '.'));
    if (!value || value <= 0) return setError('Bitte gib einen Betrag größer als 0 ein.');
    setError(null);
    update([...(items ?? []), newBuchung(typ, kategorie, beschreibung, value)]);
    setBetrag('');
    setBeschreibung('');
  }

  function reset() {
    if (!items?.length) return;
    Alert.alert('Alles löschen?', 'Wirklich alle Buchungen löschen? Das kann nicht rückgängig gemacht werden.', [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Löschen', style: 'destructive', onPress: () => update([]) },
    ]);
  }

  if (!items) return <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.primary} />;

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }} keyboardShouldPersistTaps="handled">
      <View style={calcStyles.tiles}>
        <ResultTile label="Einnahmen" value={formatEURCents(sum.einnahmen)} />
        <ResultTile label="Ausgaben" value={formatEURCents(sum.ausgaben)} />
        <ResultTile strong label="Saldo" value={formatEURCents(sum.saldo)} />
      </View>
      {sum.saldo < 0 && <Text style={styles.negative}>Du gibst mehr aus, als du einnimmst.</Text>}

      <Text style={calcStyles.section}>Neue Buchung</Text>
      <ChoiceField
        label="Art"
        value={typ}
        onChange={changeTyp}
        options={[
          { value: 'ausgabe', label: 'Ausgabe' },
          { value: 'einnahme', label: 'Einnahme' },
        ]}
      />
      <ChoiceField label="Kategorie" value={kategorie} onChange={setKategorie} options={KATEGORIEN[typ].map((k) => ({ value: k.id, label: k.label }))} />
      <Text style={styles.label}>Beschreibung (optional)</Text>
      <TextInput style={styles.input} value={beschreibung} onChangeText={setBeschreibung} placeholder="z. B. Miete Oktober" placeholderTextColor={colors.muted} />
      <Text style={styles.label}>Betrag</Text>
      <View style={styles.amountRow}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          value={betrag}
          onChangeText={setBetrag}
          keyboardType="decimal-pad"
          placeholder="0,00"
          placeholderTextColor={colors.muted}
          onSubmitEditing={add}
        />
        <Text style={styles.euro}>€</Text>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title="Hinzufügen" onPress={add} />

      <Text style={calcStyles.section}>Ausgaben nach Kategorie</Text>
      {sum.breakdown.length === 0 ? (
        <Text style={styles.empty}>Noch keine Ausgaben zur Aufschlüsselung nach Kategorie.</Text>
      ) : (
        sum.breakdown.map((r) => (
          <View key={r.katId} style={{ marginBottom: spacing.sm }}>
            <View style={styles.catHead}>
              <Text style={styles.catLabel}>{katLabel('ausgabe', r.katId)}</Text>
              <Text style={styles.catValue}>
                {formatEURCents(r.betrag)} · {r.pct.toFixed(0)} %
              </Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${r.pct}%` }]} />
            </View>
          </View>
        ))
      )}

      <Text style={calcStyles.section}>Buchungen</Text>
      {sorted.length === 0 ? (
        <Text style={styles.empty}>Noch keine Buchungen — füge oben deine erste Einnahme oder Ausgabe hinzu.</Text>
      ) : (
        sorted.map((tx) => (
          <View key={tx.id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.desc}>{tx.beschreibung || katLabel(tx.typ, tx.kategorie)}</Text>
              <Text style={styles.kat}>
                {katLabel(tx.typ, tx.kategorie)} · {new Date(tx.createdAt).toLocaleDateString('de-DE')}
              </Text>
            </View>
            <Text style={[styles.amt, { color: tx.typ === 'einnahme' ? colors.pal : colors.danger }]}>
              {tx.typ === 'einnahme' ? '+' : '−'} {formatEURCents(Math.abs(tx.betrag))}
            </Text>
            <Pressable
              onPress={() => update(items.filter((x) => x.id !== tx.id))}
              style={styles.del}
              accessibilityLabel="Löschen"
              hitSlop={8}
            >
              <Text style={{ color: colors.muted, fontSize: 18 }}>×</Text>
            </Pressable>
          </View>
        ))
      )}
      {sorted.length > 0 && (
        <Pressable onPress={reset} style={{ marginTop: spacing.md }}>
          <Text style={{ color: colors.danger, fontWeight: '600' }}>Alle Buchungen löschen</Text>
        </Pressable>
      )}

      <Text style={calcStyles.disclaimer}>
        Deine Buchungen werden nur auf diesem Gerät gespeichert — nicht in deinem Finanzpal-Konto und auf keinem Server.
        Auf einem anderen Gerät sind sie nicht sichtbar, und beim Löschen der App gehen sie verloren.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  negative: { color: colors.danger, fontSize: 13, marginTop: -spacing.sm, marginBottom: spacing.sm },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6 },
  input: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm,
    paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: 16, color: colors.text, marginBottom: spacing.md,
  },
  amountRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  euro: { marginLeft: spacing.sm, fontSize: 17, color: colors.muted },
  error: { color: colors.danger, marginBottom: spacing.sm },
  empty: { color: colors.muted, fontSize: 14 },
  catHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  catLabel: { color: colors.text, fontSize: 14 },
  catValue: { color: colors.muted, fontSize: 13 },
  track: { height: 8, backgroundColor: colors.rowAlt, borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, backgroundColor: colors.primary, borderRadius: 4 },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  desc: { color: colors.text, fontSize: 15, fontWeight: '500' },
  kat: { color: colors.muted, fontSize: 12, marginTop: 2 },
  amt: { fontWeight: '700', fontSize: 15, marginLeft: spacing.sm },
  del: { paddingLeft: spacing.md, paddingVertical: 4 },
});
