import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow, Spacing } from '../constants/theme';
import { apiCreateTask } from '../services/api';

export default function HelperProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; name: string; rating: string; reviews: string; distance: string; price: string; exp: string; services: string }>();

  const helper = {
    name: params.name || 'Suresh Yadav',
    rating: params.rating || '4.9',
    reviews: parseInt(params.reviews || '128'),
    distance: params.distance || '0.8km',
    price: params.price || '₹300–500',
    exp: params.exp || '5 yrs',
    services: params.services ? params.services.split(',') : ['Pension', 'Aadhaar', 'PAN', 'Government'],
    tasksDone: 203,
    languages: ['Hindi', 'Bhojpuri', 'English'],
    bio: `Hi, I am ${params.name?.split(' ')[0] || 'Suresh'}. I have been helping senior citizens with government forms and banking work for the past ${params.exp || '5 years'}. I ensure fast, honest, and patient service.`,
  };

  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedService, setSelectedService] = useState(helper.services[0]);
  const [budget, setBudget] = useState('400');
  const [message, setMessage] = useState('');

  const [hiring, setHiring] = useState(false);

  const handleHire = async () => {
    setHiring(true);
    try {
      await apiCreateTask({
        helperId: params.id,
        serviceType: selectedService,
        description: message || `Need help with ${selectedService}`,
        proposedPrice: parseInt(budget) || 400,
        instructions: message,
      });
      setSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setSuccess(false);
        router.push('/(tabs)/tasks');
      }, 1800);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send request');
    } finally {
      setHiring(false);
    }
  };

  const reviews = [
    { user: 'Geeta Devi', stars: 5, text: 'Very helpful and patient. Got my pension work done in just 3 days!', date: '2 days ago' },
    { user: 'Ram Prasad', stars: 5, text: 'Excellent service. Explained everything clearly and professionally.', date: '1 week ago' },
    { user: 'Sita Kumari', stars: 4, text: 'Good service, got the Aadhaar update done quickly.', date: '2 weeks ago' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.85} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Helper Profile</Text>
        <View style={{ width: 60 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.profileTop}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{helper.name.charAt(0)}</Text></View>
            <Text style={styles.helperName}>{helper.name} <Text style={styles.kycBadge}>✅ KYC</Text></Text>
            <Text style={styles.helperMeta}>{helper.exp} experience • {helper.distance}</Text>
          </View>

          <View style={[styles.statsRow, Shadow.sm]}>
            <View style={styles.statItem}><Text style={styles.statVal}>{helper.tasksDone}</Text><Text style={styles.statLabel}>Tasks Done</Text></View>
            <View style={styles.statDiv} />
            <View style={styles.statItem}><Text style={styles.statVal}>{helper.rating}★</Text><Text style={styles.statLabel}>Rating</Text></View>
            <View style={styles.statDiv} />
            <View style={styles.statItem}><Text style={styles.statVal}>{helper.reviews}</Text><Text style={styles.statLabel}>Reviews</Text></View>
          </View>

          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bio}>{helper.bio}</Text>
          <View style={styles.langRow}>
            {helper.languages.map((l, i) => <View key={i} style={styles.langChip}><Text style={styles.langText}>{l}</Text></View>)}
          </View>

          <Text style={styles.sectionTitle}>Services & Pricing</Text>
          <View style={styles.priceCard}>
            <Text style={styles.priceVal}>{helper.price}</Text>
            <Text style={styles.priceDesc}>per task (varies by complexity)</Text>
          </View>
          <View style={styles.serviceChips}>
            {helper.services.map((s, i) => (
              <View key={i} style={styles.serviceChip}><Text style={styles.serviceChipText}>{s}</Text></View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Reviews ({helper.reviews})</Text>
          {reviews.map((r, i) => (
            <View key={i} style={[styles.reviewCard, Shadow.sm]}>
              <View style={styles.reviewTop}>
                <View style={styles.reviewAvatar}><Text style={styles.reviewAvatarText}>{r.user.charAt(0)}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reviewUser}>{r.user}</Text>
                  <Text style={styles.reviewStars}>{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</Text>
                </View>
                <Text style={styles.reviewDate}>{r.date}</Text>
              </View>
              <Text style={styles.reviewText}>{r.text}</Text>
            </View>
          ))}
          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.ctaBar}>
        <TouchableOpacity activeOpacity={0.85} style={styles.ctaOutline} onPress={() => router.push('/ai-assistant')}>
          <Text style={styles.ctaOutlineText}>🤖 AI Instead</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.85} style={styles.ctaPrimary} onPress={() => setShowModal(true)}>
          <Text style={styles.ctaPrimaryText}>Hire {helper.name.split(' ')[0]} →</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalSheet}>
            {success ? (
              <View style={styles.successBanner}>
                <Text style={styles.successIcon}>✅</Text>
                <Text style={styles.successText}>Request sent!</Text>
                <Text style={styles.successSub}>Waiting for {helper.name.split(' ')[0]} to respond…</Text>
              </View>
            ) : (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Request Assistance</Text>
                  <TouchableOpacity activeOpacity={0.85} onPress={() => setShowModal(false)}>
                    <Text style={styles.closeBtn}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalLabel}>Select Service</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modalChips}>
                  {helper.services.map((s, i) => (
                    <TouchableOpacity key={i} activeOpacity={0.85} style={[styles.serviceSelectBtn, selectedService === s && styles.serviceSelectBtnActive]} onPress={() => setSelectedService(s)}>
                      <Text style={[styles.serviceSelectText, selectedService === s && styles.serviceSelectTextActive]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <Text style={styles.modalLabel}>Proposed Budget (₹)</Text>
                <TextInput style={styles.modalInput} placeholder="e.g. 400" keyboardType="numeric" placeholderTextColor={Colors.textMuted} value={budget} onChangeText={setBudget} />
                <Text style={styles.modalLabel}>Message (optional)</Text>
                <TextInput style={[styles.modalInput, { height: 90, textAlignVertical: 'top' }]} placeholder="Describe what you need help with..." multiline placeholderTextColor={Colors.textMuted} value={message} onChangeText={setMessage} />
                <TouchableOpacity activeOpacity={0.85} style={styles.submitBtn} onPress={handleHire}>
                  <Text style={styles.submitBtnText}>Send Request 🤝</Text>
                </TouchableOpacity>
              </>
            )}
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', backgroundColor: Colors.primary, padding: Spacing.lg, alignItems: 'center', justifyContent: 'space-between' },
  backText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.white },
  content: { padding: Spacing.lg, paddingBottom: 120 },
  profileTop: { alignItems: 'center', marginBottom: Spacing.lg },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: Colors.white },
  helperName: { fontSize: 22, fontWeight: 'bold', color: Colors.text, marginBottom: 4 },
  kycBadge: { fontSize: 14, color: Colors.success },
  helperMeta: { fontSize: 14, color: Colors.textSecondary },
  statsRow: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radius.lg, paddingVertical: Spacing.md, marginBottom: Spacing.xl },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: 'bold', color: Colors.primary, marginBottom: 4 },
  statLabel: { fontSize: 12, color: Colors.textSecondary },
  statDiv: { width: 1, backgroundColor: Colors.borderLight },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: Spacing.md },
  bio: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing.md },
  langRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
  langChip: { backgroundColor: Colors.borderLight, paddingVertical: 4, paddingHorizontal: Spacing.md, borderRadius: Radius.full },
  langText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  priceCard: { backgroundColor: Colors.primaryGhost, padding: Spacing.md, borderRadius: Radius.lg, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.primaryLight },
  priceVal: { fontSize: 20, fontWeight: 'bold', color: Colors.primary, marginBottom: 2 },
  priceDesc: { fontSize: 12, color: Colors.textSecondary },
  serviceChips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xl },
  serviceChip: { backgroundColor: Colors.primaryGhost, paddingVertical: 4, paddingHorizontal: Spacing.md, borderRadius: Radius.full },
  serviceChipText: { fontSize: 12, color: Colors.primaryDark, fontWeight: '600' },
  reviewCard: { backgroundColor: Colors.surface, padding: Spacing.md, borderRadius: Radius.lg, marginBottom: Spacing.md },
  reviewTop: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  reviewAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.accent, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.sm },
  reviewAvatarText: { fontSize: 14, color: Colors.white, fontWeight: 'bold' },
  reviewUser: { fontSize: 14, fontWeight: 'bold', color: Colors.text },
  reviewStars: { fontSize: 12, color: Colors.gold },
  reviewDate: { fontSize: 10, color: Colors.textMuted },
  reviewText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  ctaBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.surface, flexDirection: 'row', padding: Spacing.md, paddingBottom: 30, borderTopWidth: 1, borderTopColor: Colors.borderLight, gap: Spacing.sm },
  ctaOutline: { flex: 1, borderWidth: 1.5, borderColor: Colors.primary, paddingVertical: Spacing.md, borderRadius: Radius.lg, alignItems: 'center' },
  ctaOutlineText: { color: Colors.primary, fontSize: 15, fontWeight: 'bold' },
  ctaPrimary: { flex: 1.5, backgroundColor: Colors.primary, paddingVertical: Spacing.md, borderRadius: Radius.lg, alignItems: 'center' },
  ctaPrimaryText: { color: Colors.white, fontSize: 15, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: Colors.background, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.lg, paddingBottom: Spacing.xxl },
  successBanner: { alignItems: 'center', padding: Spacing.xl },
  successIcon: { fontSize: 56, marginBottom: Spacing.md },
  successText: { fontSize: 22, fontWeight: 'bold', color: Colors.success, marginBottom: 8 },
  successSub: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  closeBtn: { fontSize: 24, color: Colors.textMuted },
  modalLabel: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: Spacing.sm },
  modalChips: { gap: Spacing.sm, marginBottom: Spacing.lg, paddingRight: Spacing.lg },
  serviceSelectBtn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.borderLight, backgroundColor: Colors.surface },
  serviceSelectBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  serviceSelectText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  serviceSelectTextActive: { color: Colors.white },
  modalInput: { backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.md, fontSize: 15, color: Colors.text, marginBottom: Spacing.lg },
  submitBtn: { backgroundColor: Colors.primary, paddingVertical: Spacing.md, borderRadius: Radius.lg, alignItems: 'center', ...Shadow.sm },
  submitBtnText: { color: Colors.white, fontSize: 16, fontWeight: 'bold' },
});
