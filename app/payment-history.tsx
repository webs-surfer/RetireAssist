import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Shadow, Typography } from '../constants/theme';
import { apiGetPaymentHistory } from '../services/api';

type Payment = {
  _id: string; amount: number; status: string; method?: string;
  taskId?: { serviceType: string }; createdAt: string;
};

export default function PaymentHistoryScreen() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await apiGetPaymentHistory();
      setPayments(res.data.data?.payments || []);
    } catch { setPayments([]); }
    finally { setLoading(false); }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return { bg: Colors.successLight, color: Colors.success, icon: '✅' };
      case 'pending': return { bg: Colors.warningLight, color: Colors.warning, icon: '⏳' };
      case 'failed': return { bg: Colors.dangerLight, color: Colors.danger, icon: '❌' };
      default: return { bg: Colors.surface, color: Colors.textMuted, icon: '💳' };
    }
  };

  const totalSpent = payments.filter(p => p.status === 'completed').reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💳 Payments</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNum}>₹{totalSpent}</Text>
          <Text style={styles.summaryLabel}>Total Spent</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryNum, { color: Colors.info }]}>{payments.length}</Text>
          <Text style={styles.summaryLabel}>Transactions</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : payments.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ fontSize: 52, marginBottom: 12 }}>💳</Text>
          <Text style={styles.emptyTitle}>No Payments Yet</Text>
          <Text style={styles.emptyText}>Your payment history will appear here after you complete a task.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {payments.map(p => {
            const s = getStatusStyle(p.status);
            return (
              <View key={p._id} style={styles.payCard}>
                <View style={[styles.payIcon, { backgroundColor: s.bg }]}>
                  <Text style={{ fontSize: 20 }}>{s.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.payTitle}>{p.taskId?.serviceType || 'Service Payment'}</Text>
                  <Text style={styles.payDate}>
                    {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {p.method ? ` · ${p.method}` : ''}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.payAmount, { color: s.color }]}>₹{p.amount}</Text>
                  <Text style={[styles.payStatus, { color: s.color }]}>{p.status}</Text>
                </View>
              </View>
            );
          })}
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
  summaryRow: { flexDirection: 'row', padding: Spacing.md, gap: 10 },
  summaryCard: { flex: 1, backgroundColor: Colors.surfaceCard, borderRadius: Radius.xl, padding: Spacing.md, alignItems: 'center', ...Shadow.sm },
  summaryNum: { fontSize: 24, fontWeight: '900', color: Colors.primary },
  summaryLabel: { ...Typography.caption, color: Colors.textSecondary, marginTop: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  emptyText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  list: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  payCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceCard, borderRadius: Radius.xl, padding: Spacing.md, marginBottom: 10, gap: 12, ...Shadow.sm, borderWidth: 1, borderColor: Colors.borderLight },
  payIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  payTitle: { ...Typography.bodyBold, color: Colors.text },
  payDate: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  payAmount: { fontSize: 18, fontWeight: '900' },
  payStatus: { fontSize: 11, fontWeight: '700', marginTop: 2, textTransform: 'capitalize' },
});
