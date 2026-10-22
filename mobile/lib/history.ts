import { supabase } from '@/lib/supabase';

export type ChatMsg = { id: string; role: 'user' | 'bot'; text: string };

/** Loads the newest `limit` messages of the logged-in user, oldest first. */
export async function loadHistory(limit = 100): Promise<ChatMsg[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('id, role, content')
    .order('id', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? [])
    .reverse()
    .map((r) => ({ id: String(r.id), role: r.role as 'user' | 'bot', text: r.content as string }));
}

/** Saves a question + answer pair. Failures are logged, never shown – the chat keeps working. */
export async function saveExchange(userId: string, question: string, answer: string) {
  const { error } = await supabase.from('messages').insert([
    { user_id: userId, role: 'user', content: question.slice(0, 8000) },
    { user_id: userId, role: 'bot', content: answer.slice(0, 8000) },
  ]);
  if (error) console.warn('[Finanzpal] Verlauf konnte nicht gespeichert werden:', error.message);
}

export async function clearHistory(userId: string) {
  const { error } = await supabase.from('messages').delete().eq('user_id', userId);
  if (error) throw error;
}
