import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/context/AuthProvider';
import { AuthScreen } from '@/components/AuthScreen';
import { Button, ErrorText, InfoText, Input } from '@/components/ui';
import { SocialButtons } from '@/components/SocialButtons';
import { LegalLinks, openLegal } from '@/components/LegalLinks';
import { makeStyles, spacing, useColors } from '@/components/theme';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen() {
  const colors = useColors();
  const styles = useStyles();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    if (!name.trim()) return setError('Bitte gib deinen Namen ein.');
    if (!EMAIL_RE.test(email.trim())) return setError('Bitte gib eine gültige E-Mail-Adresse ein.');
    if (password.length < 8) return setError('Das Passwort muss mindestens 8 Zeichen lang sein.');
    if (password !== password2) return setError('Die Passwörter stimmen nicht überein.');
    if (!accepted) return setError('Bitte akzeptiere die Datenschutzerklärung.');

    setLoading(true);
    const err = await signUp(email, password, name);
    setLoading(false);
    if (err) return setError(err);
    setInfo('Fast geschafft! Wir haben dir eine Bestätigungs-E-Mail geschickt. Bitte klicke auf den Link und melde dich dann an.');
  }

  return (
    <AuthScreen title="Konto erstellen" subtitle="Kostenlos und in einer Minute erledigt.">
      <ErrorText message={error} />
      <InfoText message={info} />
      <Input label="Name" value={name} onChangeText={setName} autoComplete="name" placeholder="Max Mustermann" />
      <Input
        label="E-Mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        placeholder="name@beispiel.de"
      />
      <Input
        label="Passwort (mind. 8 Zeichen)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <Input
        label="Passwort wiederholen"
        value={password2}
        onChangeText={setPassword2}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <Pressable style={styles.checkRow} onPress={() => setAccepted(!accepted)} accessibilityRole="checkbox">
        <View style={[styles.checkbox, accepted && styles.checkboxOn]}>
          {accepted && <Text style={{ color: colors.onPrimary, fontWeight: '800' }}>✓</Text>}
        </View>
        <Text style={styles.checkText}>
          Ich habe die{' '}
          <Text style={styles.inlineLink} onPress={() => openLegal('datenschutz')}>
            Datenschutzerklärung
          </Text>{' '}
          gelesen und stimme der Verarbeitung meiner Daten zu.
        </Text>
      </Pressable>
      <Button title="Registrieren" onPress={onSubmit} loading={loading} disabled={!!info} />
      {!info && <SocialButtons onError={setError} />}
      <Text style={styles.legal}>
        Mit der Anmeldung über Google oder Apple stimmst du ebenfalls der Datenschutzerklärung zu.
      </Text>
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
  legal: { color: colors.muted, fontSize: 12, textAlign: 'center', marginTop: spacing.md },
}));
