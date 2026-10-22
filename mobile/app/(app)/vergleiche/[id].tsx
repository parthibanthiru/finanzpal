import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { getCategory } from '@/lib/categories';
import { DataFile, formatUpdated, loadData } from '@/lib/data';
import { openSite } from '@/lib/site';
import { ProviderCard } from '@/components/ProviderCard';
import { colors, radius, spacing } from '@/components/theme';

const DISCLOSURES: Record<string, string> = require('../../../data/disclosures.json');

type Sort = 'standard' | 'score';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const cat = getCategory(String(id));
  const [data, setData] = useState<DataFile | null>(null);
  const [sort, setSort] = useState<Sort>('standard');

  useEffect(() => {
    if (cat) loadData(cat.file).then(setData);
  }, [cat?.file]);

  const hasScores = !!data?.items.some((i) => i.score);
  const items = useMemo(() => {
    if (!data) return [];
    // "standard" = the website's own order (independent of commissions, see disclosure).
    if (sort === 'score') return [...data.items].sort((a, b) => (b.score?.value ?? -1) - (a.score?.value ?? -1));
    return data.items;
  }, [data, sort]);

  if (!cat) return <Text style={{ padding: spacing.lg }}>Kategorie nicht gefunden.</Text>;

  return (
    <>
      <Stack.Screen options={{ title: cat.title }} />
      {!data ? (
        <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.primary} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
          ListHeaderComponent={
            <View>
              <Text style={styles.meta}>
                {data.items.length} Anbieter{data.updated ? ` · Stand ${formatUpdated(data.updated)}` : ''}
              </Text>
              {cat.topNote ? <Text style={styles.info}>{cat.topNote}</Text> : null}
              {data.profileNote ? <Text style={styles.info}>{data.profileNote}</Text> : null}
              {hasScores && (
                <View style={styles.sortRow}>
                  <Text style={styles.sortLabel}>Sortieren:</Text>
                  {(['standard', 'score'] as Sort[]).map((s) => (
                    <Pressable key={s} onPress={() => setSort(s)} style={[styles.chip, sort === s && styles.chipOn]}>
                      <Text style={[styles.chipText, sort === s && { color: '#fff' }]}>
                        {s === 'standard' ? 'Standard' : 'Finanzpal-Score'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          }
          renderItem={({ item }) => <ProviderCard item={item} fields={cat.fields(item)} />}
          ListFooterComponent={
            <View>
              {DISCLOSURES[cat.file] ? <Text style={styles.disclosure}>{DISCLOSURES[cat.file]}</Text> : null}
              <View style={styles.footerLinks}>
                {hasScores && (
                  <Pressable onPress={() => openSite('ueber-uns.html#finanzpal-score')}>
                    <Text style={styles.link}>Wie berechnen wir den Score?</Text>
                  </Pressable>
                )}
                <Pressable onPress={() => openSite(cat.page)}>
                  <Text style={styles.link}>Auf finanzpal.de ansehen</Text>
                </Pressable>
              </View>
            </View>
          }
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  meta: { color: colors.muted, fontSize: 13, marginBottom: spacing.sm },
  info: {
    backgroundColor: colors.tag,
    color: colors.primaryDark,
    padding: spacing.sm + 4,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
    fontSize: 13,
    lineHeight: 19,
    overflow: 'hidden',
  },
  sortRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: spacing.sm },
  sortLabel: { color: colors.muted, fontSize: 13 },
  chip: { borderWidth: 1, borderColor: colors.primary, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12 },
  chipOn: { backgroundColor: colors.primary },
  chipText: { color: colors.primary, fontWeight: '600', fontSize: 13 },
  disclosure: { fontSize: 12, color: colors.muted, lineHeight: 17, marginTop: spacing.sm },
  footerLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.md },
  link: { color: colors.primary, fontWeight: '600', textDecorationLine: 'underline', fontSize: 14 },
});
