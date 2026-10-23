import { Stack } from 'expo-router';
import { useColors } from '@/components/theme';
import { useT } from '@/lib/i18n';

export default function VergleicheLayout() {
  const colors = useColors();
  const t = useT();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.ink },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        headerBackTitle: t.common.back,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="index" options={{ title: t.tabs.compare }} />
      <Stack.Screen name="finanz-check" options={{ title: t.check.title }} />
      <Stack.Screen name="merkliste" options={{ title: t.favorites.title }} />
      <Stack.Screen name="[id]" options={{ title: '' }} />
    </Stack>
  );
}
