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
      <Stack.Screen name="zinseszins" options={{ title: 'Zinseszinsrechner' }} />
      <Stack.Screen name="kredit" options={{ title: 'Kreditrechner' }} />
      <Stack.Screen name="baufinanzierung" options={{ title: 'Baufinanzierung' }} />
      <Stack.Screen name="nettolohn" options={{ title: 'Brutto-Netto' }} />
      <Stack.Screen name="altersvorsorge" options={{ title: 'Altersvorsorge' }} />
      <Stack.Screen name="haushaltsbuch" options={{ title: 'Haushaltsbuch' }} />
    </Stack>
  );
}
