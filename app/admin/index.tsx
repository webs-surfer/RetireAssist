import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Shadow } from '../../constants/theme';
import { apiAdminGetStats, apiAdminGetHelpers, apiAdminVerifyHelper, apiAdminGetDocuments, apiAdminVerifyDocument } from '../../services/api';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [helpers, setHelpers] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'kyc' | 'docs'>('stats');

  const loadData = async () => {
    try {
      const [statsRes, helpersRes, docsRes] = await Promise.all([
        apiAdminGetStats(),
        apiAdminGetHelpers('pending'),
        apiAdminGetDocuments('pending'),
      ]);
      setStats(statsRes.data.data.stats);
      setHelpers(helpersRes.data.data.helpers);
      setDocuments(docsRes.data.data.documents);
    } catch (err) {
      Alert.alert('Error', 'Failed to load admin data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);
  const onRefresh = () => { setRefreshing(true); loadData(); };

  const handleKycAction = async (profileId: string, action: 'approve' | 'reject') => {
    Alert.prompt(
      `${action === 'approve' ? 'Approve' : 'Reject'} KYC`,
      `Provide feedback to the helper:`,
      async (feedback) => {
        try {
          await apiAdminVerifyHelper(profileId, { action, feedback });
          Alert.alert('Success', `KYC ${action}d`);
          loadData();
        } catch (err) {
          Alert.alert('Error', 'Action failed');
        }
      }
    );
  };

  const handleDocAction = async (docId: string, action: 'approve' | 'reject') => {
    Alert.prompt(
      `${action === 'approve' ? 'Approve' : 'Reject'} Document`, // fixed typo here
      `Provide feedback or instructions:`,
      async (feedback) => {
        try {
          await apiAdminVerifyDocument(docId, { action, feedback });
          Alert.alert('Success', `Document ${action}d`);
          loadData();
        } catch (err) {
          Alert.alert('Error', 'Action failed');
        }
      }
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>👑 Admin Portal</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.tabsRow}>
        <TouchableOpacity style={[styles.tab, activeTab === 'stats' && styles.tabActive]} onPress={() => setActiveTab('stats')}>
          <Text style={[styles.tabText, activeTab === 'stats' && styles.tabTextActive]}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'kyc' && styles.tabActive]} onPress={() => setActiveTab('kyc')}>
          <Text style={[styles.tabText, activeTab === 'kyc' && styles.tabTextActive]}>KYC ({helpers.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'docs' && styles.tabActive]} onPress={() => setActiveTab('docs')}>
          <Text style={[styles.tabText, activeTab === 'docs' && styles.tabTextActive]}>Docs ({documents.length})</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {activeTab === 'stats' && stats && (
          <View style={styles.grid}>
            <View style={styles.statCard}><Text style={styles.statVal}>{stats.totalUsers}</Text><Text style={styles.statLabel}>Users</Text></View>
            <View style={styles.statCard}><Text style={styles.statVal}>{stats.totalHelpers}</Text><Text style={styles.statLabel}>Helpers</Text></View>
            <View style={styles.statCard}><Text style={styles.statVal}>{stats.totalTasks}</Text><Text style={styles.statLabel}>Total Tasks</Text></View>
            <View style={styles.statCard}><Text style={styles.statVal}>{stats.completedTasks}</Text><Text style={styles.statLabel}>Tasks Done</Text></View>
            <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}><Text style={[styles.statVal, { color: Colors.saffron }]}>{stats.pendingKyc}</Text><Text style={styles.statLabel}>Pending KYC</Text></View>
            <View style={[styles.statCard, { backgroundColor: '#E1F5FE' }]}><Text style={[styles.statVal, { color: '#0288D1' }]}>{stats.pendingDocs}</Text><Text style={styles.statLabel}>Pending Docs</Text></View>
          </View>
        )}

        {activeTab === 'kyc' && (
          <View>
            {helpers.length === 0 ? (
              <Text style={styles.emptyText}>No pending KYC requests</Text>
            ) : helpers.map(h => (
              <View key={h._id} style={styles.listCard}>
                <Text style={styles.cardTitle}>{h.userId?.name} <Text style={{ fontSize: 12, fontWeight: 'normal' }}>({h.userId?.phone})</Text></Text>
                <Text style={styles.cardSub}>Exp: {h.experience} yrs • Langs: {h.languages.join(', ')}</Text>
                <Text style={styles.cardSub}>Services: {h.servicesOffered.join(', ')}</Text>
                <View style={styles.actionRow}>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.danger }]} onPress={() => handleKycAction(h._id, 'reject')}><Text style={styles.actionBtnText}>Reject ❌</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.success }]} onPress={() => handleKycAction(h._id, 'approve')}><Text style={styles.actionBtnText}>Approve ✅</Text></TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'docs' && (
          <View>
            {documents.length === 0 ? (
              <Text style={styles.emptyText}>No pending document reviews</Text>
            ) : documents.map(d => (
              <View key={d._id} style={styles.listCard}>
                <Text style={styles.cardTitle}>{d.fileName}</Text>
                <Text style={styles.cardSub}>Task: {d.taskId?.serviceType}</Text>
                <Text style={styles.cardSub}>Uploaded by: {d.uploadedBy?.name}</Text>
                <View style={styles.actionRow}>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.danger }]} onPress={() => handleDocAction(d._id, 'reject')}><Text style={styles.actionBtnText}>Reject ❌</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.success }]} onPress={() => handleDocAction(d._id, 'approve')}><Text style={styles.actionBtnText}>Approve ✅</Text></TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, backgroundColor: '#1E293B' },
  backBtn: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.white },
  tabsRow: { flexDirection: 'row', backgroundColor: '#1E293B', paddingHorizontal: Spacing.md },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.saffron },
  tabText: { color: 'rgba(255,255,255,0.6)', fontWeight: '600', fontSize: 14 },
  tabTextActive: { color: Colors.white, fontWeight: '800' },
  content: { padding: Spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '48%', backgroundColor: Colors.surface, padding: Spacing.lg, borderRadius: Radius.lg, alignItems: 'center', ...Shadow.sm },
  statVal: { fontSize: 32, fontWeight: '900', color: Colors.primary },
  statLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600', marginTop: 4 },
  listCard: { backgroundColor: Colors.surface, padding: Spacing.md, borderRadius: Radius.lg, marginBottom: Spacing.md, ...Shadow.sm },
  cardTitle: { fontSize: 16, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  cardSub: { fontSize: 13, color: Colors.textSecondary, marginBottom: 2 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: Spacing.md },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: Radius.md, alignItems: 'center' },
  actionBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  emptyText: { textAlign: 'center', color: Colors.textMuted, marginTop: Spacing.xl, fontSize: 16 },
});
