// Merkliste: providers a user saved, stored in Supabase (table public.favorites, see
// supabase/schema.sql) so the list follows the account to every device.
import { supabase } from './supabase';

export type Favorite = { category: string; itemId: string; createdAt: string };

export const favKey = (category: string, itemId: string) => `${category}:${itemId}`;

export async function fetchFavorites(): Promise<Favorite[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('category, item_id, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({ category: r.category as string, itemId: r.item_id as string, createdAt: r.created_at as string }));
}

export async function addFavorite(userId: string, category: string, itemId: string) {
  const { error } = await supabase
    .from('favorites')
    .upsert({ user_id: userId, category, item_id: itemId }, { onConflict: 'user_id,category,item_id', ignoreDuplicates: true });
  if (error) throw error;
}

export async function removeFavorite(userId: string, category: string, itemId: string) {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('category', category)
    .eq('item_id', itemId);
  if (error) throw error;
}
