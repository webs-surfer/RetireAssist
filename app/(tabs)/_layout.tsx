import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [role, setRole] = useState<string>('user');

  useEffect(() => {
    const getRole = async () => {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const parsed = JSON.parse(user);
        setRole(parsed.role || 'user');
      }
      const storedRole = await AsyncStorage.getItem('role');
      if (storedRole) setRole(storedRole);
    };
    getRole();
  }, []);

  const isHelper = role === 'helper';

  return (
    <Tabs screenOptions={{ headerShown: false, tabBarShowLabel: false, tabBarStyle: styles.tabBar }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          href: isHelper ? null : '/',
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" label="Home" focused={focused} /> 
        }} 
      />
      <Tabs.Screen 
        name="helper-dashboard" 
        options={{ 
          href: isHelper ? '/helper-dashboard' : null,
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" label="Dashboard" focused={focused} /> 
        }} 
      />
      <Tabs.Screen 
        name="services" 
        options={{ 
          href: isHelper ? null : '/services',
          tabBarIcon: ({ focused }) => <TabIcon icon="📋" label="Services" focused={focused} /> 
        }} 
      />
      <Tabs.Screen 
        name="helpers" 
        options={{ 
          href: isHelper ? null : '/helpers',
          tabBarIcon: ({ focused }) => <TabIcon icon="🗺️" label="Helpers" focused={focused} /> 
        }} 
      />
      <Tabs.Screen 
        name="tasks" 
        options={{ 
          href: '/tasks',
          tabBarIcon: ({ focused }) => <TabIcon icon="✅" label={isHelper ? "My Tasks" : "Tasks"} focused={focused} /> 
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          href: '/profile',
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" label="Profile" focused={focused} /> 
        }} 
      />
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