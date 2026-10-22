import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { getCategory } from '@/lib/categories';
import { DataFile, formatUpdated, loadData } from '@/lib/data';
import { openSite } from '@/lib/site';
import { disclosure } from '@/lib/disclosures';
import { ProviderCard } from '@/components/ProviderCard';
import { colors, radius, spacing } from '@/components/theme';

type Sort = 'standard' | 'score';

export default function CategoryScreen() {
  // focus = provider id to scroll to and highlight (from the Finanz-Check)
  const { id, focus } = useLocalSearchParams<{ id: string; focus?: string }>();
  const listRef = useRef<FlatList>(null);
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

  const focusIndex = focus ? items.findIndex((i) => i.id === focus) : -1;
  useEffect(() => {
    if (focusIndex < 0) return;
    // Give the list a moment to lay out, then scroll the recommended provider into view.
    const t = setTimeout(() => listRef.current?.scrollToIndex({ index: focusIndex, viewOffset: 12, animated: true }), 350);
    return () => clearTimeout(t);
  }, [focusIndex]);

  if (!cat) return <Text style={{ padding: spacing.lg }}>Kategorie nicht gefunden.</Text>;

  return (
    <>
      <Stack.Screen options={{ title: cat.title }} />
      {!data ? (
        <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.primary} />
      ) : (
        <FlatList
          ref={listRef}
          data={items}
          onScrollToIndexFailed={(info) => {
            // Cards have different heights: jump near the target first, then retry precisely.
            listRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: false });
            setTimeout(() => listRef.current?.scrollToIndex({ index: info.index, viewOffset: 12, animated: true }), 120);
          }}
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
          renderItem={({ item }) => (
            <ProviderCard item={item} fields={cat.fields(item)} highlight={item.id === focus ? 'Dein Finanz-Check-Ergebnis' : undefined} />
          )}
          ListFooterComponent={
            <View>
              {disclosure(cat.file) ? <Text style={styles.disclosure}>{disclosure(cat.file)}</Text> : null}
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
