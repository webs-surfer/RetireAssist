import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, Shadow, Typography } from '../constants/theme';
import { apiGetMyChats } from '../services/api';

type ChatItem = {
  _id: string;
  taskId?: { _id: string; serviceType: string; status: string };
  participants: { _id: string; name: string }[];
  lastMessage?: { text: string; timestamp: string };
  updatedAt: string;
};

export default function MyChatsScreen() {
  const router = useRouter();
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('user').then(u => {
      if (u) setUserId(JSON.parse(u)._id);
    });
    fetchChats();
  }, []);

  const fetchChats = useCallback(async () => {
    try {
      const res = await apiGetMyChats();
      setChats(res.data.data.chats || []);
    } catch { setChats([]); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  const getOtherPerson = (chat: ChatItem) => {
    const other = chat.participants.find(p => p._id !== userId);
    return other?.name || 'Unknown';
  };

  const formatTime = (ts: string) => {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💬 My Chats</Text>
        <View style={{ width: 50 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading chats...</Text>
        </View>
      ) : chats.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ fontSize: 52, marginBottom: 12 }}>💬</Text>
          <Text style={styles.emptyTitle}>No Chats Yet</Text>
          <Text style={styles.emptyText}>Chats will appear here when you start a task with a helper or user.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchChats(); }} colors={[Colors.primary]} />}
        >
          {chats.map(chat => (
            <TouchableOpacity
              key={chat._id}
              activeOpacity={0.85}
              style={styles.chatCard}
              onPress={() => {
                if (chat.taskId?._id) {
                  router.push({ pathname: '/chat/[taskId]', params: { taskId: chat.taskId._id } });
                }
              }}
            >
              <View style={styles.chatAvatar}>
                <Text style={styles.chatAvatarText}>{getOtherPerson(chat)?.[0] || '?'}</Text>
              </View>
              <View style={styles.chatInfo}>
                <View style={styles.chatTopRow}>
                  <Text style={styles.chatName} numberOfLines={1}>{getOtherPerson(chat)}</Text>
                  <Text style={styles.chatTime}>{formatTime(chat.lastMessage?.timestamp || chat.updatedAt)}</Text>
                </View>
                {chat.taskId && (
                  <Text style={styles.chatService}>📋 {chat.taskId.serviceType}</Text>
                )}
                <Text style={styles.chatPreview} numberOfLines={1}>
                  {chat.lastMessage?.text || 'No messages yet'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, paddingHorizontal: Spacing.lg, backgroundColor: Colors.primary },
  backBtn: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  headerTitle: { ...Typography.h3, color: Colors.white },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  loadingText: { fontSize: 14, color: Colors.textMuted, marginTop: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  emptyText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  list: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  chatCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceCard, borderRadius: Radius.xl, padding: Spacing.md, marginBottom: 10, ...Shadow.sm, borderWidth: 1, borderColor: Colors.borderLight },
  chatAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: Colors.primaryGhost, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  chatAvatarText: { fontSize: 20, fontWeight: '800', color: Colors.primary },
  chatInfo: { flex: 1 },
  chatTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  chatName: { ...Typography.bodyBold, color: Colors.text, flex: 1, marginRight: 8 },
  chatTime: { fontSize: 11, color: Colors.textMuted, fontWeight: '600' },
  chatService: { fontSize: 11, color: Colors.primary, fontWeight: '700', marginBottom: 2 },
  chatPreview: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
});
