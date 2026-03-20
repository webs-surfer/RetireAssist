import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Spacing } from '../../constants/theme';

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View style={[styles.tabItem, focused && styles.tabItemFocused]}>
      <Text style={styles.tabIcon}>{icon}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarShowLabel: false, tabBarStyle: styles.tabBar }}>
      <Tabs.Screen name="index" options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🏠" label="Home" focused={focused} /> }} />
      <Tabs.Screen name="services" options={{ tabBarIcon: ({ focused }) => <TabIcon icon="📋" label="Services" focused={focused} /> }} />
      <Tabs.Screen name="helpers" options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🗺️" label="Helpers" focused={focused} /> }} />
      <Tabs.Screen name="tasks" options={{ tabBarIcon: ({ focused }) => <TabIcon icon="✅" label="Tasks" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ tabBarIcon: ({ focused }) => <TabIcon icon="👤" label="Profile" focused={focused} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: { height: 72, backgroundColor: Colors.surfaceCard, borderTopWidth: 1, borderTopColor: Colors.borderLight, elevation: 8, shadowColor: Colors.black, shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  tabItem: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xs, paddingHorizontal: Spacing.sm, borderRadius: Radius.md, marginTop: Spacing.sm },
  tabItemFocused: { backgroundColor: Colors.primaryGhost },
  tabIcon: { fontSize: 20, marginBottom: 2 },
  tabLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '500' },
  tabLabelFocused: { color: Colors.primary, fontWeight: '800' },
});