import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { ActivityIndicator, Platform, View } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '@/context/AuthProvider';
import { FavoritesProvider } from '@/context/FavoritesProvider';
import { ThemeProvider } from '@/context/ThemeProvider';
import { LanguageProvider } from '@/context/LanguageProvider';
import { useTheme } from '@/components/theme';
import { useI18n } from '@/lib/i18n';
import { refreshPush, targetOf } from '@/lib/push';
import { openSite } from '@/lib/site';

// Notifications that arrive while the app is open are shown as a banner too (phones only).
if (Platform.OS !== 'web') Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/**
 * Keeps the push registration current (token + language) and opens what a tapped notification
 * points to: the comparison scrolled to the new provider, or the new guide on the website.
 */
function PushHandler() {
  const { session } = useAuth();
  const { lang } = useI18n();
  const router = useRouter();
  const response = Notifications.useLastNotificationResponse();
  const handled = useRef<string | null>(null);
  const userId = session?.user.id;

  useEffect(() => {
    if (userId) refreshPush(userId, lang);
  }, [userId, lang]);

  useEffect(() => {
    if (!userId || !response) return; // after login, the tap is handled once the session exists
    if (response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
    const id = response.notification.request.identifier;
    if (handled.current === id) return;
    handled.current = id;
    const target = targetOf(response.notification.request.content.data);
    if (target?.kind === 'compare') {
      router.push({ pathname: '/vergleiche/[id]', params: { id: target.id, ...(target.focus ? { focus: target.focus } : {}) } });
    } else if (target?.kind === 'site') {
      openSite(target.page);
    }
    Notifications.clearLastNotificationResponseAsync?.().catch(() => {});
  }, [response, userId]);

  return null;
}

// Sends logged-out users to /login and logged-in users into the app.
function AuthGate() {
  const { colors, scheme } = useTheme();
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!session && !inAuthGroup) router.replace('/login');
    else if (session && inAuthGroup) router.replace('/');
  }, [session, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  return (
    <>
      {/* App screens have dark brand headers -> light status bar; login screens follow the theme. */}
      <StatusBar style={session || scheme === 'dark' ? 'light' : 'dark'} />
      <Slot />
      {Platform.OS !== 'web' && <PushHandler />}
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <FavoritesProvider>
              <AuthGate />
            </FavoritesProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
