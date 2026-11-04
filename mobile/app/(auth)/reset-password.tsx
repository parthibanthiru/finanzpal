import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthProvider';
import { AuthScreen } from '@/components/AuthScreen';
import { Button, ErrorText, InfoText, Input } from '@/components/ui';
import { makeStyles, spacing, useColors } from '@/components/theme';
import { useT } from '@/lib/i18n';

type Params = { code?: string; error?: string; error_code?: string; error_description?: string };

/**
 * Opened by the link in Supabase's "reset password" email (finanzpal://reset-password?code=…).
 * Exchanges the one-time code for a session, then lets the user set a new password.
 * The AuthGate keeps this screen open even though a session exists (see app/_layout.tsx).
 */
export default function ResetPasswordScreen() {
  const t = useT();
  const styles = useStyles();
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<Params>();
  const { session, completeEmailLink, updatePassword } = useAuth();
  const [stage, setStage] = useState<'checking' | 'form' | 'invalid' | 'done'>('checking');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return; // the code works only once – never exchange it twice
    started.current = true;
    (async () => {
      if (params.error || params.error_code) return setStage('invalid');
      if (params.code) {
        const err = await completeEmailLink(String(params.code));
        return setStage(err ? 'invalid' : 'form');
      }
      setStage(session ? 'form' : 'invalid');
    })();
  }, []);

  async function onSubmit() {
    setError(null);
    if (password.length < 8) return setError(t.auth.register.errPassword);
    if (password !== password2) return setError(t.auth.register.errMismatch);
    setLoading(true);
    const err = await updatePassword(password);
    setLoading(false);
    if (err) return setError(err);
    setStage('done');
  }

  if (stage === 'checking') {
    return (
      <AuthScreen title={t.auth.reset.title}>
        <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
        <Text style={styles.muted}>{t.auth.reset.checking}</Text>
      </AuthScreen>
    );
  }

  if (stage === 'invalid') {
    return (
      <AuthScreen title={t.auth.reset.title}>
        <ErrorText message={t.auth.errors.linkInvalid} />
        <Button title={t.auth.reset.requestNew} onPress={() => router.replace('/forgot-password')} />
      </AuthScreen>
    );
  }

  if (stage === 'done') {
    return (
      <AuthScreen title={t.auth.reset.title}>
        <InfoText message={t.auth.reset.done} />
        <Button title={t.auth.reset.continue} onPress={() => router.replace('/')} />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen title={t.auth.reset.title} subtitle={t.auth.reset.subtitle}>
      <ErrorText message={error} />
      <Input
        label={t.auth.reset.password}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <Input
        label={t.auth.reset.password2}
        value={password2}
        onChangeText={setPassword2}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        onSubmitEditing={onSubmit}
      />
      <Button title={t.auth.reset.submit} onPress={onSubmit} loading={loading} />
    </AuthScreen>
  );
}

const useStyles = makeStyles((colors) => ({
  muted: { color: colors.muted, textAlign: 'center' },
}));
