import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, Radius, Shadow } from '../../constants/theme';
import { apiGetTaskById, apiRateTask } from '../../services/api';

const STAGES = ['Created', 'In Progress', 'Documents Submitted', 'Admin Review', 'Completed'];

export default function TaskDetailScreen() {
  const router = useRouter();
  const { taskId } = useLocalSearchParams();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTask(); }, []);

  const fetchTask = async () => {
    try {
      const res = await apiGetTaskById(taskId as string);
      setTask(res.data.data.task);
    } catch {
      setTask(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRate = () => {
    Alert.alert('Rate Service', 'How was your experience?', [
      { text: '⭐ 5 Stars', onPress: () => submitRating(5) },
      { text: '⭐ 4 Stars', onPress: () => submitRating(4) },
      { text: '⭐ 3 Stars', onPress: () => submitRating(3) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const submitRating = async (rating: number) => {
    try {
      await apiRateTask(taskId as string, { rating, feedback: `Rated ${rating} stars` });
      Alert.alert('Thank you!', 'Your rating has been submitted.');
      fetchTask();
    } catch {
      Alert.alert('Error', 'Could not submit rating.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      </SafeAreaView>
    );
  }

  if (!task) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>❌</Text>
          <Text style={styles.emptyTitle}>Task Not Found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.ctaBtn}><Text style={styles.ctaBtnText}>Go Back</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Details</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>{task.serviceType}</Text>
          <Text style={styles.heroPrice}>{task.price > 0 ? `₹${task.price}` : 'Free'}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>👤</Text>
            <Text style={styles.infoLabel}>Helper</Text>
            <Text style={styles.infoValue}>{task.helperId?.name || 'AI Assistant'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>📅</Text>
            <Text style={styles.infoLabel}>Created</Text>
            <Text style={styles.infoValue}>{new Date(task.createdAt).toLocaleDateString()}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>📊</Text>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={[styles.infoValue, { color: task.status === 'completed' ? Colors.success : Colors.primary }]}>
              {task.status}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Progress</Text>
        <View style={styles.progressCard}>
          {STAGES.map((stage, idx) => {
            const stageNum = idx + 1;
            const isDone = stageNum <= task.stage;
            const isCurrent = stageNum === task.stage;
            return (
              <View key={idx} style={styles.stageRow}>
                <View style={[styles.stageDot, isDone && styles.stageDotDone, isCurrent && styles.stageDotCurrent]}>
                  {isDone && <Text style={styles.stageCheck}>✓</Text>}
                </View>
                {idx < STAGES.length - 1 && (
                  <View style={[styles.stageLine, isDone && styles.stageLineDone]} />
                )}
                <Text style={[styles.stageText, isDone && styles.stageTextDone, isCurrent && styles.stageTextCurrent]}>
                  {stage}
                </Text>
              </View>
            );
          })}
        </View>

        {task.description && (
          <>
            <Text style={styles.sectionTitle}>Description</Text>
            <View style={styles.descCard}>
              <Text style={styles.descText}>{task.description}</Text>
            </View>
          </>
        )}

        {task.helperId && (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.chatBtn}
            onPress={() => router.push({ pathname: '/chat/[taskId]', params: { taskId: task._id } })}
          >
            <Text style={styles.chatBtnText}>💬 Chat with Helper</Text>
          </TouchableOpacity>
        )}

        {task.status === 'completed' && !task.userRating && (
          <TouchableOpacity activeOpacity={0.85} style={styles.rateBtn} onPress={handleRate}>
            <Text style={styles.rateBtnText}>⭐ Rate this Service</Text>
          </TouchableOpacity>
        )}

        {task.userRating && (
          <View style={styles.ratingDisplay}>
            <Text style={styles.ratingText}>⭐ You rated: {task.userRating.rating}/5</Text>
            {task.userRating.feedback && <Text style={styles.feedbackText}>&quot;{task.userRating.feedback}&quot;</Text>}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  ctaBtn: { backgroundColor: Colors.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: Radius.lg },
  ctaBtnText: { color: Colors.white, fontWeight: '700' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, backgroundColor: Colors.primary },
  backBtn: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.white },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  heroCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surface, padding: Spacing.lg, borderRadius: Radius.lg, marginBottom: Spacing.lg, ...Shadow.md },
  heroTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, flex: 1 },
  heroPrice: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  infoRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.lg },
  infoItem: { flex: 1, backgroundColor: Colors.surface, padding: Spacing.md, borderRadius: Radius.md, alignItems: 'center', ...Shadow.sm },
  infoIcon: { fontSize: 24, marginBottom: 4 },
  infoLabel: { fontSize: 11, fontWeight: '600', color: Colors.textMuted },
  infoValue: { fontSize: 13, fontWeight: '700', color: Colors.text, marginTop: 2, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.text, marginBottom: 12 },
  progressCard: { backgroundColor: Colors.surface, padding: Spacing.lg, borderRadius: Radius.lg, marginBottom: Spacing.lg, ...Shadow.sm },
  stageRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  stageDot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: Colors.borderLight, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  stageDotDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  stageDotCurrent: { borderColor: Colors.saffron, borderWidth: 3 },
  stageCheck: { color: Colors.white, fontWeight: 'bold', fontSize: 14 },
  stageLine: { width: 3, height: 20, backgroundColor: Colors.borderLight, marginLeft: 12.5, position: 'absolute', top: 28 },
  stageLineDone: { backgroundColor: Colors.success },
  stageText: { fontSize: 14, color: Colors.textMuted, marginLeft: 12 },
  stageTextDone: { color: Colors.text, fontWeight: '600' },
  stageTextCurrent: { color: Colors.primary, fontWeight: '700' },
  descCard: { backgroundColor: Colors.surface, padding: Spacing.md, borderRadius: Radius.md, marginBottom: Spacing.lg, ...Shadow.sm },
  descText: { fontSize: 14, color: Colors.text, lineHeight: 20 },
  chatBtn: { backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: Radius.lg, alignItems: 'center', marginBottom: 12, ...Shadow.md },
  chatBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  rateBtn: { backgroundColor: '#FFF3E0', paddingVertical: 14, borderRadius: Radius.lg, alignItems: 'center', marginBottom: 12 },
  rateBtnText: { color: Colors.saffron, fontSize: 16, fontWeight: '700' },
  ratingDisplay: { backgroundColor: '#E8F5E9', padding: Spacing.md, borderRadius: Radius.lg, alignItems: 'center' },
  ratingText: { fontSize: 16, fontWeight: '700', color: Colors.success },
  feedbackText: { fontSize: 13, color: Colors.textSecondary, fontStyle: 'italic', marginTop: 4 },
});
