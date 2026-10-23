import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { getCategory } from '@/lib/categories';
import { useI18n } from '@/lib/i18n';
import { DataFile, formatUpdated, loadData } from '@/lib/data';
import { openSite } from '@/lib/site';
import { disclosure } from '@/lib/disclosures';
import { ProviderCard } from '@/components/ProviderCard';
import { useFavorites } from '@/context/FavoritesProvider';
import { makeStyles, radius, spacing, useColors } from '@/components/theme';

type Sort = 'standard' | 'score';

export default function CategoryScreen() {
  const styles = useStyles();
  const colors = useColors();
  const { t, lang } = useI18n();
  // focus = provider id to scroll to and highlight (from the Finanz-Check)
  // from = where the link came from ('merkliste' or the Finanz-Check by default), for the highlight label
  const { id, focus, from } = useLocalSearchParams<{ id: string; focus?: string; from?: string }>();
  const highlightLabel = from === 'merkliste' ? t.compare.highlightFav : t.compare.highlightCheck;
  const listRef = useRef<FlatList>(null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const cat = getCategory(String(id));
  const [data, setData] = useState<DataFile | null>(null);
  const [sort, setSort] = useState<Sort>('standard');

  useEffect(() => {
    if (cat) loadData(cat.file, lang).then(setData);
  }, [cat?.file, lang]);

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

  if (!cat) return <Text style={{ padding: spacing.lg }}>{t.compare.notFound}</Text>;
  const text = t.categories[cat.id];

  return (
    <>
      <Stack.Screen options={{ title: text.title }} />
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
                {t.common.providers(data.items.length)}{data.updated ? ` · ${t.compare.asOf(formatUpdated(data.updated) ?? '')}` : ''}
              </Text>
              {text.topNote ? <Text style={styles.info}>{text.topNote}</Text> : null}
              {data.profileNote ? <Text style={styles.info}>{data.profileNote}</Text> : null}
              {hasScores && (
                <View style={styles.sortRow}>
                  <Text style={styles.sortLabel}>{t.compare.sortLabel}</Text>
                  {(['standard', 'score'] as Sort[]).map((s) => (
                    <Pressable key={s} onPress={() => setSort(s)} style={[styles.chip, sort === s && styles.chipOn]}>
                      <Text style={[styles.chipText, sort === s && { color: colors.onPrimary }]}>
                        {s === 'standard' ? t.compare.sortStandard : t.compare.sortScore}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <ProviderCard
              item={item}
              file={cat.file}
              fields={cat.fields(item, t)}
              highlight={item.id === focus ? highlightLabel : undefined}
              favorite={isFavorite(cat.id, item.id)}
              onToggleFavorite={() => toggleFavorite(cat.id, item.id)}
            />
          )}
          ListFooterComponent={
            <View>
              {disclosure(cat.file) ? <Text style={styles.disclosure}>{disclosure(cat.file)}</Text> : null}
              <View style={styles.footerLinks}>
                {hasScores && (
                  <Pressable onPress={() => openSite('ueber-uns.html#finanzpal-score')}>
                    <Text style={styles.link}>{t.compare.scoreHow}</Text>
                  </Pressable>
                )}
                <Pressable onPress={() => openSite(cat.page)}>
                  <Text style={styles.link}>{t.compare.onSite}</Text>
                </Pressable>
              </View>
            </View>
          }
        />
      )}
    </>
  );
}

const useStyles = makeStyles((colors) => ({
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
}));
