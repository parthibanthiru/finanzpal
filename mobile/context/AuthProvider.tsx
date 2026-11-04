import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/lib/supabase';
import { deleteBuchungen } from '@/lib/haushaltsbuch';
import { disablePush } from '@/lib/push';
import { strings } from '@/lib/i18n';
import { friendlyAuthError as friendlyError, isUnconfirmed } from '@/lib/authErrors';
import { PREVIEW, PREVIEW_SESSION } from '@/lib/preview';

// Closes the login popup correctly when running as a web app.
WebBrowser.maybeCompleteAuthSession();

function firstParam(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  /** `unconfirmed`: the account exists but the email link hasn't been clicked yet. */
  signIn: (email: string, password: string) => Promise<{ error: string | null; unconfirmed?: boolean }>;
  /** `needsConfirmation`: Supabase sent a confirmation email; no session until it's clicked. */
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null; needsConfirmation?: boolean }>;
  resendConfirmation: (email: string) => Promise<string | null>;
  /** Exchanges the one-time `code` from an email link (confirmation or password reset) for a session. */
  completeEmailLink: (code: string) => Promise<string | null>;
  updatePassword: (password: string) => Promise<string | null>;
  signInWithGoogle: () => Promise<string | null>;
  signInWithApple: () => Promise<string | null>;
  resetPassword: (email: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Where the links in Supabase's emails lead back into the app
// (finanzpal://auth-callback and finanzpal://reset-password; exp://…/--/… in Expo Go).
// Both must be allowed in Supabase → Authentication → URL Configuration (finanzpal://**).
export const confirmRedirect = () => Linking.createURL('auth-callback');
export const resetRedirect = () => Linking.createURL('reset-password');

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(PREVIEW ? PREVIEW_SESSION : null);
  const [loading, setLoading] = useState(!PREVIEW);

  useEffect(() => {
    if (PREVIEW) return; // demo user, no Supabase
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
      if (!error) return { error: null };
      return { error: friendlyError(error), unconfirmed: isUnconfirmed(error) };
    },

    async signUp(email, password, name) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: name.trim() }, emailRedirectTo: confirmRedirect() },
      });
      if (error) return { error: friendlyError(error) };
      // With "Confirm email" on, Supabase returns no session until the link is clicked. For an
      // address that already has an account it also answers like this (without saying so), so the
      // "check your inbox" screen mentions logging in / resetting the password as well.
      return { error: null, needsConfirmation: !data?.session };
    },

    async resendConfirmation(email) {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: { emailRedirectTo: confirmRedirect() },
      });
      return error ? friendlyError(error) : null;
    },

    async completeEmailLink(code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      return error ? friendlyError(error) : null;
    },

    async updatePassword(password) {
      const { error } = await supabase.auth.updateUser({ password });
      return error ? friendlyError(error) : null;
    },

    // Google: opens Google's login page in a secure in-app browser (works on Android and iOS).
    // Returns null on success or when the user cancels.
    async signInWithGoogle() {
      const redirectTo = Linking.createURL('auth-callback'); // finanzpal://auth-callback (exp://… in Expo Go)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error || !data?.url) return error ? friendlyError(error) : strings().auth.errors.googleFailed;

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type !== 'success') return null; // cancelled / dismissed

      const params = Linking.parse(result.url).queryParams ?? {};
      const errDesc = firstParam(params.error_description as string | string[] | undefined);
      if (errDesc) return errDesc;
      const code = firstParam(params.code as string | string[] | undefined);
      if (!code) return strings().auth.errors.googleFailed;

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      return exchangeError ? friendlyError(exchangeError) : null;
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
        if (!credential.identityToken) return strings().auth.errors.appleFailed;

        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });
        if (error) return friendlyError(error);

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
        return strings().auth.errors.appleFailed;
      }
    },

    async resetPassword(email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: resetRedirect() });
      return error ? friendlyError(error) : null;
    },

    async signOut() {
      // stop this account's notifications on this device, but remember the choice for next sign-in
      if (session?.user.id) await disablePush(session.user.id, { keepChoice: true });
      await supabase.auth.signOut();
    },

    // GDPR (Art. 17): users must be able to delete their account.
    // Calls the `delete_own_account` SQL function from supabase/schema.sql.
    async deleteAccount() {
      const userId = session?.user.id;
      const { error } = await supabase.rpc('delete_own_account');
      if (error) return friendlyError(error);
      if (userId) await deleteBuchungen(userId); // budget entries stored only on this device
      await supabase.auth.signOut();
      return null;
    },
  };

  if (PREVIEW) {
    // the demo user can't sign out or delete anything; the profile screen hides these buttons
    value.signOut = async () => {};
    value.deleteAccount = async () => strings().preview.account;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
