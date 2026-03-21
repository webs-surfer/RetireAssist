import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Shadow, Typography } from '../../constants/theme';

export default function TermsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📜 Terms of Service</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last updated: March 2026</Text>

        {[
          { title: '1. Acceptance of Terms', body: 'By downloading, installing, or using RetireAssist ("the App"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the App.' },
          { title: '2. Eligibility', body: 'The App is available to users aged 18 and above. Users under 18 may use the App only under the supervision of a parent or legal guardian. Helpers must complete KYC verification before offering services.' },
          { title: '3. User Accounts', body: 'You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate, complete, and current information during registration. Any activity under your account is your responsibility.' },
          { title: '4. Services Provided', body: 'RetireAssist connects senior citizens with verified helpers for government service assistance. We provide an AI assistant for guidance. We do not guarantee the outcome of any government application or service.' },
          { title: '5. Helper Responsibilities', body: 'Helpers must complete tasks professionally and honestly. Providing false information during KYC is a punishable offense. Helpers must not collect payments outside the platform.' },
          { title: '6. Payments', body: 'All payments are processed through the app. Pricing is agreed upon between users and helpers before task initiation. Refunds are handled on a case-by-case basis.' },
          { title: '7. Privacy & Data', body: 'Your personal data is encrypted and stored securely. We collect only the data necessary to provide our services. Documents uploaded are accessible only to you, the assigned helper, and our admin team for verification. See our Privacy Policy for details.' },
          { title: '8. Prohibited Activities', body: 'Users must not: upload fraudulent documents, impersonate others, use the app for illegal activities, harass other users or helpers, or attempt to bypass our security measures.' },
          { title: '9. Limitation of Liability', body: 'RetireAssist is a facilitation platform. We are not liable for actions taken by helpers, government decisions on applications, or any indirect damages arising from app usage.' },
          { title: '10. Contact', body: 'For questions about these terms, contact us at legal@retireassist.in or call our toll-free number 1800-XXX-XXXX.' },
        ].map((section, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}
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
  lastUpdated: { ...Typography.caption, color: Colors.textMuted, marginBottom: Spacing.lg },
  section: { backgroundColor: Colors.surfaceCard, borderRadius: Radius.xl, padding: Spacing.lg, marginBottom: 12, ...Shadow.sm },
  sectionTitle: { ...Typography.bodyBold, color: Colors.text, marginBottom: 8 },
  sectionBody: { ...Typography.body, color: Colors.textSecondary, lineHeight: 22 },
});
