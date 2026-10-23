import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Button, ErrorText, InfoText, Input } from '@/components/ui';
import { LegalLinks } from '@/components/LegalLinks';
import { ChoiceField } from '@/components/CalcUI';
import { makeStyles, radius, spacing, ThemePreference, useTheme } from '@/components/theme';

export default function ProfileScreen() {
  const styles = useStyles();
  const { colors, preference, setPreference } = useTheme();
  const { user, signOut, deleteAccount } = useAuth();
  const [name, setName] = useState<string>((user?.user_metadata?.full_name as string) ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function saveName() {
    setError(null);
    setInfo(null);
    setSaving(true);
    const { error: e1 } = await supabase.auth.updateUser({ data: { full_name: name.trim() } });
    // Keep the public profiles table in sync (see supabase/schema.sql).
    const { error: e2 } = await supabase.from('profiles').update({ full_name: name.trim() }).eq('id', user!.id);
    setSaving(false);
    if (e1 || e2) setError((e1 ?? e2)!.message);
    else setInfo('Gespeichert.');
  }

  function confirmDelete() {
    Alert.alert(
      'Konto löschen?',
      'Dein Konto und alle zugehörigen Daten werden dauerhaft gelöscht. Das kann nicht rückgängig gemacht werden.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Endgültig löschen',
          style: 'destructive',
          onPress: async () => {
            const err = await deleteAccount();
            if (err) setError(err);
          },
        },
      ]
    );
  }

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing.lg }}>
      <View style={styles.card}>
        <Text style={styles.label}>Angemeldet als</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.meta}>
          Mitglied seit {user?.created_at ? new Date(user.created_at).toLocaleDateString('de-DE') : '–'}
        </Text>
      </View>

      <ErrorText message={error} />
      <InfoText message={info} />

      <Input label="Name" value={name} onChangeText={setName} />
      <Button title="Speichern" onPress={saveName} loading={saving} />

      <View style={{ height: spacing.lg }} />
      <ChoiceField<ThemePreference>
        label="Darstellung"
        value={preference}
        onChange={setPreference}
        options={[
          { value: 'system', label: 'Wie System' },
          { value: 'light', label: 'Hell' },
          { value: 'dark', label: 'Dunkel' },
        ]}
      />

      <View style={{ height: spacing.lg }} />
      <Button title="Abmelden" variant="secondary" onPress={signOut} />
      <Button title="Konto löschen" variant="danger" onPress={confirmDelete} />
      <LegalLinks />
    </ScrollView>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { color: colors.muted, fontSize: 13 },
  email: { fontSize: 17, fontWeight: '700', color: colors.text, marginTop: 2 },
  meta: { color: colors.muted, fontSize: 13, marginTop: spacing.sm },
}));
