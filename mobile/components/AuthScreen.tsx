import React from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, spacing } from './theme';

// Shared shell for login / register / reset screens.
export function AuthScreen({
  title,
  subtitle,
  children,
  showBrand,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  showBrand?: boolean;
}) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['bottom', 'left', 'right', 'top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {showBrand && (
            <View style={styles.brandRow} accessibilityRole="header" accessibilityLabel="Finanzpal">
              <Image source={require('../assets/splash.png')} style={styles.logo} />
              <Text style={styles.brand}>
                finanz<Text style={{ color: colors.pal }}>pal</Text>
              </Text>
            </View>
          )}
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  logo: { width: 48, height: 48, marginRight: 12 },
  brand: { fontSize: 34, fontWeight: '700', letterSpacing: -1, color: colors.ink },
  title: { fontFamily: fonts.display, fontSize: 26, fontWeight: '500', color: colors.text, marginBottom: spacing.sm },
  subtitle: { fontSize: 15, color: colors.muted, marginBottom: spacing.lg, lineHeight: 21 },
});
