// Push notifications ("Neue Anbieter und Ratgeber"), opt-in from Profil.
// The device's Expo push token is stored in Supabase (push_tokens, via the
// register_push_token / unregister_push_token functions in supabase/schema.sql) together with
// the app language; .github/workflows/push-notify.yml sends the messages when the website's
// data gains a provider or a guide (mobile/tools/notify-new-data.mjs).
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import { strings, type Lang } from './i18n';

/** on = registered; off = not wanted; denied = blocked in the phone's settings;
 *  unavailable = this build can't receive pushes (no EAS projectId yet, Expo Go, simulator, web). */
export type PushState = 'on' | 'off' | 'denied' | 'unavailable';

const enabledKey = (userId: string) => `fp-push-v1:${userId}`;
const TOKEN_KEY = 'fp-push-token-v1';
export const ANDROID_CHANNEL = 'updates';

/** The EAS project id (set by `eas init`, see mobile/README.md) — needed for an Expo push token. */
export function projectId(): string | undefined {
  const c = Constants as any;
  return c.expoConfig?.extra?.eas?.projectId ?? c.easConfig?.projectId ?? undefined;
}

type TokenResult = { token: string } | { state: Exclude<PushState, 'on' | 'off'> };

async function deviceToken(ask: boolean): Promise<TokenResult> {
  const pid = projectId();
  if (!pid || Platform.OS === 'web') return { state: 'unavailable' };
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL, {
      name: strings().push.channel,
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  let { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted' && ask) ({ status } = await Notifications.requestPermissionsAsync());
  if (status !== 'granted') return { state: 'denied' };
  try {
    return { token: (await Notifications.getExpoPushTokenAsync({ projectId: pid })).data };
  } catch {
    return { state: 'unavailable' }; // e.g. Expo Go on Android, simulator without push support
  }
}

async function register(token: string, lang: Lang) {
  const { error } = await supabase.rpc('register_push_token', {
    p_token: token,
    p_lang: lang,
    p_platform: Platform.OS,
  });
  if (error) throw new Error(error.message);
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function isPushEnabled(userId: string) {
  try {
    return (await AsyncStorage.getItem(enabledKey(userId))) === '1';
  } catch {
    return false;
  }
}

/** Switch on in Profil: asks for permission, registers the token. Throws if the server call fails. */
export async function enablePush(userId: string, lang: Lang): Promise<PushState> {
  const r = await deviceToken(true);
  if ('state' in r) return r.state;
  await register(r.token, lang);
  await AsyncStorage.setItem(enabledKey(userId), '1');
  return 'on';
}

/** Switch off in Profil, and on sign-out (the device then stops getting this account's pushes). */
export async function disablePush(userId: string, { keepChoice = false } = {}) {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) await supabase.rpc('unregister_push_token', { p_token: token });
    await AsyncStorage.removeItem(TOKEN_KEY);
    if (!keepChoice) await AsyncStorage.removeItem(enabledKey(userId));
  } catch {
    // best effort — the sender also drops tokens Expo reports as no longer registered
  }
}

/**
 * On app start and language change: re-register (tokens can change) with the current language.
 * Never asks for permission; does nothing unless the user switched notifications on.
 */
export async function refreshPush(userId: string, lang: Lang) {
  try {
    if (!(await isPushEnabled(userId))) return;
    const r = await deviceToken(false);
    if ('token' in r) await register(r.token, lang);
  } catch {
    // offline etc. — next start tries again
  }
}

/** What a tapped notification should open (data set by tools/notify-new-data.mjs). */
export type PushTarget = { kind: 'compare'; id: string; focus?: string } | { kind: 'site'; page: string };

export function targetOf(data: unknown): PushTarget | null {
  const d = (data ?? {}) as Record<string, unknown>;
  if (d.type === 'compare' && typeof d.id === 'string') {
    return { kind: 'compare', id: d.id, focus: typeof d.focus === 'string' ? d.focus : undefined };
  }
  if (d.type === 'site' && typeof d.page === 'string' && /^[\w-]+\.html(#[\w-]+)?$/.test(d.page)) {
    return { kind: 'site', page: d.page };
  }
  return null;
}
