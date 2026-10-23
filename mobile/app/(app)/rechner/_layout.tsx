import { Stack } from 'expo-router';
import { useColors } from '@/components/theme';
import { useT } from '@/lib/i18n';

export default function RechnerLayout() {
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
      <Stack.Screen name="index" options={{ title: t.tabs.calculators }} />
      <Stack.Screen name="sparplan" options={{ title: t.calc.headers.sparplan }} />
      <Stack.Screen name="zinseszins" options={{ title: t.calc.headers.zinseszins }} />
      <Stack.Screen name="kredit" options={{ title: t.calc.headers.kredit }} />
      <Stack.Screen name="baufinanzierung" options={{ title: t.calc.headers.baufinanzierung }} />
      <Stack.Screen name="nettolohn" options={{ title: t.calc.headers.nettolohn }} />
      <Stack.Screen name="altersvorsorge" options={{ title: t.calc.headers.altersvorsorge }} />
      <Stack.Screen name="haushaltsbuch" options={{ title: t.calc.headers.haushaltsbuch }} />
    </Stack>
  );
}
