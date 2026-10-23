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
import { CATEGORY_KEYS, QUESTIONS, label } from '@/lib/finanzCheck';

import HomeScreen from '@/app/(app)/vergleiche/index';
import CategoryScreen from '@/app/(app)/vergleiche/[id]';
import FinanzCheckScreen from '@/app/(app)/vergleiche/finanz-check';
import MerklisteScreen from '@/app/(app)/vergleiche/merkliste';
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
    // "Ausgaben" tile and the entry row both show the amount
    expect(screen.getAllByText(new RegExp(formatEURCents(12.5).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))).length).toBeGreaterThan(0);
    expect(screen.queryByText(t.calc.haushalt.errAmount)).toBeNull();
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

