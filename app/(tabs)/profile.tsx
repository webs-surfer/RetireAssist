import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, Shadow, Typography, AnimConfig } from '../../constants/theme';
import { apiGetMe, apiGetUserTasks } from '../../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ total: 0, completed: 0, rating: 0 });

  // Entrance animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const headerScale = useRef(new Animated.Value(0.9)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const statsSlide = useRef(new Animated.Value(40)).current;
  const menuAnim = useRef(new Animated.Value(0)).current;
  const menuSlide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadProfile();
    loadStats();

    // Staggered entrance
    Animated.stagger(150, [
      Animated.parallel([
        Animated.timing(headerAnim, { toValue: 1, duration: AnimConfig.duration.entrance, useNativeDriver: true }),
        Animated.spring(headerScale, { toValue: 1, ...AnimConfig.spring, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(statsAnim, { toValue: 1, duration: AnimConfig.duration.entrance, useNativeDriver: true }),
        Animated.spring(statsSlide, { toValue: 0, ...AnimConfig.spring, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(menuAnim, { toValue: 1, duration: AnimConfig.duration.entrance, useNativeDriver: true }),
        Animated.spring(menuSlide, { toValue: 0, ...AnimConfig.spring, useNativeDriver: true }),
      ]),
    ]).start();
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
        {/* ═══ Animated Header ═══ */}
        <Animated.View style={[styles.header, {
          opacity: headerAnim,
          transform: [{ scale: headerScale }],
        }]}>
          <View style={styles.headerBg} />
          <View style={styles.headerBg2} />
          <View style={styles.avatarContainer}>
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            </View>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {user?.role === 'admin' ? '👑 Admin' : user?.role === 'helper' ? '🛠️ Helper' : '👤 User'}
              </Text>
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
        </Animated.View>

        {/* ═══ Stats with slide animation ═══ */}
        <Animated.View style={[styles.statsRow, {
          opacity: statsAnim,
          transform: [{ translateY: statsSlide }],
        }]}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Tasks</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{stats.rating > 0 ? `${stats.rating}★` : '—'}</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
        </Animated.View>

        {/* ═══ Animated Menu Sections ═══ */}
        <Animated.View style={{
          opacity: menuAnim,
          transform: [{ translateY: menuSlide }],
        }}>
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
                  <View style={[styles.menuIconWrap, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={styles.menuIcon}>👑</Text>
                  </View>
                  <Text style={styles.menuTitle}>Admin Portal</Text>
                  <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <View style={styles.menuCard}>
            {[
              { icon: '✏️', title: 'Edit Profile', route: '/onboarding/profile-setup', color: '#DBEAFE' },
              { icon: '🔑', title: 'Security & Password', route: null, color: '#E8F5E9' },
              { icon: '🌐', title: 'Language', route: null, color: '#F3E8FF' },
            ].map((item, i) => (
              <TouchableOpacity key={i} activeOpacity={0.85} style={styles.menuItem}
                onPress={() => item.route ? router.push(item.route as any) : Alert.alert('Coming Soon', 'This feature is coming soon.')}
              >
                <View style={[styles.menuIconWrap, { backgroundColor: item.color }]}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                </View>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>ACTIVITY</Text>
          <View style={styles.menuCard}>
            {[
              { icon: '📋', title: 'My Tasks', route: '/(tabs)/tasks', color: '#D1FAE5' },
              { icon: '📄', title: 'My Documents', route: '/documents', color: '#FEF3C7' },
              { icon: '💬', title: 'My Chats', route: null, color: '#DBEAFE' },
              { icon: '💳', title: 'Payment History', route: null, color: '#FDE8E8' },
            ].map((item, i) => (
              <TouchableOpacity key={i} activeOpacity={0.85} style={styles.menuItem}
                onPress={() => item.route ? router.push(item.route as any) : Alert.alert('Coming Soon', 'This feature is coming soon.')}
              >
                <View style={[styles.menuIconWrap, { backgroundColor: item.color }]}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                </View>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>SUPPORT</Text>
          <View style={styles.menuCard}>
            {[
              { icon: '❓', title: 'Help & FAQ', color: '#F3E8FF' },
              { icon: '📞', title: 'Contact Support', color: '#DBEAFE' },
              { icon: '⭐', title: 'Rate this App', color: '#FEF3C7' },
              { icon: '📜', title: 'Terms of Service', color: '#E8F5E9' },
            ].map((item, i) => (
              <TouchableOpacity key={i} activeOpacity={0.85} style={styles.menuItem}
                onPress={() => Alert.alert('Coming Soon', `${item.title} is coming soon.`)}
              >
                <View style={[styles.menuIconWrap, { backgroundColor: item.color }]}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                </View>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity activeOpacity={0.85} style={styles.signOutBtn} onPress={handleSignOut}>
            <Text style={styles.signOutText}>🚪 Sign Out</Text>
          </TouchableOpacity>

          <Text style={styles.version}>RetireAssist v1.0.0 · Made in India 🇮🇳</Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: Spacing.xxl },

  // ── Header ──
  header: {
    backgroundColor: Colors.primary,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
    borderBottomLeftRadius: Radius.xxl,
    borderBottomRightRadius: Radius.xxl,
    overflow: 'hidden',
  },
  headerBg: {
    position: 'absolute', top: -60, right: -60,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  headerBg2: {
    position: 'absolute', bottom: -30, left: -30,
    width: 150, height: 150, borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  avatarContainer: { alignItems: 'center', paddingTop: Spacing.lg },
  avatarRing: {
    width: 92, height: 92, borderRadius: 46,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
    padding: 3,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.saffron,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: Colors.white, fontSize: 28, fontWeight: 'bold' },
  roleBadge: {
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 4, paddingHorizontal: 14,
    borderRadius: Radius.full,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  roleText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  userName: { ...Typography.h1, color: Colors.white, marginTop: 12 },
  userDetails: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  userEmail: { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  editBtn: {
    marginTop: 14,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)',
    paddingVertical: 8, paddingHorizontal: 22,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  editBtnText: { color: Colors.white, fontSize: 13, fontWeight: '700' },

  // ── Stats ──
  statsRow: {
    flexDirection: 'row', margin: Spacing.lg,
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.xxl, ...Shadow.md,
    overflow: 'hidden',
  },
  statCard: { flex: 1, paddingVertical: Spacing.lg, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: Colors.borderLight, marginVertical: 12 },
  statNum: { fontSize: 24, fontWeight: '800', color: Colors.primary },
  statLabel: { ...Typography.caption, color: Colors.textSecondary, marginTop: 4 },

  // ── Security Banner ──
  securityBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#E8F5E9',
    marginHorizontal: Spacing.lg, padding: Spacing.md,
    borderRadius: Radius.xl, gap: 10, marginBottom: Spacing.lg,
    borderWidth: 1, borderColor: '#C8E6C9',
  },
  securityEmoji: { fontSize: 20 },
  securityText: { ...Typography.captionBold, color: Colors.success, flex: 1 },

  // ── Menu ──
  sectionTitle: {
    ...Typography.tiny, color: Colors.textMuted,
    marginHorizontal: Spacing.lg, marginBottom: 8,
    marginTop: 4, letterSpacing: 1.5,
  },
  menuCard: {
    backgroundColor: Colors.surfaceCard,
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.xl,
    marginBottom: Spacing.lg,
    ...Shadow.sm,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  menuIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.md,
  },
  menuIcon: { fontSize: 16 },
  menuTitle: { flex: 1, ...Typography.bodyBold, color: Colors.text },
  menuArrow: { fontSize: 22, color: Colors.textLight, fontWeight: '300' },

  // ── Sign Out ──
  signOutBtn: {
    marginHorizontal: Spacing.lg, marginTop: Spacing.md,
    backgroundColor: Colors.dangerLight,
    paddingVertical: 15, borderRadius: Radius.xl,
    alignItems: 'center',
    borderWidth: 1, borderColor: '#FECACA',
  },
  signOutText: { color: Colors.danger, fontSize: 16, fontWeight: '700' },
  version: { textAlign: 'center', color: Colors.textMuted, fontSize: 12, marginTop: Spacing.lg, marginBottom: Spacing.md },
});