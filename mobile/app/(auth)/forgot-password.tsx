import { useState } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { AuthScreen } from '@/components/AuthScreen';
import { Button, ErrorText, InfoText, Input } from '@/components/ui';

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    if (!email) return setError('Bitte gib deine E-Mail-Adresse ein.');
    setError(null);
    setLoading(true);
    const err = await resetPassword(email);
    setLoading(false);
    if (err) return setError(err);
    // Same message whether or not the address exists – avoids leaking who has an account.
    setInfo('Falls ein Konto mit dieser E-Mail existiert, haben wir dir einen Link zum Zurücksetzen geschickt.');
  }

  return (
    <AuthScreen title="Passwort vergessen" subtitle="Wir schicken dir einen Link, mit dem du ein neues Passwort festlegen kannst.">
      <ErrorText message={error} />
      <InfoText message={info} />
      <Input
        label="E-Mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />
      <Button title="Link senden" onPress={onSubmit} loading={loading} disabled={!!info} />
    </AuthScreen>
  );
}
