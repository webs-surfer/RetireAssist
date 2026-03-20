import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Shadow } from '../constants/theme';
import { apiGetNotifications, apiMarkAllNotifsRead, apiMarkNotifRead } from '../services/api';

type Notif = {
  _id: string; type: string; title: string; message: string;
  icon: string; isRead: boolean; createdAt: string;
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifs(); }, []);

  const fetchNotifs = async () => {
    try {
      const res = await apiGetNotifications();
      setNotifications(res.data.data.notifications || []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await apiMarkAllNotifsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  const markRead = async (id: string) => {
    try {
      await apiMarkNotifRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      task: Colors.primary, chat: Colors.success, document: Colors.warning,
      payment: Colors.saffron, kyc: Colors.primaryDark, system: Colors.textSecondary,
      rating: '#9333EA',
    };
    return colors[type] || Colors.textSecondary;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={markAllRead} activeOpacity={0.85}>
          <Text style={styles.markAllBtn}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>🔔</Text>
          <Text style={styles.emptyTitle}>No Notifications</Text>
          <Text style={styles.emptyText}>You'll receive notifications about task updates, messages, and more.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {notifications.map((n) => (
            <TouchableOpacity
              key={n._id}
              activeOpacity={0.85}
              style={[styles.notifCard, !n.isRead && styles.notifUnread]}
              onPress={() => markRead(n._id)}
            >
              <View style={[styles.iconCircle, { backgroundColor: getTypeColor(n.type) + '20' }]}>
                <Text style={styles.notifIcon}>{n.icon}</Text>
              </View>
              <View style={styles.notifContent}>
                <Text style={[styles.notifTitle, !n.isRead && styles.notifTitleUnread]}>{n.title}</Text>
                <Text style={styles.notifMessage} numberOfLines={2}>{n.message}</Text>
                <Text style={styles.notifTime}>{timeAgo(n.createdAt)}</Text>
              </View>
              {!n.isRead && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, backgroundColor: Colors.primary },
  backBtn: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.white },
  markAllBtn: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  emptyText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  list: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  notifCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, padding: Spacing.md, borderRadius: Radius.lg, marginBottom: 8, ...Shadow.sm },
  notifUnread: { backgroundColor: Colors.primaryGhost, borderLeftWidth: 3, borderLeftColor: Colors.primary },
  iconCircle: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  notifIcon: { fontSize: 20 },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 2 },
  notifTitleUnread: { fontWeight: '800' },
  notifMessage: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  notifTime: { fontSize: 11, color: Colors.textMuted, marginTop: 4 },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
});
