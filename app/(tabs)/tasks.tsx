import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Shadow } from '../../constants/theme';
import { apiGetUserTasks, apiRateTask } from '../../services/api';

type TaskItem = {
  _id: string; serviceType: string; status: string; stage: number;
  stageLabel: string; price: number; proposedPrice?: number;
  helperId?: { _id: string; name: string };
  userRating?: { rating: number; feedback: string };
  createdAt: string;
};

const STAGES = ['Task Started', 'In Progress', 'Documents Submitted', 'Admin Review', 'Completed'];

export default function TasksScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Ongoing');
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  const tabs = ['Ongoing', 'Completed', 'All'];

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGetUserTasks();
      setTasks(res.data.data.tasks || []);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const filteredTasks = activeTab === 'All'
    ? tasks
    : tasks.filter(t =>
        activeTab === 'Ongoing' ? t.status !== 'completed' && t.status !== 'rejected' && t.status !== 'cancelled'
        : t.status === 'completed'
      );

  const handleRate = (taskId: string) => {
    Alert.alert('Rate Service', 'How was your experience?', [
      { text: '⭐ 5 Stars', onPress: () => submitRating(taskId, 5) },
      { text: '⭐ 4 Stars', onPress: () => submitRating(taskId, 4) },
      { text: '⭐ 3 Stars', onPress: () => submitRating(taskId, 3) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const submitRating = async (taskId: string, rating: number) => {
    try {
      await apiRateTask(taskId, { rating, feedback: `${rating} stars` });
      Alert.alert('Thank you!', 'Your rating has been submitted.');
      fetchTasks();
    } catch {
      Alert.alert('Error', 'Could not submit rating. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Tasks</Text>
        <View style={styles.tabContainer}>
          {tabs.map((t, i) => (
            <TouchableOpacity
              key={i}
              activeOpacity={0.85}
              style={[styles.tab, activeTab === t && styles.tabActive]}
              onPress={() => setActiveTab(t)}
            >
              <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      ) : filteredTasks.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>✅</Text>
          <Text style={styles.emptyTitle}>No Tasks Yet</Text>
          <Text style={styles.emptyText}>
            {activeTab === 'Completed' ? 'You have no completed tasks.' : 'Start by applying for a service or hiring a helper.'}
          </Text>
          <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push('/(tabs)/services')} activeOpacity={0.85}>
            <Text style={styles.ctaBtnText}>Browse Services →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
          {filteredTasks.map((task) => (
            <TouchableOpacity
              key={task._id}
              activeOpacity={0.85}
              style={styles.taskCard}
              onPress={() => router.push({ pathname: '/task-detail/[taskId]', params: { taskId: task._id } })}
            >
              <View style={styles.cardHeader}>
                <View style={styles.titleContainer}>
                  <Text style={styles.taskTitle}>{task.serviceType}</Text>
                  <Text style={styles.helperText}>
                    {task.helperId ? `👤 ${task.helperId.name}` : '🤖 AI Assistant'}
                  </Text>
                </View>
                <Text style={styles.priceText}>
                  {task.price > 0 ? `₹${task.price}` : 'Free'}
                </Text>
              </View>

              <View style={styles.progressContainer}>
                {Array.from({ length: 5 }).map((_, idx) => {
                  const stageNum = idx + 1;
                  const isCompleted = stageNum <= task.stage;
                  const isCurrent = stageNum === task.stage;
                  return (
                    <View key={idx} style={styles.progressStep}>
                      <View style={[
                        styles.progressDot,
                        isCompleted && styles.progressDotDone,
                        isCurrent && styles.progressDotCurrent,
                      ]}>
                        {isCompleted && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      {idx < 4 && (
                        <View style={[styles.progressLine, isCompleted && styles.progressLineDone]} />
                      )}
                    </View>
                  );
                })}
              </View>

              <View style={styles.stageLabel}>
                <Text style={styles.stageLabelText}>
                  🟡 Stage {task.stage}/5: {task.stageLabel}
                </Text>
              </View>

              {task.status === 'completed' && !task.userRating && (
                <TouchableOpacity style={styles.rateBtn} onPress={() => handleRate(task._id)} activeOpacity={0.85}>
                  <Text style={styles.rateBtnText}>⭐ Rate this service</Text>
                </TouchableOpacity>
              )}

              {task.userRating && (
                <Text style={styles.ratedText}>
                  ⭐ Rated {task.userRating.rating}/5
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: { padding: Spacing.lg, backgroundColor: Colors.primary, borderBottomLeftRadius: Radius.xl, borderBottomRightRadius: Radius.xl },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: Colors.white, marginBottom: Spacing.md },
  tabContainer: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: Radius.md, padding: 3 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: Radius.sm },
  tabActive: { backgroundColor: Colors.white },
  tabText: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  tabTextActive: { color: Colors.primary },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  loadingText: { fontSize: 14, color: Colors.textMuted, marginTop: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  emptyText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  ctaBtn: { backgroundColor: Colors.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: Radius.lg },
  ctaBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  listContainer: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  taskCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: 12, ...Shadow.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  titleContainer: { flex: 1 },
  taskTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  helperText: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  priceText: { fontSize: 16, fontWeight: '800', color: Colors.primary },
  progressContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  progressStep: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  progressDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: Colors.borderLight, justifyContent: 'center', alignItems: 'center' },
  progressDotDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  progressDotCurrent: { borderColor: Colors.saffron, borderWidth: 3 },
  progressLine: { flex: 1, height: 3, backgroundColor: Colors.borderLight },
  progressLineDone: { backgroundColor: Colors.success },
  checkmark: { color: Colors.white, fontWeight: 'bold', fontSize: 12 },
  stageLabel: { backgroundColor: Colors.primaryGhost, paddingVertical: 6, paddingHorizontal: 12, borderRadius: Radius.md },
  stageLabelText: { fontSize: 13, fontWeight: '600', color: Colors.primaryDark },
  rateBtn: { marginTop: 10, backgroundColor: Colors.warningLight, paddingVertical: 8, borderRadius: Radius.md, alignItems: 'center' },
  rateBtnText: { fontSize: 13, fontWeight: '700', color: Colors.warning },
  ratedText: { marginTop: 8, fontSize: 13, fontWeight: '600', color: Colors.success },
});
