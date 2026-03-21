import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Animated, ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View, ActivityIndicator, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow, Spacing, Typography, AnimConfig } from '../../constants/theme';
import { apiGetServices, apiGetNotifications } from '../../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ServiceItem = { _id: string; title: string; icon: string; color: string; category: string };

export default function HomeScreen() {
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const checkRole = async () => {
        const stored = await AsyncStorage.getItem('user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.role === 'helper') {
            router.replace('/(tabs)/helper-dashboard');
          }
        }
      };
      checkRole();
    }, [router])
  );

  // Staggered entrance animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const quickActionsAnim = useRef(new Animated.Value(0)).current;
  const quickActionsSlide = useRef(new Animated.Value(40)).current;
  const servicesAnim = useRef(new Animated.Value(0)).current;
  const servicesSlide = useRef(new Animated.Value(30)).current;
  const bannerAnim = useRef(new Animated.Value(0)).current;
  const bannerScale = useRef(new Animated.Value(0.95)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [user, setUser] = useState<any>({ name: 'User', age: 60, city: 'India' });
  const [notifCount, setNotifCount] = useState(0);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    // Staggered entrance animation sequence
    Animated.stagger(120, [
      Animated.timing(headerAnim, {
        toValue: 1, duration: AnimConfig.duration.entrance,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(quickActionsAnim, {
          toValue: 1, duration: AnimConfig.duration.entrance,
          useNativeDriver: true,
        }),
        Animated.spring(quickActionsSlide, {
          toValue: 0, ...AnimConfig.spring,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(servicesAnim, {
          toValue: 1, duration: AnimConfig.duration.entrance,
          useNativeDriver: true,
        }),
        Animated.spring(servicesSlide, {
          toValue: 0, ...AnimConfig.spring,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(bannerAnim, {
          toValue: 1, duration: AnimConfig.duration.slow,
          useNativeDriver: true,
        }),
        Animated.spring(bannerScale, {
          toValue: 1, ...AnimConfig.springBouncy,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Subtle pulse animation for the notification bell
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    AsyncStorage.getItem('user').then(u => {
      if (u) {
        const parsed = JSON.parse(u);
        setUser(parsed);
        fetchServices(parsed.age);
      } else {
        fetchServices();
      }
    });

    apiGetNotifications().then(res => {
      setNotifCount(res.data.data.unreadCount || 0);
    }).catch(() => {});
  }, []);

  const fetchServices = async (age?: number) => {
    try {
      const res = await apiGetServices(age);
      setServices((res.data.data.services || []).slice(0, 6));
    } catch {
      setServices([]);
    } finally {
      setLoadingServices(false);
    }
  };

  const initials = user.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  const city = user.city || user.location?.city || 'India';

  const quickActions = [
    { title: 'AI Assistant', icon: '🤖', color: '#F3E8FF', route: '/ai-assistant', gradient: '#E9D5FF' },
    { title: 'Find Helper', icon: '🗺️', color: '#DBEAFE', route: '/(tabs)/helpers', gradient: '#BFDBFE' },
    { title: 'My Tasks', icon: '☑️', color: '#D1FAE5', route: '/(tabs)/tasks', gradient: '#A7F3D0' },
    { title: 'My Docs', icon: '📁', color: '#FEF3C7', route: '/documents', gradient: '#FDE68A' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ═══ Animated Header ═══ */}
        <Animated.View style={[styles.header, { opacity: headerAnim }]}>
          <View style={styles.headerBg} />
          <View style={styles.headerBgCircle2} />
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Namaste 🙏</Text>
              <Text style={styles.userName}>{user.name || 'User'}</Text>
              <Text style={styles.userMeta}>📍 {city} · {user.age || '—'} yrs</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.bellBtn} onPress={() => router.push('/notifications')} activeOpacity={0.85}>
                <Animated.Text style={[styles.bellIcon, notifCount > 0 && { transform: [{ scale: pulseAnim }] }]}>
                  🔔
                </Animated.Text>
                {notifCount > 0 && (
                  <View style={styles.notifBadge}>
                    <Text style={styles.notifBadgeTxt}>{notifCount > 9 ? '9+' : notifCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.avatar} activeOpacity={0.85} onPress={() => router.push('/(tabs)/profile')}>
                <Text style={styles.avatarTxt}>{initials}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {user.age && user.age >= 60 && (
            <Animated.View style={[styles.seniorBanner, { opacity: headerAnim }]}>
              <Text style={styles.seniorText}>👴 Senior Citizen Benefits Active · {services.length} schemes available</Text>
            </Animated.View>
          )}

          <View style={styles.searchBox}>
            <Text style={styles.searchIndicator}>🟢</Text>
            <TextInput
              placeholder="Search services, schemes, helpers..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              style={styles.searchInput}
              onFocus={() => router.push('/(tabs)/services')}
            />
          </View>
        </Animated.View>

        {/* ═══ Quick Actions with slide-up animation ═══ */}
        <Animated.View style={[styles.body, {
          opacity: quickActionsAnim,
          transform: [{ translateY: quickActionsSlide }],
        }]}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickGrid}>
            {quickActions.map((a, i) => (
              <TouchableOpacity key={i} activeOpacity={0.8}
                style={[styles.quickCard, { backgroundColor: a.color }]}
                onPress={() => router.push(a.route as any)}
              >
                <View style={[styles.quickIconWrap, { backgroundColor: a.gradient }]}>
                  <Text style={styles.quickIcon}>{a.icon}</Text>
                </View>
                <Text style={styles.quickLabel}>{a.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* ═══ Services with staggered entrance ═══ */}
        <Animated.View style={[styles.servicesSection, {
          opacity: servicesAnim,
          transform: [{ translateY: servicesSlide }],
        }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Services</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/services')} activeOpacity={0.85}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>

          {loadingServices ? (
            <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 20 }} />
          ) : services.length === 0 ? (
            <View style={styles.emptyServices}>
              <Text style={styles.emptyText}>No services available. Check back later.</Text>
            </View>
          ) : (
            <View style={styles.serviceGrid}>
              {services.map((s, idx) => (
                <TouchableOpacity key={s._id} activeOpacity={0.85}
                  style={[styles.serviceCard, { backgroundColor: s.color || '#EEF2FF' }]}
                  onPress={() => router.push({ pathname: '/service-detail', params: { id: s._id, title: s.title } })}
                >
                  <View style={styles.serviceIconWrap}>
                    <Text style={styles.serviceEmoji}>{s.icon}</Text>
                  </View>
                  <Text style={styles.serviceCardTitle}>{s.title}</Text>
                  <View style={styles.applyPill}>
                    <Text style={styles.applyLink}>Apply →</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Animated.View>

        {/* ═══ AI Banner with scale entrance ═══ */}
        <Animated.View style={[styles.aiBanner, {
          opacity: bannerAnim,
          transform: [{ scale: bannerScale }],
        }]}>
          <View style={styles.aiBannerGlow} />
          <View style={styles.aiBannerContent}>
            <View style={styles.aiIconWrap}>
              <Text style={styles.aiBannerEmoji}>🤖</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.aiBannerTitle}>Need Help?</Text>
              <Text style={styles.aiBannerSubtitle}>Ask our Gemini AI assistant for guidance on any service</Text>
            </View>
          </View>
          <TouchableOpacity activeOpacity={0.85} style={styles.aiBannerBtn}
            onPress={() => router.push('/ai-assistant')}>
            <Text style={styles.aiBannerBtnTxt}>Ask AI →</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: Spacing.xxl }} />
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
    paddingBottom: Spacing.lg,
    borderBottomLeftRadius: Radius.xxl,
    borderBottomRightRadius: Radius.xxl,
    overflow: 'hidden',
  },
  headerBg: {
    position: 'absolute', top: -80, right: -80,
    width: 250, height: 250, borderRadius: 125,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  headerBgCircle2: {
    position: 'absolute', bottom: -40, left: -40,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  headerTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md,
  },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.8)', letterSpacing: 0.3 },
  userName: { ...Typography.h1, color: Colors.white, marginTop: 2 },
  userMeta: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bellBtn: { position: 'relative', padding: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: Radius.md },
  bellIcon: { fontSize: 22 },
  notifBadge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: Colors.danger, width: 20, height: 20,
    borderRadius: 10, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: Colors.primary,
  },
  notifBadgeTxt: { color: Colors.white, fontSize: 10, fontWeight: 'bold' },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.saffron,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.35)',
  },
  avatarTxt: { color: Colors.white, fontWeight: 'bold', fontSize: 15 },
  seniorBanner: {
    marginHorizontal: Spacing.lg, marginTop: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: Radius.full,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  seniorText: { color: Colors.white, fontSize: 12, fontWeight: '600' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: Radius.lg, marginHorizontal: Spacing.lg,
    marginTop: Spacing.md, paddingHorizontal: Spacing.md,
    paddingVertical: 13, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  searchIndicator: { marginRight: 8, fontSize: 10 },
  searchInput: { flex: 1, color: Colors.white, fontSize: 14 },

  // ── Body ──
  body: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },
  servicesSection: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  sectionTitle: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.md },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.md,
  },
  seeAll: { color: Colors.primary, fontWeight: '700', fontSize: 14 },

  // ── Quick Actions ──
  quickGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: Spacing.lg },
  quickCard: {
    flex: 1, alignItems: 'center', paddingVertical: Spacing.md,
    borderRadius: Radius.xl, borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  quickIconWrap: {
    width: 50, height: 50, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  quickIcon: { fontSize: 26 },
  quickLabel: { ...Typography.captionBold, color: Colors.text, textAlign: 'center' },

  // ── Services ──
  serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  serviceCard: {
    width: (SCREEN_WIDTH - Spacing.lg * 2 - 10) / 2,
    padding: Spacing.md, borderRadius: Radius.xl,
    ...Shadow.sm, borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  serviceIconWrap: {
    width: 48, height: 48, borderRadius: Radius.lg,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  serviceEmoji: { fontSize: 24 },
  serviceCardTitle: { ...Typography.bodyBold, color: Colors.text, marginBottom: 8 },
  applyPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(82, 84, 225, 0.09)',
    paddingVertical: 4, paddingHorizontal: 10,
    borderRadius: Radius.full,
  },
  applyLink: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  emptyServices: { padding: Spacing.lg, alignItems: 'center' },
  emptyText: { color: Colors.textMuted, fontSize: 14 },

  // ── AI Banner ──
  aiBanner: {
    backgroundColor: Colors.primaryGhost,
    borderRadius: Radius.xxl,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.primaryLight + '30',
  },
  aiBannerGlow: {
    position: 'absolute', top: -30, right: -30,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: Colors.primaryGlow,
  },
  aiBannerContent: {
    flexDirection: 'row', alignItems: 'center',
    gap: 14, marginBottom: Spacing.md,
  },
  aiIconWrap: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center', alignItems: 'center',
  },
  aiBannerEmoji: { fontSize: 28 },
  aiBannerTitle: { ...Typography.h3, color: Colors.text },
  aiBannerSubtitle: { ...Typography.caption, color: Colors.textSecondary, lineHeight: 18, marginTop: 2 },
  aiBannerBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 13, borderRadius: Radius.lg,
    alignItems: 'center', ...Shadow.glow,
  },
  aiBannerBtnTxt: { color: Colors.white, fontWeight: '700', fontSize: 15 },
});