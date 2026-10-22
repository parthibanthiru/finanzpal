import { supabase } from '@/lib/supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export type ChatReply = {
  reply: string;
  category?: string;
};

/** One earlier message, in the role names the Claude API uses. */
export type HistoryItem = { role: 'user' | 'assistant'; content: string };

/** How many earlier messages go along with each question (keeps requests small and cheap). */
export const HISTORY_LIMIT = 10;

/**
 * Sends a chat message to the Finanzpal backend.
 * The Supabase access token goes along as a Bearer token, so the backend
 * knows which user is asking (see backend-auth/requireUser.js).
 *
 * Backend contract:
 *   POST /api/chat  { sessionId, message, history }  ->  { reply, category? }
 * `history` = the last few saved messages, so the bot keeps context even after an app
 * restart or a backend restart (see backend-auth/chatHistory.js).
 * A backend that ignores `history` keeps working as before.
 */
export async function sendChatMessage(
  sessionId: string,
  message: string,
  history: HistoryItem[] = []
): Promise<ChatReply> {
  if (!API_URL) throw new Error('EXPO_PUBLIC_API_URL ist nicht gesetzt (.env).');

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const res = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ sessionId, message, history: history.slice(-HISTORY_LIMIT) }),
  });

  if (res.status === 401) throw new Error('Sitzung abgelaufen. Bitte melde dich erneut an.');
  if (!res.ok) throw new Error(`Server-Fehler (${res.status}). Bitte später erneut versuchen.`);
  return (await res.json()) as ChatReply;
}
