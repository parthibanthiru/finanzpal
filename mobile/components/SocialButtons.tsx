import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuth } from '@/context/AuthProvider';
import { makeStyles, radius, spacing, useColors, useTheme } from './theme';

// "Weiter mit Google" (Android + iOS) and "Mit Apple fortfahren" (iOS only).
// Shown on both the login and the register screen.
export function SocialButtons({ onError }: { onError: (msg: string | null) => void }) {
  const { scheme } = useTheme();
  const styles = useStyles();
  const colors = useColors();
  const { signInWithGoogle, signInWithApple } = useAuth();
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [busy, setBusy] = useState<'google' | 'apple' | null>(null);

  useEffect(() => {
    if (Platform.OS === 'ios') AppleAuthentication.isAvailableAsync().then(setAppleAvailable);
  }, []);

  async function run(which: 'google' | 'apple') {
    onError(null);
    setBusy(which);
    const err = which === 'google' ? await signInWithGoogle() : await signInWithApple();
    setBusy(null);
    if (err) onError(err);
    // On success the AuthGate redirects automatically.
  }

  return (
    <View>
      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>oder</Text>
        <View style={styles.line} />
      </View>

      {appleAvailable && (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
          buttonStyle={
            scheme === 'dark'
              ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
              : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
          }
          cornerRadius={radius.md}
          style={styles.appleButton}
          onPress={() => run('apple')}
        />
      )}

      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [styles.googleButton, pressed && { opacity: 0.85 }]}
        onPress={() => run('google')}
        disabled={busy !== null}
      >
        {busy === 'google' ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <>
            <Text style={styles.googleG}>G</Text>
            <Text style={styles.googleText}>Weiter mit Google</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { marginHorizontal: spacing.md, color: colors.muted },
  appleButton: { height: 50, width: '100%', marginBottom: spacing.sm },
  googleButton: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  googleG: { fontSize: 18, fontWeight: '800', color: '#4285F4', marginRight: spacing.sm },
  googleText: { fontSize: 16, fontWeight: '600', color: colors.text },
}));
