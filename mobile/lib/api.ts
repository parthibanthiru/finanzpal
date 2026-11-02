import { supabase } from '@/lib/supabase';
import { getLang, strings } from '@/lib/i18n';
import { PREVIEW } from '@/lib/preview';

const SUPABASE_URL = (process.env.EXPO_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '');

/**
 * Where the chat goes. Default: the Supabase Edge Function `chat` of the configured project
 * (supabase/functions/chat). EXPO_PUBLIC_API_URL can point to another backend instead:
 * a Supabase functions URL (…/functions/v1) gets `/chat`, any other server `/api/chat`.
 */
export function chatEndpoint(apiUrl = process.env.EXPO_PUBLIC_API_URL ?? '', supabaseUrl = SUPABASE_URL): string {
  const base = apiUrl.trim().replace(/\/$/, '');
  if (!base || base.includes('YOUR-')) return supabaseUrl ? `${supabaseUrl}/functions/v1/chat` : '';
  return /\/functions\/v1$/.test(base) ? `${base}/chat` : `${base}/api/chat`;
}

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
 *   POST {endpoint}  { sessionId, message, history, language }  ->  { reply, category? }
 * `history` = the last few saved messages, so the bot keeps context even after an app
 * restart or a backend restart (see backend-auth/chatHistory.js).
 * `language` = "de" or "en" (the app's language), so the bot can answer in the same language.
 * A backend that ignores `history` or `language` keeps working as before.
 */
export async function sendChatMessage(
  sessionId: string,
  message: string,
  history: HistoryItem[] = []
): Promise<ChatReply> {
  const t = strings().chat;
  if (PREVIEW) throw new Error(strings().preview.chat);
  const endpoint = chatEndpoint();
  if (!endpoint) throw new Error(t.noApiUrl);

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ sessionId, message, history: history.slice(-HISTORY_LIMIT), language: getLang() }),
  });

  if (res.status === 401) throw new Error(t.sessionExpired);
  // 503 = Edge Function deployed but no API key / schema yet; 404 = function not deployed yet.
  if (res.status === 503 || res.status === 404) throw new Error(t.notConfigured);
  if (res.status === 429) throw new Error(t.dailyLimit);
  if (res.status === 400) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    if (body?.error === 'too_long') throw new Error(t.tooLong);
  }
  if (!res.ok) throw new Error(t.serverError(res.status));
  return (await res.json()) as ChatReply;
}
