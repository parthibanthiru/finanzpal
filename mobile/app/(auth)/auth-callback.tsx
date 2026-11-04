import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthProvider';
import { AuthScreen } from '@/components/AuthScreen';
import { Button, ErrorText } from '@/components/ui';
import { makeStyles, spacing, useColors } from '@/components/theme';
import { useT } from '@/lib/i18n';

type Params = { code?: string; error?: string; error_code?: string; error_description?: string };

/**
 * Opened by the link in Supabase's sign-up confirmation email (finanzpal://auth-callback?code=…).
 * Exchanges the one-time code for a session; the AuthGate then opens the app.
 * If that fails (link expired, or opened on another device) the address is usually confirmed
 * anyway, so the screen points to the normal sign-in.
 */
export default function AuthCallbackScreen() {
  const t = useT();
  const styles = useStyles();
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<Params>();
  const { completeEmailLink } = useAuth();
  const [failed, setFailed] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return; // the code works only once
    started.current = true;
    (async () => {
      if (params.error || params.error_code || !params.code) return setFailed(true);
      const err = await completeEmailLink(String(params.code));
      if (err) setFailed(true);
      // success: the new session makes the AuthGate switch to the app
    })();
  }, []);

  if (failed) {
    return (
      <AuthScreen title={t.auth.login.title}>
        <ErrorText message={t.auth.callback.failed} />
        <Button title={t.auth.callback.toLogin} onPress={() => router.replace('/login')} />
      </AuthScreen>
    );
  }
  return (
    <AuthScreen title={t.auth.login.title}>
      <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
      <Text style={styles.muted}>{t.auth.callback.checking}</Text>
    </AuthScreen>
  );
}

const useStyles = makeStyles((colors) => ({
  muted: { color: colors.muted, textAlign: 'center' },
}));
