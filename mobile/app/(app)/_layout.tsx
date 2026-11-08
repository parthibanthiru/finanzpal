import { ColorValue, Text } from 'react-native';
import { Tabs } from 'expo-router';
import { useColors } from '@/components/theme';
import { useT } from '@/lib/i18n';

// Tab bar: fixed height, so icons and labels don't grow with the system font size (iOS shows its
// Large Content Viewer on long-press instead); screen content does scale.
const icon = (glyph: string) => ({ color }: { color: ColorValue }) => (
  <Text style={{ fontSize: 20, color }} allowFontScaling={false}>
    {glyph}
  </Text>
);

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
        tabBarAllowFontScaling: false,
      }}
    >
      {/* Stacks with their own headers */}
      <Tabs.Screen name="vergleiche" options={{ title: t.tabs.compare, headerShown: false, tabBarIcon: icon('⚖️') }} />
      <Tabs.Screen name="rechner" options={{ title: t.tabs.calculators, headerShown: false, tabBarIcon: icon('🧮') }} />
      <Tabs.Screen name="ratgeber" options={{ title: t.tabs.guides, tabBarIcon: icon('📚') }} />
      <Tabs.Screen name="chat" options={{ title: t.tabs.chatTitle, tabBarLabel: t.tabs.chat, tabBarIcon: icon('💬') }} />
      <Tabs.Screen name="profile" options={{ title: t.tabs.profileTitle, tabBarLabel: t.tabs.profile, tabBarIcon: icon('👤') }} />
      {/* redirect only, not a tab */}
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}
