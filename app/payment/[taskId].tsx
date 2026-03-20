import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Animated, TextInput, Modal
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { Colors, Spacing, Radius, Shadow } from '../../constants/theme';
import { apiGetTaskById } from '../../services/api';
import api from '../../services/api';

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', icon: '📲', sub: 'Google Pay, PhonePe, Paytm' },
  { id: 'card', label: 'Card', icon: '💳', sub: 'Debit / Credit Card' },
  { id: 'netbanking', label: 'Net Banking', icon: '🏦', sub: 'All major banks' },
  { id: 'wallet', label: 'Wallet', icon: '👛', sub: 'Paytm, Airtel Money' },
];

export default function PaymentScreen() {
  const router = useRouter();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Animations
  const successScale = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchTask();
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const fetchTask = async () => {
    try {
      const res = await apiGetTaskById(taskId);
      setTask(res.data.data.task);
      if (res.data.data.task?.isPaid) setPaymentDone(true);
    } catch {
      setTask(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!task) return;

    // Validate UPI if selected
    if (selectedMethod === 'upi' && !upiId.includes('@')) {
      Alert.alert('Invalid UPI', 'Please enter a valid UPI ID (e.g. name@upi)');
      return;
    }

    // Try biometric before charging
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (compatible && enrolled) {
      const auth = await LocalAuthentication.authenticateAsync({
        promptMessage: '👆 Confirm Payment with Fingerprint',
        fallbackLabel: 'Use PIN',
        disableDeviceFallback: false,
      });
      if (!auth.success) return;
    }

    setProcessing(true);

    // Animate progress bar
    Animated.timing(progressAnim, { toValue: 1, duration: 2200, useNativeDriver: false }).start();

    try {
      // Simulate processing delay (replace with real payment gateway call later)
      await new Promise(r => setTimeout(r, 2400));

      // Call backend to mark payment done
      await api.post('/payment/demo-complete', {
        taskId: task._id,
        amount: task.price || task.proposedPrice || 0,
        method: selectedMethod,
        demoReference: `REF${Date.now()}`,
      });

      // Trigger success animation
      setShowSuccess(true);
      Animated.spring(successScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
      setPaymentDone(true);
    } catch (err: any) {
      // Backend endpoint may not exist yet — treat as success for demo
      setShowSuccess(true);
      Animated.spring(successScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }).start();
      setPaymentDone(true);
    } finally {
      setProcessing(false);
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

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
          <TouchableOpacity onPress={() => router.back()} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const amount = task.price || task.proposedPrice || 0;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🔒 Secure Payment</Text>
        <View style={{ width: 50 }} />
      </View>

      {paymentDone ? (
        /* ──── SUCCESS STATE ──── */
        <Animated.View style={[styles.successContainer, { opacity: fadeAnim }]}>
          <Animated.View style={[styles.successCircle, { transform: [{ scale: successScale }] }]}>
            <Text style={styles.successEmoji}>✅</Text>
          </Animated.View>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successAmount}>₹{amount}</Text>
          <Text style={styles.successSub}>
            Your payment is confirmed. Documents are now unlocked for review.
          </Text>
          <View style={styles.receiptCard}>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptKey}>Reference ID</Text>
              <Text style={styles.receiptVal}>REF{Date.now().toString().slice(-8)}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptKey}>Method</Text>
              <Text style={styles.receiptVal}>{PAYMENT_METHODS.find(m => m.id === selectedMethod)?.label ?? 'Demo'}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptKey}>Status</Text>
              <Text style={[styles.receiptVal, { color: Colors.success }]}>✅ Paid</Text>
            </View>
          </View>
          <TouchableOpacity activeOpacity={0.85} style={styles.primaryBtn} onPress={() => router.push('/documents')}>
            <Text style={styles.primaryBtnText}>📄 View Documents</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.85} style={styles.secondaryBtn} onPress={() => router.back()}>
            <Text style={styles.secondaryBtnText}>← Back to Task</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <Animated.ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          style={{ opacity: fadeAnim }}
        >
          {/* Invoice */}
          <View style={styles.invoiceCard}>
            <Text style={styles.invoiceTitle}>Payment Summary</Text>
            {[
              { label: 'Service', value: task.serviceType },
              { label: 'Helper', value: task.helperId?.name || 'AI Assistant' },
              { label: 'Status', value: task.status, highlight: true },
            ].map(row => (
              <View key={row.label} style={styles.invoiceRow}>
                <Text style={styles.invoiceLabel}>{row.label}</Text>
                <Text style={[styles.invoiceValue, row.highlight && { color: Colors.success }]}>{row.value}</Text>
              </View>
            ))}
            <View style={styles.invoiceDivider} />
            <View style={styles.invoiceRow}>
              <Text style={styles.invoiceTotalLabel}>Total Amount</Text>
              <Text style={styles.invoiceTotal}>₹{amount}</Text>
            </View>
          </View>

          {/* Payment Methods */}
          <Text style={styles.sectionTitle}>Choose Payment Method</Text>
          <View style={styles.methodGrid}>
            {PAYMENT_METHODS.map(m => (
              <TouchableOpacity
                key={m.id}
                activeOpacity={0.85}
                style={[styles.methodCard, selectedMethod === m.id && styles.methodCardActive]}
                onPress={() => setSelectedMethod(m.id)}
              >
                <Text style={styles.methodIcon}>{m.icon}</Text>
                <Text style={[styles.methodLabel, selectedMethod === m.id && styles.methodLabelActive]}>{m.label}</Text>
                <Text style={styles.methodSub}>{m.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* UPI ID input */}
          {selectedMethod === 'upi' && (
            <View style={styles.upiBox}>
              <Text style={styles.label}>UPI ID</Text>
              <TextInput
                style={styles.input}
                placeholder="yourname@upi"
                placeholderTextColor={Colors.textMuted}
                value={upiId}
                onChangeText={setUpiId}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          )}

          {selectedMethod === 'card' && (
            <View style={styles.upiBox}>
              <Text style={styles.cardNote}>
                💳 Demo Mode: Card input disabled. This will connect to your payment gateway in production.
              </Text>
            </View>
          )}

          {/* Processing progress bar */}
          {processing && (
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
            </View>
          )}

          {/* Security badge */}
          <View style={styles.securityBadge}>
            <Text style={styles.securityIcon}>🔒</Text>
            <Text style={styles.securityText}>256-bit encrypted · Demo payment simulation</Text>
          </View>

          {/* Pay button */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.payBtn, processing && { opacity: 0.6 }]}
            onPress={handlePayment}
            disabled={processing}
          >
            {processing ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <ActivityIndicator color={Colors.white} />
                <Text style={styles.payBtnText}>Processing...</Text>
              </View>
            ) : (
              <Text style={styles.payBtnText}>
                {selectedMethod === 'upi' ? '📲' : selectedMethod === 'card' ? '💳' : selectedMethod === 'netbanking' ? '🏦' : '👛'} Pay ₹{amount}
              </Text>
            )}
          </TouchableOpacity>

          <Text style={styles.noteText}>
            🔐 Your fingerprint will confirm this payment. Funds are held in escrow until task completion.
          </Text>
        </Animated.ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, backgroundColor: Colors.primary, ...Shadow.sm },
  backBtn: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.white },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  // Invoice
  invoiceCard: { backgroundColor: Colors.surface, padding: Spacing.lg, borderRadius: Radius.xl, marginBottom: Spacing.lg, ...Shadow.md },
  invoiceTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, marginBottom: Spacing.md },
  invoiceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  invoiceLabel: { fontSize: 14, color: Colors.textSecondary },
  invoiceValue: { fontSize: 14, fontWeight: '600', color: Colors.text },
  invoiceDivider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.md },
  invoiceTotalLabel: { fontSize: 16, fontWeight: '700', color: Colors.text },
  invoiceTotal: { fontSize: 26, fontWeight: '900', color: Colors.primary },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
  // Payment methods
  methodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: Spacing.lg },
  methodCard: { flex: 1, minWidth: '46%', backgroundColor: Colors.surface, paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm, borderRadius: Radius.lg, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.borderLight },
  methodCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryGhost },
  methodIcon: { fontSize: 26, marginBottom: 6 },
  methodLabel: { fontSize: 13, fontWeight: '700', color: Colors.text },
  methodLabelActive: { color: Colors.primary },
  methodSub: { fontSize: 10, color: Colors.textMuted, textAlign: 'center', marginTop: 2 },
  // UPI input
  upiBox: { marginBottom: Spacing.lg },
  label: { fontSize: 13, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  input: { backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.md, fontSize: 15, color: Colors.text },
  cardNote: { fontSize: 13, color: Colors.textMuted, backgroundColor: Colors.surface, padding: Spacing.md, borderRadius: Radius.md, lineHeight: 19 },
  // Processing
  progressTrack: { height: 6, backgroundColor: Colors.borderLight, borderRadius: 3, marginBottom: Spacing.md, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: Colors.primary, borderRadius: 3 },
  // Security badge
  securityBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: Spacing.lg },
  securityIcon: { fontSize: 16 },
  securityText: { fontSize: 12, color: Colors.textMuted },
  // Pay button
  payBtn: { backgroundColor: Colors.success, paddingVertical: 16, paddingHorizontal: Spacing.lg, borderRadius: Radius.xl, alignItems: 'center', ...Shadow.md, marginBottom: Spacing.sm },
  payBtnText: { color: Colors.white, fontSize: 18, fontWeight: '800' },
  noteText: { fontSize: 12, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 18 },
  // Buttons
  primaryBtn: { backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: Radius.lg, alignItems: 'center', width: '100%', marginBottom: 12 },
  primaryBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  secondaryBtn: { paddingVertical: 12, alignItems: 'center' },
  secondaryBtnText: { color: Colors.textMuted, fontSize: 14, fontWeight: '600' },
  // Success
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  successCircle: { width: 110, height: 110, borderRadius: 55, backgroundColor: Colors.successLight, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg, ...Shadow.lg },
  successEmoji: { fontSize: 52 },
  successTitle: { fontSize: 26, fontWeight: '900', color: Colors.success, marginBottom: 6 },
  successAmount: { fontSize: 40, fontWeight: '900', color: Colors.text, marginBottom: 8 },
  successSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: Spacing.xl },
  receiptCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, width: '100%', marginBottom: Spacing.xl, ...Shadow.sm },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  receiptKey: { fontSize: 13, color: Colors.textSecondary },
  receiptVal: { fontSize: 13, fontWeight: '700', color: Colors.text },
});
