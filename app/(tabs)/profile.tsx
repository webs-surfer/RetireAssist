import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, Shadow } from '../../constants/theme';
import { apiGetMe, apiGetUserTasks } from '../../services/api';

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ total: 0, completed: 0, rating: 0 });

  useEffect(() => {
    loadProfile();
    loadStats();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await apiGetMe();
      const userData = res.data.data.user;
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch {
      const stored = await AsyncStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));
    }
  };

  const loadStats = async () => {
    try {
      const res = await apiGetUserTasks();
      const tasks = res.data.data.tasks || [];
      const completedTasks = tasks.filter((t: any) => t.status === 'completed');
      const ratings = completedTasks.filter((t: any) => t.userRating).map((t: any) => t.userRating.rating);
      const avgRating = ratings.length > 0 ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1) : 0;
      setStats({ total: tasks.length, completed: completedTasks.length, rating: Number(avgRating) });
    } catch {}
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove(['token', 'user']);
          router.replace('/');
        },
      },
    ]);
  };

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  const city = user?.city || user?.location?.city || '';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerBg} />
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>👤 {user?.role || 'User'}</Text>
            </View>
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userDetails}>
            {user?.age ? `${user.age} yrs` : ''}{city ? ` · ${city}` : ''}
          </Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push('/onboarding/profile-setup')}
            activeOpacity={0.85}
          >
            <Text style={styles.editBtnText}>✏️ Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Tasks</Text>
          </View>
          <View style={[styles.statCard, styles.statCardMiddle]}>
            <Text style={styles.statNum}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{stats.rating > 0 ? `${stats.rating}★` : '—'}</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
        </View>

        <View style={styles.securityBanner}>
          <Text style={styles.securityEmoji}>🔒</Text>
          <Text style={styles.securityText}>Zero-knowledge encrypted. Only you can access your data.</Text>
        </View>

        {user?.role === 'admin' && (
          <>
            <Text style={styles.sectionTitle}>ADMINISTRATION</Text>
            <View style={styles.menuCard}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.menuItem}
                onPress={() => router.push('/admin' as any)}
              >
                <Text style={styles.menuIcon}>👑</Text>
                <Text style={styles.menuTitle}>Admin Portal</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        <View style={styles.menuCard}>
          {[
            { icon: '✏️', title: 'Edit Profile', route: '/onboarding/profile-setup' },
            { icon: '🔑', title: 'Security & Password', route: null },
            { icon: '🌐', title: 'Language', route: null },
          ].map((item, i) => (
            <TouchableOpacity key={i} activeOpacity={0.85} style={styles.menuItem}
              onPress={() => item.route ? router.push(item.route as any) : Alert.alert('Coming Soon', 'This feature is coming soon.')}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>ACTIVITY</Text>
        <View style={styles.menuCard}>
          {[
            { icon: '📋', title: 'My Tasks', route: '/(tabs)/tasks' },
            { icon: '📄', title: 'My Documents', route: '/documents' },
            { icon: '💬', title: 'My Chats', route: null },
            { icon: '💳', title: 'Payment History', route: null },
          ].map((item, i) => (
            <TouchableOpacity key={i} activeOpacity={0.85} style={styles.menuItem}
              onPress={() => item.route ? router.push(item.route as any) : Alert.alert('Coming Soon', 'This feature is coming soon.')}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>SUPPORT</Text>
        <View style={styles.menuCard}>
          {[
            { icon: '❓', title: 'Help & FAQ' },
            { icon: '📞', title: 'Contact Support' },
            { icon: '⭐', title: 'Rate this App' },
            { icon: '📜', title: 'Terms of Service' },
          ].map((item, i) => (
            <TouchableOpacity key={i} activeOpacity={0.85} style={styles.menuItem}
              onPress={() => Alert.alert('Coming Soon', `${item.title} is coming soon.`)}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity activeOpacity={0.85} style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>🚪 Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>RetireAssist v1.0.0 · Made in India 🇮🇳</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: Spacing.xxl },
  header: { backgroundColor: Colors.primary, paddingBottom: Spacing.xl, alignItems: 'center', borderBottomLeftRadius: Radius.xl, borderBottomRightRadius: Radius.xl, overflow: 'hidden' },
  headerBg: { position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.06)' },
  avatarContainer: { alignItems: 'center', paddingTop: Spacing.lg },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.saffron, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)' },
  avatarText: { color: Colors.white, fontSize: 28, fontWeight: 'bold' },
  roleBadge: { marginTop: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 3, paddingHorizontal: 10, borderRadius: Radius.full },
  roleText: { color: Colors.white, fontSize: 12, fontWeight: '600' },
  userName: { fontSize: 24, fontWeight: 'bold', color: Colors.white, marginTop: 10 },
  userDetails: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  userEmail: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  editBtn: { marginTop: 12, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)', paddingVertical: 8, paddingHorizontal: 20, borderRadius: Radius.full },
  editBtnText: { color: Colors.white, fontSize: 13, fontWeight: '600' },
  statsRow: { flexDirection: 'row', margin: Spacing.lg, backgroundColor: Colors.surface, borderRadius: Radius.xl, ...Shadow.md, overflow: 'hidden' },
  statCard: { flex: 1, paddingVertical: Spacing.lg, alignItems: 'center' },
  statCardMiddle: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: Colors.borderLight },
  statNum: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  statLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, marginTop: 2 },
  securityBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', marginHorizontal: Spacing.lg, padding: Spacing.md, borderRadius: Radius.lg, gap: 8, marginBottom: Spacing.lg },
  securityEmoji: { fontSize: 20 },
  securityText: { fontSize: 13, color: Colors.success, fontWeight: '600', flex: 1 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: Colors.textMuted, marginHorizontal: Spacing.lg, marginBottom: 6, marginTop: 4, letterSpacing: 1 },
  menuCard: { backgroundColor: Colors.surface, marginHorizontal: Spacing.lg, borderRadius: Radius.lg, marginBottom: Spacing.lg, ...Shadow.sm },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  menuIcon: { fontSize: 18, marginRight: Spacing.md },
  menuTitle: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.text },
  menuArrow: { fontSize: 20, color: Colors.textMuted },
  signOutBtn: { marginHorizontal: Spacing.lg, marginTop: Spacing.md, backgroundColor: '#FDE8E8', paddingVertical: 14, borderRadius: Radius.lg, alignItems: 'center' },
  signOutText: { color: Colors.danger, fontSize: 16, fontWeight: '700' },
  version: { textAlign: 'center', color: Colors.textMuted, fontSize: 12, marginTop: Spacing.lg },
});