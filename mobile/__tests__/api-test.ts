// Chat client (lib/api.ts): endpoint choice and the friendly texts for the Edge Function's answers.
import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { chatEndpoint, sendChatMessage } from '@/lib/api';
import { strings } from '@/lib/i18n';

const SB = 'https://xliitgcsiikzxppazbfa.supabase.co';

describe('chatEndpoint', () => {
  it('defaults to the Supabase Edge Function', () => {
    expect(chatEndpoint('', SB)).toBe(`${SB}/functions/v1/chat`);
    expect(chatEndpoint('https://YOUR-BACKEND-URL', SB)).toBe(`${SB}/functions/v1/chat`);
  });
  it('appends /chat to a functions URL and /api/chat to other servers', () => {
    expect(chatEndpoint(`${SB}/functions/v1/`, SB)).toBe(`${SB}/functions/v1/chat`);
    expect(chatEndpoint('http://192.168.0.23:3000', SB)).toBe('http://192.168.0.23:3000/api/chat');
  });
  it('is empty when nothing is configured', () => {
    expect(chatEndpoint('', '')).toBe('');
  });
});

describe('sendChatMessage', () => {
  const realFetch = global.fetch;
  process.env.EXPO_PUBLIC_API_URL = `${SB}/functions/v1`;
  afterEach(() => {
    global.fetch = realFetch;
  });
  const respond = (status: number, body: unknown) => {
    const fn = jest.fn(async (_url: string, _init?: RequestInit) => ({
      status,
      ok: status >= 200 && status < 300,
      json: async () => body,
    }));
    global.fetch = fn as unknown as typeof fetch;
    return fn;
  };
  const t = strings('de').chat;
  const send = () => sendChatMessage('s1', 'Was ist Tagesgeld?', []);

  it('returns the reply and sends the token + language', async () => {
    const fn = respond(200, { reply: 'Hallo' });
    await expect(send()).resolves.toEqual({ reply: 'Hallo' });
    const init = fn.mock.calls[0][1] as RequestInit;
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer test-token');
    expect(JSON.parse(String(init.body))).toMatchObject({ sessionId: 's1', language: 'de' });
  });
  it('maps 503 / 404 to "chat not set up yet"', async () => {
    respond(503, { error: 'not_configured' });
    await expect(send()).rejects.toThrow(t.notConfigured);
    respond(404, {});
    await expect(send()).rejects.toThrow(t.notConfigured);
  });
  it('maps 429 to the daily limit text', async () => {
    respond(429, { error: 'daily_limit' });
    await expect(send()).rejects.toThrow(t.dailyLimit);
  });
  it('maps 400 too_long and 401', async () => {
    respond(400, { error: 'too_long' });
    await expect(send()).rejects.toThrow(t.tooLong);
    respond(401, {});
    await expect(send()).rejects.toThrow(t.sessionExpired);
  });
});
