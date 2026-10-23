import { useMemo } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFavorites } from '@/context/FavoritesProvider';
import { CATEGORIES, getCategory } from '@/lib/categories';
import { getBundled, type Item } from '@/lib/data';
import { FavoriteButton, ScoreBadge } from '@/components/ProviderCard';
import { fonts, makeStyles, radius, spacing, useColors } from '@/components/theme';

type Row = { category: string; itemId: string; item?: Item };

export default function MerklisteScreen() {
  const styles = useStyles();
  const colors = useColors();
  const router = useRouter();
  const { favorites, loading, toggleFavorite, reload } = useFavorites();

  // Group by comparison, in the same order as the comparison list.
  const groups = useMemo(() => {
    const out: { id: string; title: string; rows: Row[] }[] = [];
    for (const c of CATEGORIES) {
      const items = getBundled(c.file).items;
      const rows = favorites
        .filter((f) => f.category === c.id)
        .map((f) => ({ category: f.category, itemId: f.itemId, item: items.find((i) => i.id === f.itemId) }));
      if (rows.length) out.push({ id: c.id, title: c.title, rows });
    }
    // Favorites of a comparison that no longer exists in the app
    const unknown = favorites.filter((f) => !getCategory(f.category));
    if (unknown.length) out.push({ id: '_', title: 'Sonstige', rows: unknown.map((f) => ({ category: f.category, itemId: f.itemId })) });
    return out;
  }, [favorites]);

  if (loading && !favorites.length) return <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.primary} />;

  return (
    <ScrollView
      contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} tintColor={colors.primary} />}
    >
      {groups.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>♡</Text>
          <Text style={styles.emptyTitle}>Deine Merkliste ist noch leer</Text>
          <Text style={styles.emptyText}>
            Tippe in einem Vergleich auf das Herz bei einem Anbieter, um ihn hier zu speichern. Deine Merkliste ist mit deinem
            Konto verbunden und auf all deinen Geräten verfügbar.
          </Text>
          <Pressable onPress={() => router.back()} style={styles.emptyBtn}>
            <Text style={styles.emptyBtnText}>Zu den Vergleichen</Text>
          </Pressable>
        </View>
      ) : (
        groups.map((g) => (
          <View key={g.id} style={{ marginBottom: spacing.lg }}>
            <Text style={styles.group}>{g.title}</Text>
            {g.rows.map((r) => (
              <View key={r.category + r.itemId} style={styles.row}>
                <Pressable
                  style={styles.rowMain}
                  disabled={!r.item}
                  onPress={() =>
                    router.push({ pathname: '/vergleiche/[id]', params: { id: r.category, focus: r.itemId, from: 'merkliste' } })
                  }
                >
                  <View style={[styles.avatar, { backgroundColor: r.item?.color ?? colors.slate }]}>
                    <Text style={styles.avatarText} numberOfLines={1} adjustsFontSizeToFit>
                      {r.item?.initials ?? '?'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{r.item?.name ?? r.itemId}</Text>
                    {!r.item && <Text style={styles.gone}>Nicht mehr im Vergleich</Text>}
                  </View>
                  {r.item?.score && <ScoreBadge value={r.item.score.value} band={r.item.score.band} />}
                </Pressable>
                <FavoriteButton active onPress={() => toggleFavorite(r.category, r.itemId)} />
              </View>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const useStyles = makeStyles((colors) => ({
  group: { fontSize: 13, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: spacing.sm },
  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm,
  },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md, paddingHorizontal: 3 },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  name: { fontFamily: fonts.display, fontSize: 17, color: colors.text },
  gone: { fontSize: 12, color: colors.danger, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: spacing.xl, paddingHorizontal: spacing.md },
  emptyIcon: { fontSize: 44, color: colors.muted },
  emptyTitle: { fontFamily: fonts.display, fontSize: 20, color: colors.text, marginTop: spacing.sm },
  emptyText: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 20, marginTop: spacing.sm },
  emptyBtn: { marginTop: spacing.lg, borderWidth: 1, borderColor: colors.primary, borderRadius: radius.md, paddingVertical: 10, paddingHorizontal: 18 },
  emptyBtnText: { color: colors.primary, fontWeight: '700' },
}));
