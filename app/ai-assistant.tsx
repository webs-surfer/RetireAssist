import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet, // ✅ IMPORTANT
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiGetAIChat, apiPostAIChat } from '../services/api';
import { askGemini } from '../services/gemini';

type Msg = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  time: string;
};

export default function AIAssistantScreen() {
  const router = useRouter();

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isVoice, setIsVoice] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const scrollRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    apiGetAIChat()
      .then(res => {
        if (res.data.success) setMessages(res.data.data || []);
      })
      .catch(() => {
        // Silently ignore — user may not be logged in yet or network not ready
      })
      .finally(() => setIsTyping(false));
  }, []);

  const sendMessage = async (text = '', audioUri: string | null = null) => {
    if (!text && !audioUri) return;

    const userMsg = {
      id: Date.now().toString(),
      text: text || '🎤 Voice message',
      sender: 'user' as const,
      time: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      let replyObj: { text: string; transcription?: string };

      if (audioUri) {
        // Read audio file as base64 and send to Gemini for transcription
        const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
          encoding: 'base64' as any,
        });
        replyObj = await askGemini('', base64Audio);

        // Update user message with transcription if available
        if (replyObj.transcription) {
          setMessages(prev =>
            prev.map(m => m.id === userMsg.id ? { ...m, text: `🎤 "${replyObj.transcription}"` } : m)
          );
        }
      } else {
        replyObj = await askGemini(text);
      }

      const reply = replyObj.text;

      // Save exchange to backend (fire-and-forget)
      apiPostAIChat([userMsg, { id: (Date.now() + 1).toString(), text: reply, sender: 'ai', time: new Date().toLocaleTimeString() }]).catch(() => {});

      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          text: reply,
          sender: 'ai',
          time: new Date().toLocaleTimeString(),
        },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          text: '⚠️ Error getting response',
          sender: 'ai',
          time: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsTyping(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const handleMicPress = async () => {
    try {
      if (isVoice) {
        if (!recording) return;

        setIsVoice(false);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecording(null);

        if (!uri) return;

        const info = await FileSystem.getInfoAsync(uri);

        if (!info.exists) {
          Alert.alert("Error", "Audio file not found");
          return;
        }

        // ✅ Safe size check
        if (!info.size || info.size < 1000) {
          Alert.alert("Too Short", "Recording is too short");
          return;
        }

        await sendMessage('', uri);
      } else {
        const perm = await Audio.requestPermissionsAsync();
        if (perm.status !== 'granted') return;

        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );

        setRecording(newRecording);
        setIsVoice(true);
      }
    } catch {
      Alert.alert('Mic error');
    }
  };

  useEffect(() => {
    if (isVoice) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      anim.start();
      return () => anim.stop();
    }
  }, [isVoice]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🤖 AI Assistant</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.chat}>
          {messages.map(m => (
            <View key={m.id} style={m.sender === 'user' ? styles.right : styles.left}>
              <View style={m.sender === 'user' ? styles.userBubble : styles.aiBubble}>
                <Text style={m.sender === 'user' ? styles.userText : styles.aiText}>{m.text}</Text>
              </View>
            </View>
          ))}

          {isTyping && <ActivityIndicator style={{ margin: 10 }} />}
        </ScrollView>

        <View style={styles.inputBox}>
          <TouchableOpacity onPress={handleMicPress}>
            <Text style={{ fontSize: 20 }}>🎙️</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask anything..."
          />

          <TouchableOpacity onPress={() => sendMessage(input)} disabled={!input.trim()}>
            <Text style={{ fontSize: 20 }}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#4f46e5',
  },

  back: { color: 'white' },
  title: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  chat: { padding: 10 },

  left: { alignSelf: 'flex-start', marginVertical: 5 },
  right: { alignSelf: 'flex-end', marginVertical: 5 },

  userBubble: {
    backgroundColor: '#4f46e5',
    padding: 10,
    borderRadius: 10,
  },

  aiBubble: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 10,
  },

  userText: { color: 'white' },
  aiText: { color: 'black' },

  inputBox: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    alignItems: 'center',
  },

  input: {
    flex: 1,
    marginHorizontal: 10,
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,
  },
});