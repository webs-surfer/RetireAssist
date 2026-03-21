import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Animated, RefreshControl, Dimensions
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, Shadow, Typography, AnimConfig } from '../../constants/theme';
import { apiGetHelperTasks, apiAcceptTask, apiRejectTask } from '../../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TaskItem = {
  _id: string; serviceType: string; status: string; stage: number;
  stageLabel: string; price: number; proposedPrice?: number;
  userId?: { _id: string; name: string; phone?: string; age?: number };
  description?: string; instructions?: string;
  createdAt: string;
};

export default function HelperDashboardScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('New');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;
  const listSlide = useRef(new Animated.Value(30)).current;

  const tabs = ['New', 'Active', 'Completed', 'All'];

  useFocusEffect(
    useCallback(() => {
      const checkRole = async () => {
        const stored = await AsyncStorage.getItem('user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.role === 'user' || !parsed.role) {
            router.replace('/(tabs)');
          }
        }
      };
      checkRole();
    }, [router])
  );

  useEffect(() => {
    AsyncStorage.getItem('user').then(u => u && setUser(JSON.parse(u)));
    fetchTasks();
    Animated.stagger(150, [
      Animated.timing(headerAnim, { toValue: 1, duration: AnimConfig.duration.entrance, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(listAnim, { toValue: 1, duration: AnimConfig.duration.entrance, useNativeDriver: true }),
        Animated.spring(listSlide, { toValue: 0, ...AnimConfig.spring, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await apiGetHelperTasks();
      setTasks(res.data.data.tasks || []);
    } catch { setTasks([]); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  const onRefresh = () => { setRefreshing(true); fetchTasks(); };

  const filtered = activeTab === 'All' ? tasks
    : activeTab === 'New' ? tasks.filter(t => t.status === 'pending')
    : activeTab === 'Active' ? tasks.filter(t => ['accepted', 'in-progress', 'admin-review'].includes(t.status))
    : tasks.filter(t => t.status === 'completed');

  const handleAccept = async (taskId: string) => {
    setProcessingId(taskId);
    try {
      await apiAcceptTask(taskId);
      Alert.alert('✅ Accepted', 'Task accepted! You can now chat with the user.');
      fetchTasks();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to accept');
    } finally { setProcessingId(null); }
  };

  const handleReject = (taskId: string) => {
    Alert.alert('Reject Task?', 'Are you sure you want to reject this request?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: async () => {
        setProcessingId(taskId);
        try {
          await apiRejectTask(taskId);
          Alert.alert('Rejected', 'Task has been rejected.');
          fetchTasks();
        } catch (e: any) {
          Alert.alert('Error', e.response?.data?.message || 'Failed to reject');
        } finally { setProcessingId(null); }
      }},
    ]);
  };

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const activeCount = tasks.filter(t => ['accepted', 'in-progress', 'admin-review'].includes(t.status)).length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const totalEarnings = tasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + (t.price || t.proposedPrice || 0), 0);

  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'H';

  return (
    <SafeAreaView style={styles.safe}>
      {/* ═══ Header ═══ */}
      <Animated.View style={[styles.header, { opacity: headerAnim }]}>
        <View style={styles.headerBg} />
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Welcome back 🤝</Text>
            <Text style={styles.userName}>{user?.name || 'Helper'}</Text>
          </View>
          <TouchableOpacity style={styles.avatar} activeOpacity={0.85} onPress={() => router.push('/(tabs)/profile')}>
            <Text style={styles.avatarTxt}>{initials}</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{pendingCount}</Text>
            <Text style={styles.statLabel}>New</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: Colors.info }]}>{activeCount}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: Colors.success }]}>{completedCount}</Text>
            <Text style={styles.statLabel}>Done</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: Colors.gold }]}>₹{totalEarnings}</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </View>
        </View>

        {/* Tab bar */}
        <View style={styles.tabContainer}>
          {tabs.map((t, i) => (
            <TouchableOpacity key={i} activeOpacity={0.85}
              style={[styles.tab, activeTab === t && styles.tabActive]}
              onPress={() => setActiveTab(t)}
            >
              <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
                {t}{t === 'New' && pendingCount > 0 ? ` (${pendingCount})` : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* ═══ Task List ═══ */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading requests...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ fontSize: 52, marginBottom: 12 }}>
            {activeTab === 'New' ? '📭' : activeTab === 'Active' ? '⏳' : activeTab === 'Completed' ? '🏆' : '📋'}
          </Text>
          <Text style={styles.emptyTitle}>No {activeTab} Tasks</Text>
          <Text style={styles.emptyText}>
            {activeTab === 'New' ? 'No new requests yet. Users near you will send requests soon!'
              : activeTab === 'Active' ? 'Accept a request to start working on it.'
              : 'Your completed tasks will appear here.'}
          </Text>
        </View>
      ) : (
        <Animated.View style={{ flex: 1, opacity: listAnim, transform: [{ translateY: listSlide }] }}>
          <ScrollView
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
          >
            {filtered.map(task => {
              const isProcessing = processingId === task._id;
              return (
                <View key={task._id} style={styles.taskCard}>
                  <View style={styles.cardTop}>
                    <View style={styles.serviceBadge}>
                      <Text style={styles.serviceBadgeText}>{task.serviceType}</Text>
                    </View>
                    <Text style={[styles.statusPill, {
                      color: task.status === 'pending' ? Colors.warning
                        : task.status === 'completed' ? Colors.success
                        : task.status === 'rejected' ? Colors.danger : Colors.info,
                      backgroundColor: (task.status === 'pending' ? Colors.warningLight
                        : task.status === 'completed' ? Colors.successLight
                        : task.status === 'rejected' ? Colors.dangerLight : Colors.infoLight),
                    }]}>
                      {task.status === 'pending' ? '🔔 New' : task.status === 'accepted' ? '🟢 Active' :
                        task.status === 'completed' ? '✅ Done' : task.status === 'rejected' ? '❌ Rejected' : `📋 ${task.stageLabel}`}
                    </Text>
                  </View>

                  {/* User info */}
                  <View style={styles.userRow}>
                    <View style={styles.userAvatar}>
                      <Text style={styles.userAvatarText}>{task.userId?.name?.[0] || '?'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.userNameText}>{task.userId?.name || 'User'}</Text>
                      {task.userId?.age && <Text style={styles.userAge}>{task.userId.age} years old</Text>}
                    </View>
                    <Text style={styles.priceText}>₹{task.price || task.proposedPrice || 0}</Text>
                  </View>

                  {task.description && (
                    <Text style={styles.descText} numberOfLines={2}>📝 {task.description}</Text>
                  )}

                  <Text style={styles.dateText}>
                    📅 {new Date(task.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>

                  {/* Action buttons */}
                  {task.status === 'pending' && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity activeOpacity={0.85}
                        style={[styles.rejectBtn, isProcessing && { opacity: 0.5 }]}
                        onPress={() => handleReject(task._id)} disabled={isProcessing}
                      >
                        <Text style={styles.rejectBtnText}>✕ Reject</Text>
                      </TouchableOpacity>
                      <TouchableOpacity activeOpacity={0.85}
                        style={[styles.acceptBtn, isProcessing && { opacity: 0.5 }]}
                        onPress={() => handleAccept(task._id)} disabled={isProcessing}
                      >
                        {isProcessing ? <ActivityIndicator size="small" color={Colors.white} />
                          : <Text style={styles.acceptBtnText}>✓ Accept</Text>}
                      </TouchableOpacity>
                    </View>
                  )}

                  {['accepted', 'in-progress', 'admin-review'].includes(task.status) && (
                    <TouchableOpacity activeOpacity={0.85} style={styles.chatBtn}
                      onPress={() => router.push({ pathname: '/chat/[taskId]', params: { taskId: task._id } })}
                    >
                      <Text style={styles.chatBtnText}>💬 Chat with User</Text>
                    </TouchableOpacity>
                  )}

                  {task.status === 'completed' && (
                    <View style={styles.completedBanner}>
                      <Text style={styles.completedText}>✅ Completed · ₹{task.price || task.proposedPrice || 0} earned</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: '#10B981', paddingBottom: Spacing.md, borderBottomLeftRadius: Radius.xxl, borderBottomRightRadius: Radius.xxl, overflow: 'hidden' },
  headerBg: { position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.08)' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  userName: { ...Typography.h1, color: Colors.white, marginTop: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  avatarTxt: { color: Colors.white, fontWeight: 'bold', fontSize: 15 },
  statsRow: { flexDirection: 'row', marginHorizontal: Spacing.lg, marginTop: Spacing.md, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: Radius.xl, padding: 2 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  statNum: { fontSize: 20, fontWeight: '900', color: Colors.white },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginTop: 2 },
  tabContainer: { flexDirection: 'row', marginHorizontal: Spacing.lg, marginTop: Spacing.md, backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: Radius.md, padding: 3 },
  tab: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: Radius.sm },
  tabActive: { backgroundColor: Colors.white },
  tabText: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
  tabTextActive: { color: '#10B981' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  loadingText: { fontSize: 14, color: Colors.textMuted, marginTop: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  emptyText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  list: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  taskCard: { backgroundColor: Colors.surfaceCard, borderRadius: Radius.xl, padding: Spacing.md, marginBottom: 12, ...Shadow.md, borderWidth: 1, borderColor: Colors.borderLight },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  serviceBadge: { backgroundColor: '#10B981' + '15', paddingVertical: 4, paddingHorizontal: 12, borderRadius: Radius.full },
  serviceBadgeText: { fontSize: 12, fontWeight: '800', color: '#10B981' },
  statusPill: { fontSize: 11, fontWeight: '700', paddingVertical: 3, paddingHorizontal: 10, borderRadius: Radius.full, overflow: 'hidden' },
  userRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 12 },
  userAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryGhost, justifyContent: 'center', alignItems: 'center' },
  userAvatarText: { fontSize: 16, fontWeight: '800', color: Colors.primary },
  userNameText: { fontSize: 15, fontWeight: '700', color: Colors.text },
  userAge: { fontSize: 12, color: Colors.textMuted },
  priceText: { fontSize: 20, fontWeight: '900', color: '#10B981' },
  descText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19, marginBottom: 8, backgroundColor: Colors.surface, padding: 10, borderRadius: Radius.md },
  dateText: { fontSize: 12, color: Colors.textMuted, marginBottom: 12 },
  actionRow: { flexDirection: 'row', gap: 10 },
  rejectBtn: { flex: 1, paddingVertical: 12, borderRadius: Radius.lg, alignItems: 'center', backgroundColor: Colors.dangerLight, borderWidth: 1, borderColor: '#FECACA' },
  rejectBtnText: { color: Colors.danger, fontWeight: '700', fontSize: 14 },
  acceptBtn: { flex: 2, paddingVertical: 12, borderRadius: Radius.lg, alignItems: 'center', backgroundColor: '#10B981', ...Shadow.sm },
  acceptBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  chatBtn: { backgroundColor: Colors.primaryGhost, paddingVertical: 12, borderRadius: Radius.lg, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.primaryLight + '40' },
  chatBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 14 },
  completedBanner: { backgroundColor: Colors.successLight, paddingVertical: 10, borderRadius: Radius.md, alignItems: 'center' },
  completedText: { color: Colors.success, fontWeight: '700', fontSize: 13 },
});
