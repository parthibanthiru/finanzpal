import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/context/AuthProvider';
import { AuthScreen } from '@/components/AuthScreen';
import { Button, ErrorText, InfoText, Input } from '@/components/ui';
import { SocialButtons } from '@/components/SocialButtons';
import { LegalLinks } from '@/components/LegalLinks';
import { makeStyles, spacing, useColors } from '@/components/theme';
import { useT } from '@/lib/i18n';

export default function LoginScreen() {
  const t = useT();
  const styles = useStyles();
  const colors = useColors();
  const { signIn, resendConfirmation } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function onSubmit() {
    if (!email || !password) return setError(t.auth.login.missing);
    setError(null);
    setInfo(null);
    setLoading(true);
    const res = await signIn(email, password);
    setLoading(false);
    setUnconfirmed(!!res.unconfirmed);
    if (res.error) setError(res.error);
    // On success the AuthGate redirects automatically.
  }

  // Account exists but the confirmation link was never clicked → send it again.
  async function onResend() {
    setResending(true);
    const err = await resendConfirmation(email);
    setResending(false);
    if (err) return setError(err);
    setError(null);
    setUnconfirmed(false);
    setInfo(t.auth.login.resent);
  }

  return (
    <AuthScreen showBrand title={t.auth.login.title} subtitle={t.auth.login.subtitle}>
      <ErrorText message={error} />
      <InfoText message={info} />
      {unconfirmed && (
        <Button title={t.auth.login.resend} onPress={onResend} loading={resending} variant="secondary" />
      )}
      <Input
        label={t.auth.email}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        placeholder={t.auth.emailPlaceholder}
      />
      <Input
        label={t.auth.password}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
        textContentType="password"
        placeholder="••••••••"
        onSubmitEditing={onSubmit}
      />
      <Link href="/forgot-password" asChild>
        <Pressable style={{ alignSelf: 'flex-end', marginBottom: spacing.md }} accessibilityRole="button">
          <Text style={styles.link}>{t.auth.login.forgot}</Text>
        </Pressable>
      </Link>
      <Button title={t.auth.login.submit} onPress={onSubmit} loading={loading} />
      <SocialButtons onError={setError} />
      <View style={styles.footer}>
        <Text style={{ color: colors.muted }}>{t.auth.login.noAccount}</Text>
        <Link href="/register" asChild>
          <Pressable accessibilityRole="button">
            <Text style={styles.link}>{t.auth.login.register}</Text>
          </Pressable>
        </Link>
      </View>
      <LegalLinks />
    </AuthScreen>
  );
}

const useStyles = makeStyles((colors) => ({
  link: { color: colors.primary, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
}));
