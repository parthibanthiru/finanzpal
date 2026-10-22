import { Stack } from 'expo-router';
import { colors } from '@/components/theme';

export default function VergleicheLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.ink },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        headerBackTitle: 'Zurück',
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Vergleiche' }} />
      <Stack.Screen name="finanz-check" options={{ title: 'Finanz-Check' }} />
      <Stack.Screen name="[id]" options={{ title: '' }} />
    </Stack>
  );
}
