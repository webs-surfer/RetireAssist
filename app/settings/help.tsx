import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Shadow, Typography } from '../../constants/theme';

const FAQ_DATA = [
  { q: 'What is RetireAssist?', a: 'RetireAssist is a mobile app that helps senior citizens access government services like pension, Aadhaar, PAN, insurance, and more. Our AI assistant guides you step-by-step, and verified helpers can visit you to complete paperwork.' },
  { q: 'Is this app free to use?', a: 'Yes! The app is completely free to download and use. You only pay when you hire a helper for a specific task. Pricing is transparent and agreed upon before work begins.' },
  { q: 'How do I hire a helper?', a: 'Go to the Helpers tab → Browse nearby verified helpers → Select one → Choose a service → Set your budget → Send request. The helper will accept or respond within minutes.' },
  { q: 'Are helpers verified?', a: 'Yes. Every helper undergoes KYC verification including Aadhaar verification, face match, and background check by our admin team before they can accept tasks.' },
  { q: 'How does the AI assistant work?', a: 'Our Gemini AI assistant can answer questions about government schemes, guide you through form filling, explain eligibility criteria, and help you prepare documents. It supports both Hindi and English.' },
  { q: 'Is my data safe?', a: 'Absolutely. All documents are encrypted and stored securely. We use JWT authentication, and your personal information is never shared with third parties without your consent.' },
  { q: 'How do payments work?', a: 'After a helper completes your task and the admin verifies the documents, you make the agreed payment through the app. We support UPI, cards, net banking, and wallets (demo mode).' },
  { q: 'Can I be both a user and a helper?', a: 'Currently, you choose one role during signup. You can contact support to switch roles if needed.' },
  { q: 'What if I have a complaint?', a: 'You can rate helpers after task completion. For serious issues, contact our support team through the app or email support@retireassist.in.' },
  { q: 'Which states are supported?', a: 'RetireAssist works across all Indian states. Our helper network is strongest in UP, Delhi NCR, Bihar, Rajasthan, Maharashtra, and Tamil Nadu.' },
];

export default function HelpScreen() {
  const router = useRouter();
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>❓ Help & FAQ</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.supportCard}>
          <Text style={{ fontSize: 28 }}>🤖</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.supportTitle}>Need instant help?</Text>
            <Text style={styles.supportDesc}>Ask our AI assistant any question in Hindi or English</Text>
          </View>
          <TouchableOpacity style={styles.askBtn} activeOpacity={0.85} onPress={() => router.push('/ai-assistant')}>
            <Text style={styles.askBtnText}>Ask AI →</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>FREQUENTLY ASKED QUESTIONS</Text>

        {FAQ_DATA.map((item, idx) => (
          <TouchableOpacity key={idx} activeOpacity={0.85}
            style={[styles.faqCard, expandedIdx === idx && styles.faqCardExpanded]}
            onPress={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>{item.q}</Text>
              <Text style={styles.faqArrow}>{expandedIdx === idx ? '▲' : '▼'}</Text>
            </View>
            {expandedIdx === idx && (
              <Text style={styles.faqAnswer}>{item.a}</Text>
            )}
          </TouchableOpacity>
        ))}

        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactInfo}>📧 support@retireassist.in</Text>
          <Text style={styles.contactInfo}>📞 1800-XXX-XXXX (Toll Free)</Text>
          <Text style={styles.contactInfo}>⏰ Mon-Sat, 9 AM - 6 PM IST</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, paddingHorizontal: Spacing.lg, backgroundColor: Colors.primary },
  backBtn: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  headerTitle: { ...Typography.h3, color: Colors.white },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  supportCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primaryGhost, borderRadius: Radius.xl, padding: Spacing.md, gap: 12, marginBottom: Spacing.lg, borderWidth: 1.5, borderColor: Colors.primaryLight + '30' },
  supportTitle: { ...Typography.bodyBold, color: Colors.text },
  supportDesc: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  askBtn: { backgroundColor: Colors.primary, paddingVertical: 8, paddingHorizontal: 14, borderRadius: Radius.full },
  askBtnText: { color: Colors.white, fontWeight: '700', fontSize: 12 },
  sectionTitle: { ...Typography.tiny, color: Colors.textMuted, marginBottom: 12, letterSpacing: 1.5 },
  faqCard: { backgroundColor: Colors.surfaceCard, borderRadius: Radius.xl, padding: Spacing.md, marginBottom: 10, ...Shadow.sm, borderWidth: 1, borderColor: Colors.borderLight },
  faqCardExpanded: { borderColor: Colors.primaryLight },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { ...Typography.bodyBold, color: Colors.text, flex: 1, marginRight: 8 },
  faqArrow: { fontSize: 12, color: Colors.textMuted },
  faqAnswer: { ...Typography.body, color: Colors.textSecondary, marginTop: 12, lineHeight: 22, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  contactCard: { backgroundColor: Colors.surfaceCard, borderRadius: Radius.xl, padding: Spacing.lg, marginTop: Spacing.lg, ...Shadow.sm, alignItems: 'center' },
  contactTitle: { ...Typography.h3, color: Colors.text, marginBottom: 12 },
  contactInfo: { ...Typography.body, color: Colors.textSecondary, marginBottom: 6 },
});
