// Merkliste: providers a user saved, stored in Supabase (table public.favorites, see
// supabase/schema.sql) so the list follows the account to every device.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { PREVIEW } from './preview';

export type Favorite = { category: string; itemId: string; createdAt: string };

export const favKey = (category: string, itemId: string) => `${category}:${itemId}`;

// Preview mode: the list lives in this browser/device only.
const PREVIEW_KEY = 'fp-preview-favorites-v1';
async function previewList(): Promise<Favorite[]> {
  try {
    return JSON.parse((await AsyncStorage.getItem(PREVIEW_KEY)) ?? '[]');
  } catch {
    return [];
  }
}
const previewSave = (list: Favorite[]) => AsyncStorage.setItem(PREVIEW_KEY, JSON.stringify(list));

export async function fetchFavorites(): Promise<Favorite[]> {
  if (PREVIEW) return previewList();
  const { data, error } = await supabase
    .from('favorites')
    .select('category, item_id, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({ category: r.category as string, itemId: r.item_id as string, createdAt: r.created_at as string }));
}

export async function addFavorite(userId: string, category: string, itemId: string) {
  if (PREVIEW) {
    const list = await previewList();
    if (!list.some((f) => f.category === category && f.itemId === itemId)) {
      await previewSave([{ category, itemId, createdAt: new Date().toISOString() }, ...list]);
    }
    return;
  }
  const { error } = await supabase
    .from('favorites')
    .upsert({ user_id: userId, category, item_id: itemId }, { onConflict: 'user_id,category,item_id', ignoreDuplicates: true });
  if (error) throw error;
}

export async function removeFavorite(userId: string, category: string, itemId: string) {
  if (PREVIEW) {
    await previewSave((await previewList()).filter((f) => !(f.category === category && f.itemId === itemId)));
    return;
  }
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('category', category)
    .eq('item_id', itemId);
  if (error) throw error;
}
