import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  ActivityIndicator, Animated
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io as socketIO, Socket } from 'socket.io-client';
import { Colors, Spacing, Radius, Shadow } from '../../constants/theme';
import { SOCKET_URL } from '../../constants/api';
import { apiGetChatByTask, apiSendMessage } from '../../services/api';

type Msg = {
  _id: string;
  sender?: string;
  senderId?: { _id: string; name: string } | string;
  senderName?: string;
  text: string;
  createdAt: string;
};

export default function ChatScreen() {
  const router = useRouter();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState('');
  const [chatId, setChatId] = useState<string | null>(null);
  const [otherTyping, setOtherTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const getSenderName = (msg: Msg): string => {
    if (msg.senderName) return msg.senderName;
    if (msg.senderId && typeof msg.senderId === 'object') return msg.senderId.name;
    return 'Unknown';
  };

  const getSenderId = (msg: Msg): string => {
    if (msg.sender) return msg.sender;
    if (msg.senderId) {
      if (typeof msg.senderId === 'object') return msg.senderId._id;
      return msg.senderId;
    }
    return '';
  };

  const normalizeMessages = (msgs: any[]): Msg[] => {
    return msgs.map(m => ({
      _id: m._id || m.id || String(Date.now() + Math.random()),
      sender: getSenderId(m),
      senderId: m.senderId,
      senderName: getSenderName(m),
      text: m.text || '',
      createdAt: m.createdAt || new Date().toISOString(),
    }));
  };

  const scrollToBottom = useCallback((animated = true) => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated }), 150);
  }, []);

  useEffect(() => {
    loadChat();
    return () => {
      socketRef.current?.disconnect();
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
  }, []);

  const loadChat = async () => {
    setLoading(true);
    setError(null);
    try {
      const stored = await AsyncStorage.getItem('user');
      const user = stored ? JSON.parse(stored) : null;
      const uid = user?._id || '';
      setUserId(uid);

      if (!taskId) throw new Error('No task ID provided');

      const res = await apiGetChatByTask(taskId);
      const chatData = res.data.data;
      
      const normalised = normalizeMessages(chatData.messages || []);
      setMessages(normalised);

      let fetchedChatId: string | null = null;
      if (chatData.chat?._id) {
        fetchedChatId = chatData.chat._id;
        setChatId(fetchedChatId);
      }

      // Connect socket
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const socket = socketIO(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
      });

      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        if (fetchedChatId) socket.emit('join_chat', fetchedChatId);
        if (taskId) socket.emit('join_task', taskId);
      });

      socket.on('connect_error', (err) => {
        console.warn('Socket connection error:', err.message);
      });

      // new_message can come in two shapes: { message: {...} } or directly {...}
      socket.on('new_message', (payload: any) => {
        const raw = payload?.message || payload;
        const norm = normalizeMessages([raw])[0];
        setMessages(prev => {
          // avoid duplicates
          if (prev.some(m => m._id === norm._id)) return prev;
          return [...prev, norm];
        });
        scrollToBottom();
      });

      socket.on('user_typing', ({ userId: typerId }: { userId: string }) => {
        if (typerId !== uid) {
          setOtherTyping(true);
          if (typingTimeout.current) clearTimeout(typingTimeout.current);
          typingTimeout.current = setTimeout(() => setOtherTyping(false), 2500);
        }
      });

      socketRef.current = socket;

      // Fade in
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      scrollToBottom(false);
    } catch (e: any) {
      console.error('loadChat error:', e);
      setError(e.response?.data?.message || e.message || 'Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || sending || !chatId) return;
    const text = input.trim();
    setInput('');
    setSending(true);

    // Optimistic UI
    const optimistic: Msg = {
      _id: `opt_${Date.now()}`,
      sender: userId,
      text,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);
    scrollToBottom();

    try {
      const res = await apiSendMessage({ chatId, text });
      const saved = res.data.data?.message;
      if (saved) {
        const norm = normalizeMessages([saved])[0];
        setMessages(prev => prev.map(m => m._id === optimistic._id ? norm : m));
      }
    } catch (e: any) {
      // Remove optimistic on failure
      setMessages(prev => prev.filter(m => m._id !== optimistic._id));
      setInput(text); // restore
      console.warn('Send failed:', e.response?.data?.message || e.message);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (chatId) socketRef.current?.emit('typing', { chatId, isTyping: true });
  };

  const formatTime = (date: string) => {
    try {
      return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>💬 Chat</Text>
          {otherTyping && (
            <Animated.Text style={[styles.typingText, { opacity: fadeAnim }]}>other is typing...</Animated.Text>
          )}
        </View>
        <View style={{ width: 50 }} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading chat...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={{ fontSize: 40, marginBottom: 16 }}>⚠️</Text>
          <Text style={styles.errorTitle}>Chat Unavailable</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadChat}>
            <Text style={styles.retryBtnText}>🔄 Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={90}
        >
          <Animated.ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            style={{ opacity: fadeAnim }}
          >
            {messages.length === 0 ? (
              <View style={styles.emptyChat}>
                <Text style={{ fontSize: 52, marginBottom: 12 }}>💬</Text>
                <Text style={styles.emptyChatTitle}>Start the Conversation</Text>
                <Text style={styles.emptyChatText}>
                  Discuss task details, pricing, and timelines with your helper.
                </Text>
              </View>
            ) : (
              messages.map((msg) => {
                const isMe = getSenderId(msg) === userId;
                const name = getSenderName(msg);
                return (
                  <View key={msg._id} style={[styles.msgRow, isMe && styles.msgRowMe]}>
                    {!isMe && (
                      <View style={styles.msgAvatar}>
                        <Text style={styles.msgAvatarText}>{name?.charAt(0) ?? '?'}</Text>
                      </View>
                    )}
                    <View style={[styles.msgBubble, isMe ? styles.msgBubbleMe : styles.msgBubbleOther]}>
                      {!isMe && name && <Text style={styles.senderName}>{name}</Text>}
                      <Text style={[styles.msgText, isMe && styles.msgTextMe]}>{msg.text}</Text>
                      <Text style={[styles.msgTime, isMe && styles.msgTimeMe]}>{formatTime(msg.createdAt)}</Text>
                    </View>
                  </View>
                );
              })
            )}
            {otherTyping && (
              <View style={styles.msgRow}>
                <View style={[styles.msgBubble, styles.msgBubbleOther, styles.typingBubble]}>
                  <Text style={styles.typingDots}>● ● ●</Text>
                </View>
              </View>
            )}
          </Animated.ScrollView>

          <View style={styles.inputBar}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor={Colors.textMuted}
              value={input}
              onChangeText={(t) => { setInput(t); handleTyping(); }}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.sendBtn, (!input.trim() || sending || !chatId) && styles.sendBtnDisabled]}
              disabled={!input.trim() || sending || !chatId}
              onPress={sendMessage}
            >
              {sending
                ? <ActivityIndicator size="small" color={Colors.white} />
                : <Text style={styles.sendBtnText}>▶</Text>
              }
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0F2F5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, paddingHorizontal: Spacing.lg, backgroundColor: Colors.primary, ...Shadow.sm },
  backBtn: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.white },
  typingText: { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontStyle: 'italic', marginTop: 2 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  loadingText: { fontSize: 14, color: Colors.textMuted, marginTop: 12 },
  errorTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  errorText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  retryBtn: { backgroundColor: Colors.primary, paddingVertical: 10, paddingHorizontal: 24, borderRadius: Radius.full },
  retryBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  messageList: { padding: Spacing.md, paddingBottom: Spacing.lg, flexGrow: 1 },
  emptyChat: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyChatTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  emptyChatText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  msgRow: { marginBottom: 10, alignItems: 'flex-start', flexDirection: 'row' },
  msgRowMe: { alignItems: 'flex-end', flexDirection: 'row-reverse' },
  msgAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 8, marginTop: 4 },
  msgAvatarText: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  msgBubble: { maxWidth: '72%', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 18 },
  msgBubbleMe: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  msgBubbleOther: { backgroundColor: Colors.white, borderBottomLeftRadius: 4, ...Shadow.sm },
  senderName: { fontSize: 11, fontWeight: '700', color: Colors.primary, marginBottom: 3 },
  msgText: { fontSize: 15, color: Colors.text, lineHeight: 20 },
  msgTextMe: { color: Colors.white },
  msgTime: { fontSize: 10, color: Colors.textMuted, marginTop: 4, alignSelf: 'flex-end' },
  msgTimeMe: { color: 'rgba(255,255,255,0.6)' },
  typingBubble: { paddingVertical: 8 },
  typingDots: { color: Colors.textMuted, fontSize: 18, letterSpacing: 3 },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: Spacing.sm, paddingHorizontal: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.borderLight, backgroundColor: Colors.white },
  textInput: { flex: 1, minHeight: 40, maxHeight: 110, backgroundColor: '#F0F2F5', borderRadius: Radius.lg, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: Colors.text },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  sendBtnDisabled: { backgroundColor: Colors.borderLight },
  sendBtnText: { color: Colors.white, fontSize: 18, fontWeight: 'bold' },
});
