import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/lib/supabase';

// Closes the login popup correctly when running as a web app.
WebBrowser.maybeCompleteAuthSession();

function firstParam(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, name: string) => Promise<string | null>;
  signInWithGoogle: () => Promise<string | null>;
  signInWithApple: () => Promise<string | null>;
  resetPassword: (email: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Map Supabase's English errors to friendly German messages.
function toGerman(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'E-Mail oder Passwort ist falsch.';
  if (m.includes('email not confirmed')) return 'Bitte bestätige zuerst deine E-Mail-Adresse.';
  if (m.includes('already registered')) return 'Diese E-Mail-Adresse ist bereits registriert.';
  if (m.includes('password should be at least')) return 'Das Passwort muss mindestens 8 Zeichen lang sein.';
  if (m.includes('rate limit')) return 'Zu viele Versuche. Bitte warte kurz und versuche es erneut.';
  if (m.includes('network')) return 'Keine Verbindung. Bitte prüfe deine Internetverbindung.';
  return message;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    loading,

    async signIn(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      return error ? toGerman(error.message) : null;
    },

    async signUp(email, password, name) {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: name.trim() } },
      });
      return error ? toGerman(error.message) : null;
    },

    // Google: opens Google's login page in a secure in-app browser (works on Android and iOS).
    // Returns null on success or when the user cancels.
    async signInWithGoogle() {
      const redirectTo = Linking.createURL('auth-callback'); // finanzpal://auth-callback (exp://… in Expo Go)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error || !data?.url) return toGerman(error?.message ?? 'Google-Anmeldung fehlgeschlagen.');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type !== 'success') return null; // cancelled / dismissed

      const params = Linking.parse(result.url).queryParams ?? {};
      const errDesc = firstParam(params.error_description as string | string[] | undefined);
      if (errDesc) return errDesc;
      const code = firstParam(params.code as string | string[] | undefined);
      if (!code) return 'Google-Anmeldung fehlgeschlagen.';

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      return exchangeError ? toGerman(exchangeError.message) : null;
    },

    // Apple: native iOS sheet (Face ID / Touch ID). Not offered on Android.
    async signInWithApple() {
      try {
        const credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        });
        if (!credential.identityToken) return 'Apple-Anmeldung fehlgeschlagen.';

        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });
        if (error) return toGerman(error.message);

        // Apple only sends the user's name on the very first sign-in – store it right away.
        const fullName = [credential.fullName?.givenName, credential.fullName?.familyName]
          .filter(Boolean)
          .join(' ');
        if (fullName && data.user) {
          await supabase.auth.updateUser({ data: { full_name: fullName } });
          await supabase.from('profiles').update({ full_name: fullName }).eq('id', data.user.id);
        }
        return null;
      } catch (e: unknown) {
        if ((e as { code?: string })?.code === 'ERR_REQUEST_CANCELED') return null;
        return 'Apple-Anmeldung fehlgeschlagen.';
      }
    },

    async resetPassword(email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      return error ? toGerman(error.message) : null;
    },

    async signOut() {
      await supabase.auth.signOut();
    },

    // GDPR (Art. 17): users must be able to delete their account.
    // Calls the `delete_own_account` SQL function from supabase/schema.sql.
    async deleteAccount() {
      const { error } = await supabase.rpc('delete_own_account');
      if (error) return toGerman(error.message);
      await supabase.auth.signOut();
      return null;
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
