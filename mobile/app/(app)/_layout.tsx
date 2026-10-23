import { ColorValue, Text } from 'react-native';
import { Tabs } from 'expo-router';
import { useColors } from '@/components/theme';

const icon = (glyph: string) => ({ color }: { color: ColorValue }) => <Text style={{ fontSize: 20, color }}>{glyph}</Text>;

export default function AppLayout() {
  const colors = useColors();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        headerStyle: { backgroundColor: colors.ink },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        sceneStyle: { backgroundColor: colors.bg },
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
      }}
    >
      {/* Stacks with their own headers */}
      <Tabs.Screen name="vergleiche" options={{ title: 'Vergleiche', headerShown: false, tabBarIcon: icon('⚖️') }} />
      <Tabs.Screen name="rechner" options={{ title: 'Rechner', headerShown: false, tabBarIcon: icon('🧮') }} />
      <Tabs.Screen name="ratgeber" options={{ title: 'Ratgeber', tabBarIcon: icon('📚') }} />
      <Tabs.Screen name="chat" options={{ title: 'Finanzpal Chat', tabBarLabel: 'Chat', tabBarIcon: icon('💬') }} />
      <Tabs.Screen name="profile" options={{ title: 'Mein Profil', tabBarLabel: 'Profil', tabBarIcon: icon('👤') }} />
      {/* redirect only, not a tab */}
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}
