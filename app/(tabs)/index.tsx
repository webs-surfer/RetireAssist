import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow, Spacing } from '../../constants/theme';
import { apiGetServices, apiGetNotifications } from '../../services/api';

type ServiceItem = { _id: string; title: string; icon: string; color: string; category: string };

export default function HomeScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [user, setUser] = useState<any>({ name: 'User', age: 60, city: 'India' });
  const [notifCount, setNotifCount] = useState(0);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();

    AsyncStorage.getItem('user').then(u => {
      if (u) {
        const parsed = JSON.parse(u);
        setUser(parsed);
        // Fetch services filtered by user age
        fetchServices(parsed.age);
      } else {
        fetchServices();
      }
    });

    // Fetch real notification count
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

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <View style={styles.headerBg} />
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Namaste 🙏</Text>
              <Text style={styles.userName}>{user.name || 'User'}</Text>
              <Text style={styles.userMeta}>📍 {city} · {user.age || '—'} yrs</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.bellBtn} onPress={() => router.push('/notifications')} activeOpacity={0.85}>
                <Text style={styles.bellIcon}>🔔</Text>
                {notifCount > 0 && (
                  <View style={styles.notifBadge}>
                    <Text style={styles.notifBadgeTxt}>{notifCount > 9 ? '9+' : notifCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <View style={styles.avatar}>
                <Text style={styles.avatarTxt}>{initials}</Text>
              </View>
            </View>
          </View>

          {user.age && user.age >= 60 && (
            <View style={styles.seniorBanner}>
              <Text style={styles.seniorText}>👴 Senior Citizen Benefits Active · {services.length} schemes available</Text>
            </View>
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
        </View>

        <Animated.View style={[styles.body, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickGrid}>
            {[
              { title: 'AI Assistant', icon: '🤖', color: '#F3E8FF', route: '/ai-assistant' },
              { title: 'Find Helper', icon: '🗺️', color: '#DBEAFE', route: '/(tabs)/helpers' },
              { title: 'My Tasks', icon: '☑️', color: '#D1FAE5', route: '/(tabs)/tasks' },
              { title: 'My Docs', icon: '📁', color: '#FEF3C7', route: '/documents' },
            ].map((a, i) => (
              <TouchableOpacity key={i} activeOpacity={0.85} style={[styles.quickCard, { backgroundColor: a.color }]}
                onPress={() => router.push(a.route as any)}>
                <View style={styles.quickIconWrap}><Text style={styles.quickIcon}>{a.icon}</Text></View>
                <Text style={styles.quickLabel}>{a.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

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
              {services.map((s) => (
                <TouchableOpacity key={s._id} activeOpacity={0.85}
                  style={[styles.serviceCard, { backgroundColor: s.color || '#EEF2FF' }]}
                  onPress={() => router.push({ pathname: '/service-detail', params: { id: s._id, title: s.title } })}
                >
                  <View style={styles.serviceIconWrap}><Text style={styles.serviceEmoji}>{s.icon}</Text></View>
                  <Text style={styles.serviceCardTitle}>{s.title}</Text>
                  <Text style={styles.applyLink}>Apply →</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.aiBanner}>
            <View style={styles.aiBannerContent}>
              <Text style={styles.aiBannerEmoji}>🤖</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.aiBannerTitle}>Need Help?</Text>
                <Text style={styles.aiBannerSubtitle}>Ask our Gemini AI assistant for guidance on any service</Text>
              </View>
            </View>
            <TouchableOpacity activeOpacity={0.85} style={styles.aiBannerBtn}
              onPress={() => router.push('/ai-assistant')}>
              <Text style={styles.aiBannerBtnTxt}>Ask AI →</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: Spacing.xxl },
  header: { backgroundColor: Colors.primary, paddingBottom: Spacing.lg, borderBottomLeftRadius: Radius.xl, borderBottomRightRadius: Radius.xl, overflow: 'hidden' },
  headerBg: { position: 'absolute', top: -80, right: -80, width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(255,255,255,0.06)' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  userName: { fontSize: 24, fontWeight: 'bold', color: Colors.white },
  userMeta: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bellBtn: { position: 'relative', padding: 4 },
  bellIcon: { fontSize: 24 },
  notifBadge: { position: 'absolute', top: -2, right: -4, backgroundColor: Colors.danger, width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  notifBadgeTxt: { color: Colors.white, fontSize: 10, fontWeight: 'bold' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.saffron, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  avatarTxt: { color: Colors.white, fontWeight: 'bold', fontSize: 14 },
  seniorBanner: { marginHorizontal: Spacing.lg, marginTop: Spacing.md, backgroundColor: 'rgba(255,255,255,0.15)', paddingVertical: 8, paddingHorizontal: 14, borderRadius: Radius.full },
  seniorText: { color: Colors.white, fontSize: 12, fontWeight: '600' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: Radius.lg, marginHorizontal: Spacing.lg, marginTop: Spacing.md, paddingHorizontal: Spacing.md, paddingVertical: 12 },
  searchIndicator: { marginRight: 8, fontSize: 10 },
  searchInput: { flex: 1, color: Colors.white, fontSize: 14 },
  body: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  sectionTitle: { fontSize: 19, fontWeight: '800', color: Colors.text, marginBottom: Spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md, marginTop: Spacing.md },
  seeAll: { color: Colors.primary, fontWeight: '700', fontSize: 14 },
  quickGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: Spacing.lg },
  quickCard: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md, borderRadius: Radius.lg },
  quickIconWrap: { width: 48, height: 48, borderRadius: Radius.lg, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  quickIcon: { fontSize: 24 },
  quickLabel: { fontSize: 12, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  serviceCard: { width: '48%', padding: Spacing.md, borderRadius: Radius.lg, ...Shadow.sm },
  serviceIconWrap: { width: 44, height: 44, borderRadius: Radius.md, backgroundColor: 'rgba(255,255,255,0.6)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  serviceEmoji: { fontSize: 22 },
  serviceCardTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  applyLink: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  emptyServices: { padding: Spacing.lg, alignItems: 'center' },
  emptyText: { color: Colors.textMuted, fontSize: 14 },
  aiBanner: { backgroundColor: Colors.primaryGhost, borderRadius: Radius.xl, padding: Spacing.lg, marginTop: Spacing.xl },
  aiBannerContent: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: Spacing.md },
  aiBannerEmoji: { fontSize: 36 },
  aiBannerTitle: { fontSize: 17, fontWeight: '800', color: Colors.text },
  aiBannerSubtitle: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  aiBannerBtn: { backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: Radius.lg, alignItems: 'center' },
  aiBannerBtnTxt: { color: Colors.white, fontWeight: '700', fontSize: 14 },
});