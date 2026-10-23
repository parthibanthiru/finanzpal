import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '@/context/AuthProvider';
import {
  Buchung, KATEGORIEN, Typ, katLabel, loadBuchungen, newBuchung, saveBuchungen, summarize,
} from '@/lib/haushaltsbuch';
import { formatDate, formatEURCents, formatPct, parseNumber } from '@/lib/format';
import { useT } from '@/lib/i18n';
import { ChoiceField, ResultTile, useCalcStyles } from '@/components/CalcUI';
import { Button } from '@/components/ui';
import { makeStyles, radius, spacing, useColors } from '@/components/theme';

export default function HaushaltsbuchScreen() {
  const styles = useStyles();
  const calcStyles = useCalcStyles();
  const colors = useColors();
  const t = useT();
  const L = t.calc.haushalt;
  const { user } = useAuth();
  const userId = user?.id ?? 'anon';
  const [items, setItems] = useState<Buchung[] | null>(null);
  const [typ, setTyp] = useState<Typ>('ausgabe');
  const [kategorie, setKategorie] = useState(KATEGORIEN.ausgabe[0]);
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
    setKategorie(KATEGORIEN[t][0]);
  }

  function add() {
    const value = parseNumber(betrag);
    if (!value || value <= 0) return setError(L.errAmount);
    setError(null);
    update([...(items ?? []), newBuchung(typ, kategorie, beschreibung, value)]);
    setBetrag('');
    setBeschreibung('');
  }

  function reset() {
    if (!items?.length) return;
    Alert.alert(L.resetTitle, L.resetText, [
      { text: t.common.cancel, style: 'cancel' },
      { text: t.common.delete, style: 'destructive', onPress: () => update([]) },
    ]);
  }

  if (!items) return <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.primary} />;

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }} keyboardShouldPersistTaps="handled">
      <View style={calcStyles.tiles}>
        <ResultTile label={L.income} value={formatEURCents(sum.einnahmen)} />
        <ResultTile label={L.expenses} value={formatEURCents(sum.ausgaben)} />
        <ResultTile strong label={L.balance} value={formatEURCents(sum.saldo)} />
      </View>
      {sum.saldo < 0 && <Text style={styles.negative}>{L.negative}</Text>}

      <Text style={calcStyles.section}>{L.newEntry}</Text>
      <ChoiceField
        label={L.type}
        value={typ}
        onChange={changeTyp}
        options={[
          { value: 'ausgabe', label: L.expense },
          { value: 'einnahme', label: L.incomeOne },
        ]}
      />
      <ChoiceField label={L.category} value={kategorie} onChange={setKategorie} options={KATEGORIEN[typ].map((k) => ({ value: k, label: katLabel(k, t) }))} />
      <Text style={styles.label}>{L.description}</Text>
      <TextInput style={styles.input} value={beschreibung} onChangeText={setBeschreibung} placeholder={L.descPlaceholder} placeholderTextColor={colors.muted} />
      <Text style={styles.label}>{L.amount}</Text>
      <View style={styles.amountRow}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          value={betrag}
          onChangeText={setBetrag}
          keyboardType="decimal-pad"
          placeholder={L.amountPlaceholder}
          placeholderTextColor={colors.muted}
          onSubmitEditing={add}
        />
        <Text style={styles.euro}>€</Text>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title={L.add} onPress={add} />

      <Text style={calcStyles.section}>{L.byCategory}</Text>
      {sum.breakdown.length === 0 ? (
        <Text style={styles.empty}>{L.noExpenses}</Text>
      ) : (
        sum.breakdown.map((r) => (
          <View key={r.katId} style={{ marginBottom: spacing.sm }}>
            <View style={styles.catHead}>
              <Text style={styles.catLabel}>{katLabel(r.katId, t)}</Text>
              <Text style={styles.catValue}>
                {formatEURCents(r.betrag)} · {formatPct(r.pct, 0)}
              </Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${r.pct}%` }]} />
            </View>
          </View>
        ))
      )}

      <Text style={calcStyles.section}>{L.entries}</Text>
      {sorted.length === 0 ? (
        <Text style={styles.empty}>{L.empty}</Text>
      ) : (
        sorted.map((tx) => (
          <View key={tx.id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.desc}>{tx.beschreibung || katLabel(tx.kategorie, t)}</Text>
              <Text style={styles.kat}>
                {katLabel(tx.kategorie, t)} · {formatDate(tx.createdAt)}
              </Text>
            </View>
            <Text style={[styles.amt, { color: tx.typ === 'einnahme' ? colors.pal : colors.danger }]}>
              {tx.typ === 'einnahme' ? '+' : '−'} {formatEURCents(Math.abs(tx.betrag))}
            </Text>
            <Pressable
              onPress={() => update(items.filter((x) => x.id !== tx.id))}
              style={styles.del}
              accessibilityLabel={t.common.delete}
              hitSlop={8}
            >
              <Text style={{ color: colors.muted, fontSize: 18 }}>×</Text>
            </Pressable>
          </View>
        ))
      )}
      {sorted.length > 0 && (
        <Pressable onPress={reset} style={{ marginTop: spacing.md }}>
          <Text style={{ color: colors.danger, fontWeight: '600' }}>{L.deleteAll}</Text>
        </Pressable>
      )}

      <Text style={calcStyles.disclaimer}>{L.storageNote}</Text>
    </ScrollView>
  );
}

const useStyles = makeStyles((colors) => ({
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
}));
