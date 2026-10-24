import { ColorValue, Text } from 'react-native';
import { Tabs } from 'expo-router';
import { useColors } from '@/components/theme';
import { useT } from '@/lib/i18n';
import { transfersEnabled } from '@/lib/transfers';

const icon = (glyph: string) => ({ color }: { color: ColorValue }) => <Text style={{ fontSize: 20, color }}>{glyph}</Text>;

export default function AppLayout() {
  const colors = useColors();
  const t = useT();
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
      <Tabs.Screen name="vergleiche" options={{ title: t.tabs.compare, headerShown: false, tabBarIcon: icon('⚖️') }} />
      <Tabs.Screen name="rechner" options={{ title: t.tabs.calculators, headerShown: false, tabBarIcon: icon('🧮') }} />
      <Tabs.Screen name="ratgeber" options={{ title: t.tabs.guides, tabBarIcon: icon('📚') }} />
      {/* Überweisen: only with EXPO_PUBLIC_FEATURE_TRANSFERS=1 until launch (lib/transfers) */}
      <Tabs.Screen
        name="ueberweisen"
        options={{ title: t.tabs.transfer, headerShown: false, tabBarIcon: icon('💸'), href: transfersEnabled ? undefined : null }}
      />
      <Tabs.Screen name="chat" options={{ title: t.tabs.chatTitle, tabBarLabel: t.tabs.chat, tabBarIcon: icon('💬') }} />
      <Tabs.Screen name="profile" options={{ title: t.tabs.profileTitle, tabBarLabel: t.tabs.profile, tabBarIcon: icon('👤') }} />
      {/* redirect only, not a tab */}
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}
