import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/context/AuthProvider';
import { AuthScreen } from '@/components/AuthScreen';
import { Button, ErrorText, Input } from '@/components/ui';
import { SocialButtons } from '@/components/SocialButtons';
import { LegalLinks } from '@/components/LegalLinks';
import { colors, spacing } from '@/components/theme';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    if (!email || !password) return setError('Bitte E-Mail und Passwort eingeben.');
    setError(null);
    setLoading(true);
    const err = await signIn(email, password);
    setLoading(false);
    if (err) setError(err);
    // On success the AuthGate redirects automatically.
  }

  return (
    <AuthScreen showBrand title="Willkommen zurück" subtitle="Melde dich an, um deine Finanzfragen zu stellen.">
      <ErrorText message={error} />
      <Input
        label="E-Mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        placeholder="name@beispiel.de"
      />
      <Input
        label="Passwort"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
        textContentType="password"
        placeholder="••••••••"
        onSubmitEditing={onSubmit}
      />
      <Link href="/forgot-password" asChild>
        <Pressable style={{ alignSelf: 'flex-end', marginBottom: spacing.md }}>
          <Text style={styles.link}>Passwort vergessen?</Text>
        </Pressable>
      </Link>
      <Button title="Anmelden" onPress={onSubmit} loading={loading} />
      <SocialButtons onError={setError} />
      <View style={styles.footer}>
        <Text style={{ color: colors.muted }}>Noch kein Konto? </Text>
        <Link href="/register" asChild>
          <Pressable>
            <Text style={styles.link}>Jetzt registrieren</Text>
          </Pressable>
        </Link>
      </View>
      <LegalLinks />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  link: { color: colors.primary, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
});
