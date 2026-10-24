import { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Button, ErrorText, InfoText, Input } from '@/components/ui';
import { LegalLinks } from '@/components/LegalLinks';
import { ChoiceField } from '@/components/CalcUI';
import { makeStyles, radius, spacing, ThemePreference, useTheme } from '@/components/theme';
import { useI18n, type LangPreference } from '@/lib/i18n';
import { formatDate } from '@/lib/format';
import { PushState, disablePush, enablePush, isPushEnabled } from '@/lib/push';
import { PREVIEW } from '@/lib/preview';

/** Opt-in for push notifications about new providers and guides. */
function PushSetting() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t, lang } = useI18n();
  const L = t.profile;
  const { user } = useAuth();
  const userId = user?.id ?? 'anon';
  const [state, setState] = useState<PushState>('off');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    isPushEnabled(userId).then((on) => setState(on ? 'on' : 'off'));
  }, [userId]);

  async function toggle(on: boolean) {
    setBusy(true);
    setFailed(false);
    try {
      if (on) setState(await enablePush(userId, lang));
      else {
        await disablePush(userId);
        setState('off');
      }
    } catch {
      setFailed(true);
      setState('off');
    }
    setBusy(false);
  }

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{L.pushLabel}</Text>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>{L.pushToggle}</Text>
        <Switch
          value={state === 'on'}
          onValueChange={toggle}
          disabled={busy}
          trackColor={{ true: colors.primary, false: colors.border }}
          accessibilityLabel={L.pushToggle}
        />
      </View>
      <Text style={styles.meta}>{L.pushText}</Text>
      {state === 'denied' && (
        <>
          <Text style={styles.warn}>{L.pushDenied}</Text>
          <Pressable onPress={() => Linking.openSettings()} accessibilityRole="button">
            <Text style={styles.link}>{L.pushOpenSettings}</Text>
          </Pressable>
        </>
      )}
      {state === 'unavailable' && <Text style={styles.warn}>{L.pushUnavailable}</Text>}
      {failed && <Text style={styles.warn}>{L.pushError}</Text>}
    </View>
  );
}

export default function ProfileScreen() {
  const styles = useStyles();
  const { colors, preference, setPreference } = useTheme();
  const { t, preference: langPreference, setPreference: setLangPreference } = useI18n();
  const L = t.profile;
  const { user, signOut, deleteAccount } = useAuth();
  const [name, setName] = useState<string>((user?.user_metadata?.full_name as string) ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function saveName() {
    setError(null);
    setInfo(null);
    if (PREVIEW) {
      setInfo(t.preview.account);
      return;
    }
    setSaving(true);
    const { error: e1 } = await supabase.auth.updateUser({ data: { full_name: name.trim() } });
    // Keep the public profiles table in sync (see supabase/schema.sql).
    const { error: e2 } = await supabase.from('profiles').update({ full_name: name.trim() }).eq('id', user!.id);
    setSaving(false);
    if (e1 || e2) setError((e1 ?? e2)!.message);
    else setInfo(L.saved);
  }

  function confirmDelete() {
    Alert.alert(
      L.deleteTitle,
      L.deleteText,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: L.deleteConfirm,
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
      {PREVIEW ? (
        <View style={styles.card}>
          <Text style={styles.label}>{t.preview.badge}</Text>
          <Text style={styles.meta}>{t.preview.profile}</Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.label}>{L.signedInAs}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.meta}>{L.memberSince(user?.created_at ? formatDate(user.created_at) : '–')}</Text>
        </View>
      )}

      <ErrorText message={error} />
      <InfoText message={info} />

      <Input label={L.name} value={name} onChangeText={setName} />
      <Button title={L.save} onPress={saveName} loading={saving} />

      <View style={{ height: spacing.lg }} />
      <ChoiceField<ThemePreference>
        label={L.appearance}
        value={preference}
        onChange={setPreference}
        options={[
          { value: 'system', label: L.themeSystem },
          { value: 'light', label: L.themeLight },
          { value: 'dark', label: L.themeDark },
        ]}
      />
      {/* Language names stay in their own language, so they can always be found */}
      <ChoiceField<LangPreference>
        label={L.language}
        value={langPreference}
        onChange={setLangPreference}
        options={[
          { value: 'system', label: L.langSystem },
          { value: 'de', label: 'Deutsch' },
          { value: 'en', label: 'English' },
        ]}
      />

      <View style={{ height: spacing.lg }} />
      <PushSetting />
      {!PREVIEW && (
        <>
          <Button title={L.signOut} variant="secondary" onPress={signOut} />
          <Button title={L.deleteAccount} variant="danger" onPress={confirmDelete} />
        </>
      )}
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
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xs },
  switchLabel: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.text, paddingRight: spacing.md },
  warn: { color: colors.text, fontSize: 13, marginTop: spacing.sm, lineHeight: 18 },
  link: { color: colors.primary, fontWeight: '700', fontSize: 14, marginTop: spacing.xs },
}));
