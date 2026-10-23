import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useI18n } from '@/lib/i18n';
import { disclosure } from '@/lib/disclosures';
import { formatPct } from '@/lib/format';
import { openSite } from '@/lib/site';
import { Etf, EtfFilters, NO_FILTERS, activeFilterCount, etfs, filterEtfs, options } from '@/lib/etf';
import { fonts, makeStyles, radius, spacing, useColors } from '@/components/theme';

const TER_STEPS = [0.1, 0.2, 0.3];

/** Row of selectable chips; `multi` allows several, otherwise one (tap again to clear). */
function Chips<T extends string | number>({
  label, values, selected, onToggle, render,
}: {
  label: string; values: T[]; selected: T[]; onToggle: (v: T) => void; render?: (v: T) => string;
}) {
  const styles = useStyles();
  return (
    <View style={styles.filter}>
      <Text style={styles.filterLabel}>{label}</Text>
      <View style={styles.chips}>
        {values.map((v) => {
          const on = selected.includes(v);
          return (
            <Pressable
              key={String(v)}
              onPress={() => onToggle(v)}
              style={[styles.chip, on && styles.chipOn]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
            >
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{render ? render(v) : String(v)}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function EtfCard({ etf }: { etf: Etf }) {
  const styles = useStyles();
  const { t } = useI18n();
  const L = t.etf;
  const [open, setOpen] = useState(false);
  const row = (k: string, v: string) => (
    <View key={k} style={styles.row}>
      <Text style={styles.k}>{k}</Text>
      <Text style={styles.v}>{v}</Text>
    </View>
  );
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={[styles.avatar, { backgroundColor: etf.color }]}>
          <Text style={styles.avatarText}>{etf.providerInitials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{etf.name}</Text>
          <Text style={styles.sub}>{etf.isin}</Text>
        </View>
        <View style={styles.terBox}>
          <Text style={styles.terValue}>{formatPct(etf.ter)}</Text>
          <Text style={styles.terLabel}>TER</Text>
        </View>
      </View>
      {row(t.etf.klasse, `${etf.anlageklasse} · ${etf.region}`)}
      {row(L.replikation, etf.replikationDetail)}
      {row(L.ausschuettung, etf.ausschuettung)}
      {row(L.fondsgroesse, L.groesseLabel[etf.fondsgroesse])}
      {open && (
        <>
          {row(L.index, etf.index)}
          {row(L.provider, etf.provider)}
          {row(L.domizil, etf.domizil)}
          {row(L.waehrung, etf.waehrung)}
          {row(L.auflagejahr, String(etf.auflagejahr))}
          {row(t.etf.alter, L.alterLabel[etf.fondsalter])}
        </>
      )}
      <Pressable onPress={() => setOpen(!open)} accessibilityRole="button" style={{ marginTop: spacing.sm }}>
        <Text style={styles.link}>{open ? L.hideDetails : L.details} {open ? '▴' : '▾'}</Text>
      </Pressable>
    </View>
  );
}

export default function EtfScreen() {
  const styles = useStyles();
  const colors = useColors();
  const { t, lang } = useI18n();
  const L = t.etf;
  const [f, setF] = useState<EtfFilters>(NO_FILTERS);
  const [more, setMore] = useState(false);

  const all = etfs(lang);
  // asset class / replication / distribution values are language-specific: reset on a language change
  const [filterLang, setFilterLang] = useState(lang);
  if (filterLang !== lang) {
    setFilterLang(lang);
    setF(NO_FILTERS);
  }
  const list = useMemo(() => filterEtfs(all, f), [all, f]);

  const set = (patch: Partial<EtfFilters>) => setF((cur) => ({ ...cur, ...patch }));
  const toggleIn = (key: 'anbieter' | 'replikation' | 'ausschuettung', v: string) =>
    setF((cur) => ({ ...cur, [key]: cur[key].includes(v) ? cur[key].filter((x) => x !== v) : [...cur[key], v] }));
  const single = <T,>(cur: T | null, v: T) => (cur === v ? null : v);
  const count = activeFilterCount(f);

  const header = (
    <View>
      <Text style={styles.intro}>{L.intro}</Text>
      <TextInput
        style={styles.search}
        value={f.query}
        onChangeText={(query) => set({ query })}
        placeholder={L.search}
        placeholderTextColor={colors.muted}
        autoCorrect={false}
        clearButtonMode="while-editing"
        accessibilityLabel={L.search}
      />
      <Chips
        label={L.klasse}
        values={options(lang, 'anlageklasse')}
        selected={f.klasse ? [f.klasse] : []}
        onToggle={(v) => set({ klasse: single(f.klasse, v) })}
      />
      <Chips
        label={L.maxTer}
        values={TER_STEPS}
        selected={f.maxTer != null ? [f.maxTer] : []}
        onToggle={(v) => set({ maxTer: single(f.maxTer, v) })}
        render={(v) => L.terUpTo(formatPct(v))}
      />
      {more && (
        <>
          <Chips label={L.anbieter} values={options(lang, 'provider')} selected={f.anbieter} onToggle={(v) => toggleIn('anbieter', v)} />
          <Chips label={L.replikation} values={options(lang, 'replikation')} selected={f.replikation} onToggle={(v) => toggleIn('replikation', v)} />
          <Chips label={L.ausschuettung} values={options(lang, 'ausschuettung')} selected={f.ausschuettung} onToggle={(v) => toggleIn('ausschuettung', v)} />
          <Chips
            label={L.groesse}
            values={['mittel', 'gross', 'sehrgross'] as NonNullable<EtfFilters['minGroesse']>[]}
            selected={f.minGroesse ? [f.minGroesse] : []}
            onToggle={(v) => set({ minGroesse: single(f.minGroesse, v) })}
            render={(v) => L.groesseMin[v]}
          />
          <Chips
            label={L.alter}
            values={['gt10', '5bis10', 'lt5'] as ('gt10' | '5bis10' | 'lt5')[]}
            selected={f.alter ? [f.alter] : []}
            onToggle={(v) => set({ alter: single(f.alter, v) })}
            render={(v) => L.alterLabel[v]}
          />
          <Chips
            label={L.sort}
            values={['ter', 'name', 'groesse'] as EtfFilters['sort'][]}
            selected={[f.sort]}
            onToggle={(v) => set({ sort: v })}
            render={(v) => ({ ter: L.sortTer, name: L.sortName, groesse: L.sortSize })[v]}
          />
        </>
      )}
      <View style={styles.bar}>
        <Pressable onPress={() => setMore(!more)} accessibilityRole="button">
          <Text style={styles.link}>{more ? L.fewerFilters : L.moreFilters(count)}</Text>
        </Pressable>
        {(count > 0 || f.query) && (
          <Pressable onPress={() => setF({ ...NO_FILTERS, sort: f.sort })} accessibilityRole="button">
            <Text style={styles.link}>{L.reset}</Text>
          </Pressable>
        )}
      </View>
      <Text style={styles.count}>{L.count(list.length)}</Text>
    </View>
  );

  return (
    <FlatList
      data={list}
      keyExtractor={(e) => e.id}
      renderItem={({ item }) => <EtfCard etf={item} />}
      contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={header}
      ListEmptyComponent={<Text style={styles.empty}>{L.noResults}</Text>}
      ListFooterComponent={
        <View>
          {disclosure('etf') ? <Text style={styles.disclosure}>{disclosure('etf')}</Text> : null}
          <Pressable onPress={() => openSite('etf-suche.html')} style={{ marginTop: spacing.md }}>
            <Text style={styles.link}>{t.compare.onSite}</Text>
          </Pressable>
        </View>
      }
    />
  );
}

const useStyles = makeStyles((colors) => ({
  intro: { fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: spacing.md },
  search: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 11, fontSize: 16, color: colors.text, marginBottom: spacing.md,
  },
  filter: { marginBottom: spacing.md },
  filterLabel: { fontSize: 13, fontWeight: '700', color: colors.muted, marginBottom: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 12 },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontSize: 13, fontWeight: '500' },
  chipTextOn: { color: colors.onPrimary },
  bar: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  link: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  count: { color: colors.muted, fontSize: 13, marginBottom: spacing.sm },
  empty: { color: colors.muted, fontSize: 14, marginVertical: spacing.lg, textAlign: 'center' },
  card: {
    backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  avatar: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  name: { fontFamily: fonts.display, fontSize: 16, color: colors.text, lineHeight: 21 },
  sub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  terBox: { alignItems: 'flex-end', marginLeft: spacing.sm },
  terValue: { fontSize: 17, fontWeight: '800', color: colors.primaryDark },
  terLabel: { fontSize: 11, color: colors.muted },
  row: { flexDirection: 'row', paddingVertical: 6, borderTopWidth: 0.5, borderTopColor: colors.border },
  k: { flex: 1, color: colors.muted, fontSize: 13, paddingRight: spacing.sm },
  v: { flex: 1.4, color: colors.text, fontSize: 13, fontWeight: '500' },
  disclosure: { fontSize: 12, color: colors.muted, lineHeight: 17, marginTop: spacing.md },
}));
