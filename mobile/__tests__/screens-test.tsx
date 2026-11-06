// Renders every screen of the app in German and English, light and dark, and checks that
// it shows its expected text, no "undefined"/"NaN"/"[object Object]", and logs no errors.
// Then walks through the main interactions. Runs in the GitHub check (Screen tests step).
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { LANGS, SCHEMES, renderScreen, settle, visibleText } from '../test/render';
import { strings, type Lang, type Strings } from '@/lib/i18n';
import { CATEGORIES } from '@/lib/categories';
import { getBundled } from '@/lib/data';
import { disclosure } from '@/lib/disclosures';
import { calcLoan } from '@/lib/calc';
import { formatEURCents } from '@/lib/format';
import { CATEGORY_KEYS, CATEGORY_META, QUESTIONS, label, topPick } from '@/lib/finanzCheck';
import { NO_FILTERS, etfs, filterEtfs, options } from '@/lib/etf';
import { scoreRows } from '@/lib/scoreLabels';
import { search } from '@/lib/search';
import { targetOf } from '@/lib/push';
import { MAX_CHIP_WIDTH, NARROW_MAX_CHIP_WIDTH, ProviderMark, chipWidth, hasLogo, logoAspect } from '@/components/ProviderMark';

import HomeScreen from '@/app/(app)/vergleiche/index';
import CategoryScreen from '@/app/(app)/vergleiche/[id]';
import FinanzCheckScreen from '@/app/(app)/vergleiche/finanz-check';
import MerklisteScreen from '@/app/(app)/vergleiche/merkliste';
import EtfScreen from '@/app/(app)/vergleiche/etf';
import RechnerScreen from '@/app/(app)/rechner/index';
import SparplanScreen from '@/app/(app)/rechner/sparplan';
import ZinseszinsScreen from '@/app/(app)/rechner/zinseszins';
import KreditScreen from '@/app/(app)/rechner/kredit';
import BaufinanzierungScreen from '@/app/(app)/rechner/baufinanzierung';
import NettolohnScreen from '@/app/(app)/rechner/nettolohn';
import AltersvorsorgeScreen from '@/app/(app)/rechner/altersvorsorge';
import HaushaltsbuchScreen from '@/app/(app)/rechner/haushaltsbuch';
import RatgeberScreen from '@/app/(app)/ratgeber';
import ChatScreen from '@/app/(app)/chat';
import ProfileScreen from '@/app/(app)/profile';
import LoginScreen from '@/app/(auth)/login';
import RegisterScreen from '@/app/(auth)/register';
import ForgotPasswordScreen from '@/app/(auth)/forgot-password';
import ResetPasswordScreen from '@/app/(auth)/reset-password';
import AuthCallbackScreen from '@/app/(auth)/auth-callback';
import { friendlyAuthError } from '@/lib/authErrors';
import { ThemeProvider } from '@/context/ThemeProvider';
import { LanguageProvider } from '@/context/LanguageProvider';
import { AuthProvider } from '@/context/AuthProvider';
import { FavoritesProvider } from '@/context/FavoritesProvider';

// ── fail on any console.error (React warnings, crashes inside effects …)
let errors: string[] = [];
beforeEach(() => {
  errors = [];
  jest.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    const msg = args.map(String).join(' ');
    // act() hints about async state updates are test-harness noise, not app errors
    if (/not wrapped in act/.test(msg)) return;
    errors.push(msg);
  });
});
afterEach(() => {
  jest.restoreAllMocks();
  expect(errors).toEqual([]);
});

function expectCleanText() {
  const bad = visibleText(screen.toJSON()).filter((s) => /undefined|NaN|\[object Object\]/.test(s));
  expect(bad).toEqual([]);
}

type Case = { name: string; Screen: React.ComponentType; params?: Record<string, string>; expect: (t: Strings, lang: Lang) => string };

const CASES: Case[] = [
  { name: 'Home (Vergleiche)', Screen: HomeScreen, expect: (t) => t.home.hero },
  ...CATEGORIES.map(
    (c): Case => ({
      name: `Vergleich: ${c.id}`,
      Screen: CategoryScreen,
      params: { id: c.id },
      expect: (t, lang) => c.fields(getBundled(c.file, lang).items[0], t)[0].label,
    })
  ),
  { name: 'Finanz-Check', Screen: FinanzCheckScreen, expect: (t, lang) => label(QUESTIONS[0].text, lang) },
  { name: 'Merkliste', Screen: MerklisteScreen, expect: (t) => t.favorites.emptyTitle },
  { name: 'ETF-Suche', Screen: EtfScreen, expect: (t) => t.etf.intro },
  { name: 'Rechner (Liste)', Screen: RechnerScreen, expect: (t) => t.calc.list.sparplan.title },
  { name: 'Sparplanrechner', Screen: SparplanScreen, expect: (t) => t.calc.savings.introSparplan },
  { name: 'Zinseszinsrechner', Screen: ZinseszinsScreen, expect: (t) => t.calc.savings.introZinseszins },
  { name: 'Kreditrechner', Screen: KreditScreen, expect: (t) => t.calc.kredit.intro },
  { name: 'Baufinanzierungsrechner', Screen: BaufinanzierungScreen, expect: (t) => t.calc.baufi.intro },
  { name: 'Brutto-Netto-Rechner', Screen: NettolohnScreen, expect: (t) => t.calc.netto.intro },
  { name: 'Altersvorsorge-Rechner', Screen: AltersvorsorgeScreen, expect: (t) => t.calc.alters.intro },
  { name: 'Haushaltsbuch', Screen: HaushaltsbuchScreen, expect: (t) => t.calc.haushalt.newEntry },
  { name: 'Ratgeber', Screen: RatgeberScreen, expect: (t) => t.guides.intro },
  { name: 'Chat', Screen: ChatScreen, expect: (t) => t.chat.disclaimer },
  { name: 'Profil', Screen: ProfileScreen, expect: (t) => t.profile.signedInAs },
  { name: 'Login', Screen: LoginScreen, expect: (t) => t.auth.login.title },
  { name: 'Registrieren', Screen: RegisterScreen, expect: (t) => t.auth.register.title },
  { name: 'Passwort vergessen', Screen: ForgotPasswordScreen, expect: (t) => t.auth.forgot.title },
  { name: 'Neues Passwort (Link ok)', Screen: ResetPasswordScreen, params: { code: 'c1' }, expect: (t) => t.auth.reset.subtitle },
  { name: 'Neues Passwort (Link abgelaufen)', Screen: ResetPasswordScreen, params: { error_code: 'otp_expired' }, expect: (t) => t.auth.errors.linkInvalid },
  { name: 'E-Mail-Link (wird geprüft)', Screen: AuthCallbackScreen, params: { code: 'c2' }, expect: (t) => t.auth.callback.checking },
  { name: 'E-Mail-Link (fehlgeschlagen)', Screen: AuthCallbackScreen, params: {}, expect: (t) => t.auth.callback.failed },
];

describe.each(LANGS)('every screen renders (%s)', (lang) => {
  const t = strings(lang);
  describe.each(SCHEMES)('%s theme', (scheme) => {
    it.each(CASES.map((c) => [c.name, c] as const))('%s', async (_name, c) => {
      await renderScreen(c.Screen, { lang, scheme, params: c.params });
      // labels like "Kontoführung" appear on every provider card, so any number ≥ 1 is fine
      expect(screen.getAllByText(c.expect(t, lang)).length).toBeGreaterThan(0);
      expectCleanText();
    });
  });

  it('comparison screens show the website disclosure for their data', async () => {
    for (const c of CATEGORIES) {
      const text = (() => {
        require('@/lib/i18n').setCurrentLang(lang);
        return disclosure(c.file);
      })();
      expect(text).toBeTruthy();
      const { unmount } = await renderScreen(CategoryScreen, { lang, params: { id: c.id } });
      expect(screen.getByText(text!)).toBeTruthy();
      unmount();
    }
  });
});

describe.each(LANGS)('interactions (%s)', (lang) => {
  const t = strings(lang);

  it('Finanz-Check: answering every question shows one pick per category', async () => {
    await renderScreen(FinanzCheckScreen, { lang });
    for (const q of QUESTIONS) {
      fireEvent.press(screen.getByText(label(q.options[0].label, lang)));
    }
    expect(await screen.findByText(t.check.resultTitle)).toBeTruthy();
    for (const cat of CATEGORY_KEYS) expect(screen.getByText(t.check.categories[cat])).toBeTruthy();
    // each category shows the website's top pick for these answers
    const answers = Object.fromEntries(QUESTIONS.map((q) => [q.id, q.options[0].id]));
    for (const cat of CATEGORY_KEYS) {
      const pick = topPick(cat, answers, getBundled(CATEGORY_META[cat].file, lang).items)!;
      expect(screen.getAllByText(pick.name).length).toBeGreaterThan(0);
    }
    expectCleanText();
  });

  it('Kreditrechner: the + button raises the amount and recalculates', async () => {
    await renderScreen(KreditScreen, { lang });
    fireEvent.press(screen.getByLabelText(t.calc.increase(t.calc.kredit.amount)));
    await settle(1);
    expect(screen.getByText(formatEURCents(calcLoan(10500, 4, 48).payment))).toBeTruthy();
  });

  it('Haushaltsbuch: an entry typed in the local number format is added', async () => {
    await renderScreen(HaushaltsbuchScreen, { lang });
    fireEvent.changeText(screen.getByPlaceholderText(t.calc.haushalt.amountPlaceholder), lang === 'de' ? '12,50' : '12.50');
    fireEvent.press(screen.getByText(t.calc.haushalt.add));
    await settle(1);
    // the "Ausgaben"/"Expenses" tile and the new entry row both show the amount
    const shown = visibleText(screen.toJSON()).join(' | ');
    expect(shown).not.toContain(t.calc.haushalt.errAmount);
    expect(shown).toContain(formatEURCents(12.5));
  });

  it('ETF-Suche: an asset-class chip and the text search filter the list', async () => {
    await renderScreen(EtfScreen, { lang });
    const all = etfs(lang);
    expect(screen.getByText(t.etf.count(all.length))).toBeTruthy();
    const bonds = options(lang, 'anlageklasse')[1]; // Anleihen / Bonds
    fireEvent.press(screen.getByText(bonds));
    await settle(1);
    expect(screen.getByText(t.etf.count(filterEtfs(all, { ...NO_FILTERS, klasse: bonds }).length))).toBeTruthy();
    fireEvent.press(screen.getByText(t.etf.reset));
    fireEvent.changeText(screen.getByLabelText(t.etf.search), 'IE00B4L5Y983');
    await settle(1);
    expect(screen.getByText(t.etf.count(1))).toBeTruthy();
    expectCleanText();
  });

  it('Home search: a provider name finds it in every comparison, an ISIN finds the ETF', async () => {
    const hits = search('dkb', lang, t);
    const cats = new Set(hits.filter((h) => h.kind === 'provider').map((h) => (h as { categoryId: string }).categoryId));
    expect(cats.size).toBeGreaterThanOrEqual(4); // Girokonto, Tagesgeld, Kreditkarte, Broker …
    expect(search('IE00B4L5Y983', lang, t).filter((h) => h.kind === 'etf')).toHaveLength(1);
    expect(search('x', lang, t)).toHaveLength(0);

    await renderScreen(HomeScreen, { lang });
    fireEvent.changeText(screen.getByLabelText(t.home.searchPlaceholder), 'DKB');
    await settle(1);
    expect(screen.getByText(t.home.searchCount(hits.length))).toBeTruthy();
    expect(screen.queryByText(t.home.favTitle)).toBeNull(); // results replace the category list
    const router = require('expo-router').__router;
    router.push.mockClear();
    fireEvent.press(screen.getAllByText(hits[0].title)[0]);
    expect(router.push).toHaveBeenCalledWith(expect.objectContaining({ pathname: '/vergleiche/[id]' }));
    fireEvent.changeText(screen.getByLabelText(t.home.searchPlaceholder), 'qqqqzzz');
    await settle(1);
    expect(screen.getByText(t.home.searchNone)).toBeTruthy();
    fireEvent.press(screen.getByLabelText(t.home.searchClear));
    await settle(1);
    expect(screen.getByText(t.home.favTitle)).toBeTruthy();
    expectCleanText();
  });

  it('Home: category rows and the ETF row are buttons that open their screen', async () => {
    await renderScreen(HomeScreen, { lang });
    const router = require('expo-router').__router;
    router.push.mockClear();
    // the Finanz-Check picks above can show the same name — the category row is the last one
    const giro = screen.getAllByText(t.categories.girokonto.title);
    fireEvent.press(giro[giro.length - 1]);
    expect(router.push).toHaveBeenCalledWith({ pathname: '/vergleiche/[id]', params: { id: 'girokonto' } });
    const etf = screen.getAllByText(t.etf.title);
    fireEvent.press(etf[etf.length - 1]);
    expect(router.push).toHaveBeenCalledWith('/vergleiche/etf');
  });

  it('ETF-Suche opened from the search shows just that ETF', async () => {
    await renderScreen(EtfScreen, { lang, params: { q: 'IE00B4L5Y983' } });
    expect(screen.getByText(t.etf.count(1))).toBeTruthy();
  });

  it('Score badge: tapping it shows the breakdown with the website labels', async () => {
    await renderScreen(CategoryScreen, { lang, params: { id: 'tagesgeld' } });
    fireEvent.press(screen.getAllByHintText(t.card.scoreShow)[0]);
    await settle(1);
    const first = getBundled('tagesgeld', lang).items.find((i) => i.score)!;
    for (const r of scoreRows('tagesgeld', first.score!, lang)) {
      expect(r.label).not.toBe(r.key); // a real label, not the raw factor key
      expect(screen.getAllByText(r.label).length).toBeGreaterThan(0);
    }
    expect(screen.getByText(t.card.scoreMethodology)).toBeTruthy();
    fireEvent.press(screen.getAllByLabelText(t.card.scoreClose)[0]);
  });

  it('Profil: notifications switch registers the device, and switches off again', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    await AsyncStorage.clear();
    const { supabase } = require('@/lib/supabase');
    supabase.rpc.mockClear();
    await renderScreen(ProfileScreen, { lang });
    const sw = screen.getByLabelText(t.profile.pushToggle);
    expect(sw.props.value).toBe(false);
    fireEvent(sw, 'valueChange', true);
    await settle(2);
    expect(supabase.rpc).toHaveBeenCalledWith('register_push_token', {
      p_token: 'ExponentPushToken[test]', p_lang: lang, p_platform: expect.any(String),
    });
    expect(screen.getByLabelText(t.profile.pushToggle).props.value).toBe(true);
    fireEvent(screen.getByLabelText(t.profile.pushToggle), 'valueChange', false);
    await settle(2);
    expect(supabase.rpc).toHaveBeenCalledWith('unregister_push_token', { p_token: 'ExponentPushToken[test]' });
    expect(screen.getByLabelText(t.profile.pushToggle).props.value).toBe(false);
    expectCleanText();
  });

  it('Profil: without push support the switch explains why', async () => {
    const Constants = require('expo-constants').default;
    const saved = Constants.expoConfig;
    Constants.expoConfig = {}; // no EAS project id yet
    try {
      await renderScreen(ProfileScreen, { lang });
      fireEvent(screen.getByLabelText(t.profile.pushToggle), 'valueChange', true);
      await settle(2);
      expect(screen.getByText(t.profile.pushUnavailable)).toBeTruthy();
      expect(screen.getByLabelText(t.profile.pushToggle).props.value).toBe(false);
    } finally {
      Constants.expoConfig = saved;
    }
  });

  it('Merkliste: the heart on a provider card toggles', async () => {
    await renderScreen(CategoryScreen, { lang, params: { id: 'tagesgeld' } });
    const before = screen.getAllByLabelText(t.card.favAdd).length;
    fireEvent.press(screen.getAllByLabelText(t.card.favAdd)[0]);
    await settle(1);
    expect(screen.getAllByLabelText(t.card.favRemove)).toHaveLength(1);
    expect(screen.getAllByLabelText(t.card.favAdd)).toHaveLength(before - 1);
  });
});

describe.each(LANGS)('sign-in flows against Supabase (%s)', (lang) => {
  const t = strings(lang);
  const auth = () => require('@/lib/supabase').supabase.auth;

  it('Registrieren: with "Confirm email" on, shows the check-your-inbox state and can resend', async () => {
    const signUp = jest.spyOn(auth(), 'signUp').mockResolvedValue({ data: { user: {}, session: null }, error: null } as never);
    const resend = jest.spyOn(auth(), 'resend');
    await renderScreen(RegisterScreen, { lang });
    fireEvent.changeText(screen.getByLabelText(t.auth.register.name), 'Max');
    fireEvent.changeText(screen.getByLabelText(t.auth.email), ' max@beispiel.de ');
    fireEvent.changeText(screen.getByLabelText(t.auth.register.password), 'geheim123');
    fireEvent.changeText(screen.getByLabelText(t.auth.register.password2), 'geheim123');
    fireEvent.press(screen.getByRole('checkbox'));
    fireEvent.press(screen.getByText(t.auth.register.submit));
    await settle(2);
    expect(signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'max@beispiel.de',
        options: expect.objectContaining({ emailRedirectTo: 'finanzpal://auth-callback' }),
      })
    );
    expect(screen.getByText(t.auth.register.inboxTitle)).toBeTruthy();
    expect(screen.getByText(t.auth.register.inboxText('max@beispiel.de'))).toBeTruthy();
    fireEvent.press(screen.getByText(t.auth.register.resend));
    await settle(2);
    expect(resend).toHaveBeenCalledWith(expect.objectContaining({ type: 'signup', email: 'max@beispiel.de' }));
    expect(screen.getByText(t.auth.register.resent)).toBeTruthy();
    expectCleanText();
  });

  it('Login: unconfirmed email shows the right text and a resend button', async () => {
    jest.spyOn(auth(), 'signInWithPassword').mockResolvedValue({
      error: { message: 'Email not confirmed', code: 'email_not_confirmed', status: 400 },
    } as never);
    const resend = jest.spyOn(auth(), 'resend');
    await renderScreen(LoginScreen, { lang });
    expect(screen.queryByText(t.auth.login.resend)).toBeNull();
    fireEvent.changeText(screen.getByLabelText(t.auth.email), 'max@beispiel.de');
    fireEvent.changeText(screen.getByLabelText(t.auth.password), 'geheim123');
    fireEvent.press(screen.getByText(t.auth.login.submit));
    await settle(2);
    expect(screen.getByText(t.auth.errors.emailNotConfirmed)).toBeTruthy();
    fireEvent.press(screen.getByText(t.auth.login.resend));
    await settle(2);
    expect(resend).toHaveBeenCalledWith(expect.objectContaining({ type: 'signup', email: 'max@beispiel.de' }));
    expect(screen.getByText(t.auth.login.resent)).toBeTruthy();
    expect(screen.queryByText(t.auth.login.resend)).toBeNull();
  });

  it('Passwort vergessen: the email link leads back into the app; email rate limit has its own text', async () => {
    const reset = jest.spyOn(auth(), 'resetPasswordForEmail').mockResolvedValueOnce({
      data: null,
      error: { message: 'email rate limit exceeded', code: 'over_email_send_rate_limit', status: 429 },
    } as never);
    await renderScreen(ForgotPasswordScreen, { lang });
    fireEvent.changeText(screen.getByLabelText(t.auth.email), 'max@beispiel.de');
    fireEvent.press(screen.getByText(t.auth.forgot.submit));
    await settle(2);
    expect(reset).toHaveBeenCalledWith('max@beispiel.de', { redirectTo: 'finanzpal://reset-password' });
    expect(screen.getByText(t.auth.errors.rateLimitEmail)).toBeTruthy();
    fireEvent.press(screen.getByText(t.auth.forgot.submit));
    await settle(2);
    expect(screen.getByText(t.auth.forgot.done)).toBeTruthy();
  });

  it('Neues Passwort: exchanges the link code once, checks the input, saves the password', async () => {
    const exchange = jest.spyOn(auth(), 'exchangeCodeForSession');
    const update = jest.spyOn(auth(), 'updateUser');
    await renderScreen(ResetPasswordScreen, { lang, params: { code: 'abc' } });
    expect(exchange).toHaveBeenCalledTimes(1);
    expect(exchange).toHaveBeenCalledWith('abc');
    fireEvent.changeText(screen.getByLabelText(t.auth.reset.password), 'neuesPasswort1');
    fireEvent.changeText(screen.getByLabelText(t.auth.reset.password2), 'anderes');
    fireEvent.press(screen.getByText(t.auth.reset.submit));
    await settle(1);
    expect(screen.getByText(t.auth.register.errMismatch)).toBeTruthy();
    expect(update).not.toHaveBeenCalled();
    fireEvent.changeText(screen.getByLabelText(t.auth.reset.password2), 'neuesPasswort1');
    fireEvent.press(screen.getByText(t.auth.reset.submit));
    await settle(2);
    expect(update).toHaveBeenCalledWith({ password: 'neuesPasswort1' });
    expect(screen.getByText(t.auth.reset.done)).toBeTruthy();
    fireEvent.press(screen.getByText(t.auth.reset.continue));
    expect(require('expo-router').__router.replace).toHaveBeenCalledWith('/');
  });

  it('Neues Passwort: an expired code shows the link-expired text', async () => {
    jest.spyOn(auth(), 'exchangeCodeForSession').mockResolvedValueOnce({
      data: { session: null },
      error: { message: 'invalid flow state, no valid flow state found', code: 'flow_state_not_found', status: 404 },
    } as never);
    await renderScreen(ResetPasswordScreen, { lang, params: { code: 'old' } });
    expect(screen.getByText(t.auth.errors.linkInvalid)).toBeTruthy();
    expect(screen.queryByLabelText(t.auth.reset.password)).toBeNull();
  });

  it('Supabase error codes map to the app texts (unknown ones get a neutral text, not English)', () => {
    require('@/lib/i18n').setCurrentLang(lang);
    const e = t.auth.errors;
    expect(friendlyAuthError({ code: 'invalid_credentials', message: 'Invalid login credentials' })).toBe(e.invalidLogin);
    expect(friendlyAuthError({ code: 'user_already_exists', message: 'User already registered' })).toBe(e.alreadyRegistered);
    expect(friendlyAuthError({ code: 'weak_password', message: 'Password should be at least 8 characters.' })).toBe(e.passwordTooShort);
    expect(friendlyAuthError({ code: 'weak_password', message: 'Password is known to be weak and easy to guess' })).toBe(e.weakPassword);
    expect(friendlyAuthError({ code: 'same_password', message: 'x' })).toBe(e.samePassword);
    expect(friendlyAuthError({ code: 'over_request_rate_limit', message: 'x', status: 429 })).toBe(e.rateLimit);
    expect(friendlyAuthError({ message: 'For security purposes, you can only request this after 42 seconds.' })).toBe(e.rateLimitEmail);
    expect(friendlyAuthError({ code: 'otp_expired', message: 'Email link is invalid or has expired' })).toBe(e.linkInvalid);
    expect(friendlyAuthError({ name: 'AuthRetryableFetchError', message: 'Failed to fetch' })).toBe(e.network);
    expect(friendlyAuthError({ code: 'unexpected_failure', message: 'Database error saving new user' })).toBe(e.generic);
  });
});

it('Every provider logo the website data uses is in the app', () => {
  let n = 0;
  for (const c of CATEGORIES) {
    for (const l of LANGS) {
      for (const it of getBundled(c.file, l).items) {
        if (!it.logo) continue;
        expect([c.file, it.id, hasLogo(it.logo)]).toEqual([c.file, it.id, true]);
        n++;
      }
    }
  }
  expect(n).toBeGreaterThan(20);
});

it('Wordmark logos get a wider chip of the same height, square logos stay square', () => {
  const LOGOS: Record<string, string> = require('../data/logos.json');
  let wide = 0;
  for (const logo of Object.keys(LOGOS)) {
    const a = logoAspect(logo);
    expect([logo, a > 0 && Number.isFinite(a)]).toEqual([logo, true]);
    const w = chipWidth(logo, 44);
    if (a > 2) {
      wide++;
      expect([logo, w > 44 && w <= 44 * MAX_CHIP_WIDTH]).toEqual([logo, true]);
    } else {
      expect([logo, w]).toEqual([logo, 44]);
    }
  }
  expect(wide).toBeGreaterThanOrEqual(5); // ING, norisbank, Openbank, justTRADE, Trade Republic, …
  expect(chipWidth('assets/logos/trade-republic.svg', 40)).toBe(Math.floor(40 * MAX_CHIP_WIDTH));
  expect(chipWidth(null, 44)).toBe(44);
  // narrow phones: wide chips are capped lower, square ones stay square
  expect(chipWidth('assets/logos/trade-republic.svg', 44, NARROW_MAX_CHIP_WIDTH)).toBe(Math.floor(44 * NARROW_MAX_CHIP_WIDTH));
  expect(chipWidth(null, 44, NARROW_MAX_CHIP_WIDTH)).toBe(44);

  render(<ProviderMark logo="assets/logos/ing.svg" name="ING" size={44} />);
  const flat = (s: unknown): Record<string, unknown> =>
    Array.isArray(s) ? Object.assign({}, ...s.map(flat)) : ((s ?? {}) as Record<string, unknown>);
  const style = flat(screen.getByTestId('provider-logo', { includeHiddenElements: true }).props.style);
  expect(style.height).toBe(44);
  expect(style.width).toBe(chipWidth('assets/logos/ing.svg', 44));
});

it('Push messages use the same comparison names as the app', () => {
  const map: Record<string, { id: string; de: string; en: string }> = require('../tools/push-categories.json');
  for (const c of CATEGORIES) {
    const entry = map[c.file];
    expect(entry?.id).toBe(c.id);
    for (const l of LANGS) expect(entry[l]).toBe(strings(l).categories[c.id].title);
  }
});

it('Notification data maps to a screen, anything else is ignored', () => {
  expect(targetOf({ type: 'compare', id: 'tagesgeld', focus: 'openbank' })).toEqual({ kind: 'compare', id: 'tagesgeld', focus: 'openbank' });
  expect(targetOf({ type: 'site', page: 'ratgeber-etf-sparplan.html' })).toEqual({ kind: 'site', page: 'ratgeber-etf-sparplan.html' });
  expect(targetOf({ type: 'site', page: 'https://evil.example/x.html' })).toBeNull();
  expect(targetOf(undefined)).toBeNull();
});

it('Profil: switching the language changes the whole screen', async () => {
  render(
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <FavoritesProvider>
            <ProfileScreen />
          </FavoritesProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
  await settle();
  fireEvent.press(screen.getByText('Deutsch'));
  await settle(1);
  expect(screen.getByText(strings('de').profile.signedInAs)).toBeTruthy();
  fireEvent.press(screen.getByText('English'));
  await settle(1);
  expect(screen.getByText(strings('en').profile.signedInAs)).toBeTruthy();
  expect(screen.queryByText(strings('de').profile.signedInAs)).toBeNull();
});

