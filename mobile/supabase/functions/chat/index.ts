// Finanzpal chatbot as a Supabase Edge Function (Deno).
//
// Contract (same as mobile/lib/api.ts):
//   POST /functions/v1/chat   { sessionId, message, history, language }  ->  { reply, category? }
//   Authorization: Bearer <the user's Supabase access token>
//
// Secrets (Supabase → Edge Functions → Secrets):
//   ANTHROPIC_API_KEY   required — without it the function answers 503 {error:"not_configured"}
//   CHAT_MODEL          optional, default "claude-haiku-5-5"
//   CHAT_DAILY_LIMIT    optional, messages per user per day (UTC), default 30
// SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY are provided by Supabase automatically.
//
// Errors: 401 no/invalid login · 400 bad request · 429 {error:"daily_limit"} · 503 not configured ·
// 502 the model API failed. The app maps these to friendly texts (lib/api.ts).
//
// Deploy: `supabase functions deploy chat` (see mobile/README.md). The table `chat_usage` and the
// function `bump_chat_usage` come from mobile/supabase/schema.sql.

import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const MAX_MESSAGE = 2000; // characters per user message
const MAX_HISTORY = 10; // same as HISTORY_LIMIT in the app
const MAX_TOKENS = 700;

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

function systemPrompt(lang: 'de' | 'en'): string {
  const language =
    lang === 'en'
      ? 'Answer in English.'
      : 'Antworte auf Deutsch und duze die Nutzerin / den Nutzer (wie die Finanzpal-App).';
  return [
    'You are the Finanzpal assistant inside the Finanzpal app. Finanzpal is a German personal-finance',
    'comparison site (Tagesgeld, Festgeld, Girokonto, Kreditkarte, Broker/Depot, ETF, Kinderdepot,',
    'Kredite, Baufinanzierung, insurances such as Haftpflicht, Hausrat, BU, Kfz) with calculators and guides.',
    '',
    'Rules:',
    '- Give general, neutral information and explain concepts clearly and briefly (a few short paragraphs at most).',
    '- No individual investment, insurance, tax or legal advice. Do not tell the user which specific',
    '  product to buy. For decisions that depend on personal circumstances, say so and suggest a',
    '  qualified advisor (e.g. Verbraucherzentrale, Honorarberater, Steuerberater).',
    '- Never state concrete interest rates, prices, fees, premiums or ratings of specific providers —',
    '  they change and you cannot verify them. Point to the comparisons in the app instead',
    '  ("Vergleiche" tab), which show the current data with sources.',
    '- If you are unsure or a figure depends on the individual case, say so explicitly instead of guessing.',
    '- General, stable facts (e.g. how the Sparerpauschbetrag or the deposit guarantee works) are fine;',
    '  mention that figures can change and should be checked with an official source.',
    '- Stay on personal-finance topics; politely decline unrelated requests.',
    '- ' + language,
  ].join('\n');
}

type Msg = { role: 'user' | 'assistant'; content: string };

/** Keeps only valid items, starts with a user turn and merges consecutive turns of the same role. */
function cleanHistory(raw: unknown): Msg[] {
  if (!Array.isArray(raw)) return [];
  const out: Msg[] = [];
  for (const item of raw.slice(-MAX_HISTORY)) {
    if (!item || typeof item !== 'object') continue;
    const { role, content } = item as Record<string, unknown>;
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string' || !content.trim()) continue;
    const text = content.slice(0, MAX_MESSAGE * 2);
    const last = out[out.length - 1];
    if (last && last.role === role) last.content += '\n\n' + text;
    else out.push({ role, content: text });
  }
  while (out.length && out[0].role !== 'user') out.shift();
  return out;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' });

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) return json(503, { error: 'not_configured' });

  // --- who is asking ---
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!token) return json(401, { error: 'unauthorized' });
  const url = Deno.env.get('SUPABASE_URL')!;
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) return json(401, { error: 'unauthorized' });
  const userId = userData.user.id;

  // --- request body ---
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'bad_request' });
  }
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message) return json(400, { error: 'bad_request' });
  if (message.length > MAX_MESSAGE) return json(400, { error: 'too_long' });
  const lang: 'de' | 'en' = body.language === 'en' ? 'en' : 'de';

  // --- daily limit (counted before the model call, so failed calls also count) ---
  const limit = Math.max(1, Number(Deno.env.get('CHAT_DAILY_LIMIT') ?? '30') || 30);
  const { data: used, error: usageError } = await admin.rpc('bump_chat_usage', { p_user: userId });
  if (usageError) {
    console.error('chat_usage', usageError.message);
    return json(503, { error: 'not_configured' }); // schema.sql not run yet
  }
  if (typeof used === 'number' && used > limit) return json(429, { error: 'daily_limit', limit });

  // --- ask the model ---
  const messages: Msg[] = [...cleanHistory(body.history), { role: 'user', content: message }];
  // The history may end with a user turn (e.g. a message whose answer failed): merge it.
  const merged = cleanHistory(messages);

  let res: Response;
  try {
    res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: Deno.env.get('CHAT_MODEL') || 'claude-haiku-5-5',
        max_tokens: MAX_TOKENS,
        system: systemPrompt(lang),
        messages: merged,
      }),
    });
  } catch (e) {
    console.error('anthropic fetch', String(e));
    return json(502, { error: 'upstream' });
  }
  if (!res.ok) {
    console.error('anthropic', res.status, (await res.text()).slice(0, 500));
    return json(502, { error: 'upstream' });
  }
  const data = await res.json();
  const reply = Array.isArray(data?.content)
    ? data.content
        .filter((b: { type?: string }) => b?.type === 'text')
        .map((b: { text: string }) => b.text)
        .join('\n')
        .trim()
    : '';
  if (!reply) return json(502, { error: 'upstream' });
  return json(200, { reply });
});
