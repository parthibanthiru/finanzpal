import { Stack } from 'expo-router';
import { colors } from '@/components/theme';

export default function RechnerLayout() {
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
      <Stack.Screen name="index" options={{ title: 'Rechner' }} />
      <Stack.Screen name="sparplan" options={{ title: 'Sparplanrechner' }} />
      <Stack.Screen name="kredit" options={{ title: 'Kreditrechner' }} />
    </Stack>
  );
}
