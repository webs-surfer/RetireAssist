import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, Radius, Shadow } from '../constants/theme';
import { apiGetServiceById } from '../services/api';

type ServiceData = {
  _id: string; title: string; category: string; description: string;
  icon: string; difficulty: string; estimatedDays: number; fees: string;
  eligibility: string[]; requiredDocuments: string[]; benefits: string[];
  applicationSteps: string[];
};

export default function ServiceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<'info' | 'apply'>('info');
  const [showModal, setShowModal] = useState(false);
  const [service, setService] = useState<ServiceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchService();
  }, [id]);

  const fetchService = async () => {
    try {
      const res = await apiGetServiceById(id as string);
      setService(res.data.data.service);
    } catch {
      setService(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!service) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>❌</Text>
          <Text style={styles.sectionTitle}>Service Not Found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.applyBtn}>
            <Text style={styles.applyBtnText}>Go Back</Text>
          </TouchableOpacity>
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
        <Text style={styles.headerTitle} numberOfLines={1}>{service.title}</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.tab, activeTab === 'info' && styles.tabActive]}
          onPress={() => setActiveTab('info')}
        >
          <Text style={[styles.tabText, activeTab === 'info' && styles.tabTextActive]}>ℹ️ Information</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.tab, activeTab === 'apply' && styles.tabActive]}
          onPress={() => setActiveTab('apply')}
        >
          <Text style={[styles.tabText, activeTab === 'apply' && styles.tabTextActive]}>📝 Apply</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'info' ? (
          <>
            <View style={styles.heroCard}>
              <Text style={styles.heroIcon}>{service.icon}</Text>
              <Text style={styles.heroTitle}>{service.title}</Text>
              <Text style={styles.heroDesc}>{service.description}</Text>
              <View style={styles.metaRow}>
                <View style={styles.metaChip}><Text style={styles.metaText}>⏳ {service.estimatedDays} days</Text></View>
                <View style={styles.metaChip}><Text style={styles.metaText}>📂 {service.category}</Text></View>
                <View style={styles.metaChip}><Text style={styles.metaText}>💰 {service.fees}</Text></View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>✅ Eligibility</Text>
            <View style={styles.listCard}>
              {service.eligibility.map((e, i) => (
                <View key={i} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listText}>{e}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>📄 Required Documents</Text>
            <View style={styles.listCard}>
              {service.requiredDocuments.map((d, i) => (
                <View key={i} style={styles.listItem}>
                  <Text style={styles.checkmark}>📎</Text>
                  <Text style={styles.listText}>{d}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>🎁 Benefits</Text>
            <View style={styles.listCard}>
              {service.benefits.map((b, i) => (
                <View key={i} style={styles.listItem}>
                  <Text style={styles.bullet}>🟢</Text>
                  <Text style={styles.listText}>{b}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>📋 Application Steps</Text>
            <View style={styles.listCard}>
              {service.applicationSteps.map((s, i) => (
                <View key={i} style={styles.listItem}>
                  <View style={styles.stepBadge}><Text style={styles.stepNum}>{i + 1}</Text></View>
                  <Text style={styles.listText}>{s}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            <View style={styles.applyHero}>
              <Text style={{ fontSize: 48, marginBottom: 8 }}>📝</Text>
              <Text style={styles.sectionTitle}>Apply for {service.title}</Text>
              <Text style={styles.heroDesc}>Choose how you'd like to proceed with your application.</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.optionCard}
              onPress={() => router.push('/ai-assistant')}
            >
              <Text style={styles.optionIcon}>🤖</Text>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Apply with AI Assistant</Text>
                <Text style={styles.optionDesc}>Get guided step-by-step with our Gemini AI. Free of charge.</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.optionCard}
              onPress={() => setShowModal(true)}
            >
              <Text style={styles.optionIcon}>👤</Text>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Hire a Verified Helper</Text>
                <Text style={styles.optionDesc}>A local expert handles everything. Charges ₹200–600.</Text>
              </View>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Find a Helper</Text>
            <Text style={styles.modalDesc}>We'll match you with a verified helper near your location who specializes in {service.category} services.</Text>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.applyBtn}
              onPress={() => { setShowModal(false); router.push('/(tabs)/helpers'); }}
            >
              <Text style={styles.applyBtnText}>Browse Helpers →</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowModal(false)} style={{ marginTop: 12 }}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, backgroundColor: Colors.primary },
  backBtn: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.white, flex: 1, textAlign: 'center' },
  tabRow: { flexDirection: 'row', backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: Colors.textMuted },
  tabTextActive: { color: Colors.primary },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  heroCard: { backgroundColor: Colors.surface, padding: Spacing.lg, borderRadius: Radius.lg, alignItems: 'center', marginBottom: Spacing.xl, ...Shadow.sm },
  heroIcon: { fontSize: 48, marginBottom: 8 },
  heroTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.text, textAlign: 'center', marginBottom: 6 },
  heroDesc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 12 },
  metaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  metaChip: { backgroundColor: Colors.primaryGhost, paddingVertical: 4, paddingHorizontal: 10, borderRadius: Radius.full },
  metaText: { fontSize: 12, fontWeight: '600', color: Colors.primaryDark },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.text, marginBottom: 8, marginTop: 8 },
  listCard: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.lg, ...Shadow.sm },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, gap: 8 },
  bullet: { fontSize: 14, marginTop: 1 },
  checkmark: { fontSize: 14, marginTop: 1 },
  listText: { fontSize: 14, color: Colors.text, flex: 1, lineHeight: 20 },
  stepBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  stepNum: { color: Colors.white, fontSize: 11, fontWeight: 'bold' },
  applyHero: { alignItems: 'center', marginBottom: Spacing.xl },
  optionCard: { flexDirection: 'row', backgroundColor: Colors.surface, padding: Spacing.lg, borderRadius: Radius.lg, marginBottom: Spacing.md, ...Shadow.sm, alignItems: 'center' },
  optionIcon: { fontSize: 36, marginRight: Spacing.md },
  optionInfo: { flex: 1 },
  optionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  optionDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  applyBtn: { backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: Radius.lg, alignItems: 'center', width: '100%', ...Shadow.md },
  applyBtnText: { color: Colors.white, fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalCard: { backgroundColor: Colors.white, padding: Spacing.xl, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text, marginBottom: 8 },
  modalDesc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: Spacing.lg },
  cancelText: { color: Colors.textMuted, fontSize: 14, fontWeight: '600' },
});
