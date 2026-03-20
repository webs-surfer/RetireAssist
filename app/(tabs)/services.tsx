import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, Shadow } from '../../constants/theme';
import { apiGetServices } from '../../services/api';

type ServiceItem = {
  _id: string; title: string; category: string; difficulty: string;
  estimatedDays: number; icon: string; color: string;
};

export default function ServicesScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('All');
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userAge, setUserAge] = useState<number | undefined>();

  const categories = ['All', 'Pension', 'Insurance', 'Government', 'Financial', 'Health'];

  useEffect(() => {
    AsyncStorage.getItem('user').then(u => {
      if (u) {
        const parsed = JSON.parse(u);
        if (parsed.age) setUserAge(parsed.age);
      }
    });
  }, []);

  useEffect(() => {
    fetchServices();
  }, [activeCategory, userAge]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await apiGetServices(userAge, activeCategory);
      setServices(res.data.data.services || []);
    } catch {
      // Fallback if backend is down
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (diff: string) => {
    if (diff === 'Easy') return Colors.success;
    if (diff === 'Medium') return Colors.warning;
    return Colors.danger;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Services</Text>
        <Text style={styles.headerSubtitle}>Find and apply for government schemes</Text>
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
          {categories.map((cat, idx) => (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.85}
              style={[styles.filterChip, activeCategory === cat && styles.filterChipActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.filterText, activeCategory === cat && styles.filterTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading services...</Text>
        </View>
      ) : services.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No Services Found</Text>
          <Text style={styles.emptyText}>No services match your criteria. Try a different category.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
          {services.map((s) => (
            <TouchableOpacity
              key={s._id}
              activeOpacity={0.85}
              style={[styles.serviceCard, { backgroundColor: s.color }]}
              onPress={() => router.push({ pathname: '/service-detail', params: { id: s._id, title: s.title } })}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.serviceIcon}>{s.icon}</Text>
              </View>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceTitle}>{s.title}</Text>
                <View style={styles.metaRow}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{s.category}</Text>
                  </View>
                  <Text style={styles.timeText}>⏳ {s.estimatedDays} days</Text>
                </View>
              </View>
              <View style={styles.difficultyColumn}>
                <View style={[styles.difficultyDot, { backgroundColor: getDifficultyColor(s.difficulty) }]} />
                <Text style={[styles.difficultyText, { color: getDifficultyColor(s.difficulty) }]}>{s.difficulty}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: { padding: Spacing.lg, paddingBottom: Spacing.md, backgroundColor: Colors.primary, borderBottomLeftRadius: Radius.xl, borderBottomRightRadius: Radius.xl },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: Colors.white, marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  filterContainer: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, gap: 8, alignItems: 'center' },
  filterChip: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface },
  filterChipActive: { backgroundColor: Colors.saffron, borderColor: Colors.saffron },
  filterText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  filterTextActive: { color: Colors.white },
  listContainer: { padding: Spacing.md, paddingBottom: Spacing.xxl, gap: 12 },
  serviceCard: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: Radius.lg, ...Shadow.sm },
  iconContainer: { width: 50, height: 50, borderRadius: Radius.md, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  serviceIcon: { fontSize: 24 },
  serviceInfo: { flex: 1 },
  serviceTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  categoryBadge: { backgroundColor: 'rgba(0,0,0,0.06)', paddingVertical: 2, paddingHorizontal: 8, borderRadius: Radius.full },
  categoryText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  timeText: { fontSize: 11, color: Colors.textMuted },
  difficultyColumn: { alignItems: 'flex-end' },
  difficultyDot: { width: 10, height: 10, borderRadius: 5, marginBottom: 4 },
  difficultyText: { fontSize: 11, fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: Colors.textMuted },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  emptyText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center' },
});
