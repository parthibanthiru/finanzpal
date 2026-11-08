import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthProvider';
import { AuthScreen } from '@/components/AuthScreen';
import { Button, ErrorText, InfoText, Input } from '@/components/ui';
import { SocialButtons } from '@/components/SocialButtons';
import { LegalLinks, openLegal } from '@/components/LegalLinks';
import { makeStyles, spacing, useColors } from '@/components/theme';
import { useT } from '@/lib/i18n';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen() {
  const t = useT();
  const colors = useColors();
  const styles = useStyles();
  const { signUp, resendConfirmation } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // set after a successful sign-up that still needs the email link → "check your inbox" state
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  async function onSubmit() {
    setError(null);
    if (!name.trim()) return setError(t.auth.register.errName);
    if (!EMAIL_RE.test(email.trim())) return setError(t.auth.register.errEmail);
    if (password.length < 8) return setError(t.auth.register.errPassword);
    if (password !== password2) return setError(t.auth.register.errMismatch);
    if (!accepted) return setError(t.auth.register.errConsent);

    setLoading(true);
    const res = await signUp(email, password, name);
    setLoading(false);
    if (res.error) return setError(res.error);
    if (res.needsConfirmation) setSentTo(email.trim());
    // otherwise a session exists and the AuthGate opens the app
  }

  async function onResend() {
    if (!sentTo) return;
    setError(null);
    setResending(true);
    const err = await resendConfirmation(sentTo);
    setResending(false);
    if (err) return setError(err);
    setInfo(t.auth.register.resent);
  }

  if (sentTo) {
    return (
      <AuthScreen title={t.auth.register.inboxTitle} subtitle={t.auth.register.inboxText(sentTo)}>
        <ErrorText message={error} />
        <InfoText message={info} />
        <Text style={styles.hint}>{t.auth.register.inboxHint}</Text>
        <Button title={t.auth.register.toLogin} onPress={() => router.replace('/login')} />
        <Button
          title={t.auth.register.resend}
          onPress={onResend}
          loading={resending}
          disabled={!!info}
          variant="secondary"
        />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen title={t.auth.register.title} subtitle={t.auth.register.subtitle}>
      <ErrorText message={error} />
      <Input label={t.auth.register.name} value={name} onChangeText={setName} autoComplete="name" placeholder={t.auth.register.namePlaceholder} />
      <Input
        label={t.auth.email}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        placeholder={t.auth.emailPlaceholder}
      />
      <Input
        label={t.auth.register.password}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <Input
        label={t.auth.register.password2}
        value={password2}
        onChangeText={setPassword2}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <Pressable
        style={styles.checkRow}
        onPress={() => setAccepted(!accepted)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: accepted }}
      >
        <View style={[styles.checkbox, accepted && styles.checkboxOn]}>
          {accepted && <Text style={{ color: colors.onPrimary, fontWeight: '800' }} maxFontSizeMultiplier={1}>✓</Text>}
        </View>
        <Text style={styles.checkText}>
          {t.auth.register.consentBefore}
          <Text style={styles.inlineLink} onPress={() => openLegal('datenschutz')}>
            {t.auth.register.consentLink}
          </Text>
          {t.auth.register.consentAfter}
        </Text>
      </Pressable>
      <Button title={t.auth.register.submit} onPress={onSubmit} loading={loading} />
      <SocialButtons onError={setError} />
      <Text style={styles.legal}>{t.auth.register.socialNote}</Text>
      <LegalLinks />
    </AuthScreen>
  );
}

const useStyles = makeStyles((colors) => ({
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxOn: { backgroundColor: colors.primary },
  checkText: { flex: 1, color: colors.muted, fontSize: 14, lineHeight: 20 },
  inlineLink: { color: colors.primary, fontWeight: '600', textDecorationLine: 'underline' },
  hint: { color: colors.muted, fontSize: 14, lineHeight: 20, marginBottom: spacing.md },
  legal: { color: colors.muted, fontSize: 12, textAlign: 'center', marginTop: spacing.md },
}));
