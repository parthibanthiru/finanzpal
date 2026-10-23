import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './AuthProvider';
import { Favorite, addFavorite, favKey, fetchFavorites, removeFavorite } from '@/lib/favorites';

type FavoritesContextValue = {
  favorites: Favorite[];          // newest first
  loading: boolean;
  isFavorite: (category: string, itemId: string) => boolean;
  toggleFavorite: (category: string, itemId: string) => void;
  reload: () => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }
    setLoading(true);
    try {
      setFavorites(await fetchFavorites());
    } catch (e) {
      console.warn('[Finanzpal] Merkliste konnte nicht geladen werden:', (e as Error)?.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    reload();
  }, [reload]);

  const keys = useMemo(() => new Set(favorites.map((f) => favKey(f.category, f.itemId))), [favorites]);

  const isFavorite = useCallback((category: string, itemId: string) => keys.has(favKey(category, itemId)), [keys]);

  // Optimistic: the heart changes immediately; if saving fails, it flips back and the user is told.
  const toggleFavorite = useCallback(
    (category: string, itemId: string) => {
      if (!user) return;
      const key = favKey(category, itemId);
      const wasFav = keys.has(key);
      const previous = favorites;
      setFavorites(
        wasFav
          ? favorites.filter((f) => favKey(f.category, f.itemId) !== key)
          : [{ category, itemId, createdAt: new Date().toISOString() }, ...favorites]
      );
      (wasFav ? removeFavorite(user.id, category, itemId) : addFavorite(user.id, category, itemId)).catch(() => {
        setFavorites(previous);
        Alert.alert('Merkliste', 'Das hat leider nicht geklappt. Bitte prüfe deine Internetverbindung und versuche es erneut.');
      });
    },
    [user?.id, keys, favorites]
  );

  return (
    <FavoritesContext.Provider value={{ favorites, loading, isFavorite, toggleFavorite, reload }}>{children}</FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used inside <FavoritesProvider>');
  return ctx;
}
