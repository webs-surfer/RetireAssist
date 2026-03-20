import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, Shadow } from '../../constants/theme';

export default function RoleSelectScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<'user' | 'helper' | null>(null);

  const handleContinue = async () => {
    if (!selected) { Alert.alert('Choose a role', 'Please select how you want to use RetireAssist'); return; }
    await AsyncStorage.setItem('role', selected);
    if (selected === 'user') {
      router.replace('/onboarding/profile-setup');
    } else {
      // Helper flow — redirect to helper onboarding
      router.replace('/helper/onboarding');
    }
  };

  const roles = [
    {
      key: 'user' as const,
      emoji: '👤',
      title: 'I need help with services',
      desc: 'Find helpers and use AI to complete pension, insurance, Aadhaar, and other government services.',
      features: ['Access 12+ government services', 'AI-guided step-by-step help', 'Hire KYC-verified helpers', 'Secure document vault'],
      bg: '#EEF2FF',
      border: Colors.primary,
    },
    {
      key: 'helper' as const,
      emoji: '🤝',
      title: 'I want to help others & earn',
      desc: 'Assist senior citizens with government paperwork and earn money on a flexible schedule.',
      features: ['Earn ₹200–600 per task', 'Work at your own schedule', 'Build your reputation', 'Get paid after task completion'],
      bg: '#F0FDF4',
      border: Colors.success,
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Choose Your Role</Text>
        <Text style={styles.headerSub}>You can change this anytime from your profile</Text>
      </View>

      <View style={styles.content}>
        {roles.map((role) => (
          <TouchableOpacity
            key={role.key}
            activeOpacity={0.85}
            style={[styles.roleCard, Shadow.md, selected === role.key && { borderColor: role.border, borderWidth: 2.5 }, { backgroundColor: role.bg }]}
            onPress={() => setSelected(role.key)}
          >
            <View style={styles.roleTop}>
              <Text style={styles.roleEmoji}>{role.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.roleTitle}>{role.title}</Text>
                <Text style={styles.roleDesc}>{role.desc}</Text>
              </View>
              {selected === role.key && (
                <View style={[styles.checkCircle, { backgroundColor: role.border }]}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
              )}
            </View>
            <View style={styles.featureList}>
              {role.features.map((f, i) => (
                <View key={i} style={styles.featureRow}>
                  <Text style={[styles.featureDot, { color: role.border }]}>●</Text>
                  <Text style={styles.featureTxt}>{f}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.88}
          style={[styles.continueBtn, !selected && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={!selected}
        >
          <Text style={styles.continueBtnTxt}>
            {selected === 'helper' ? 'Start KYC Verification →' : selected === 'user' ? 'Set Up My Profile →' : 'Select a Role to Continue'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.footerNote}>You can always switch roles later from your profile settings</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { padding: Spacing.lg, paddingTop: Spacing.xl, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  headerTitle: { fontSize: 26, fontWeight: '900', color: Colors.text, marginBottom: 6 },
  headerSub: { fontSize: 14, color: Colors.textSecondary, lineHeight: 19 },
  content: { flex: 1, padding: Spacing.lg, gap: 14 },
  roleCard: { borderRadius: Radius.xl, padding: Spacing.lg, borderWidth: 1.5, borderColor: Colors.border },
  roleTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.md, gap: 12 },
  roleEmoji: { fontSize: 40 },
  roleTitle: { fontSize: 16, fontWeight: '800', color: Colors.text, marginBottom: 4, lineHeight: 22 },
  roleDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  checkCircle: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  checkMark: { color: Colors.white, fontSize: 14, fontWeight: '900' },
  featureList: { gap: 6 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureDot: { fontSize: 8 },
  featureTxt: { fontSize: 13, color: Colors.text, fontWeight: '500' },
  footer: { padding: Spacing.lg, paddingBottom: 32, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  continueBtn: { backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: Radius.xl, alignItems: 'center', marginBottom: 10, ...Shadow.md },
  continueBtnDisabled: { backgroundColor: Colors.textMuted },
  continueBtnTxt: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  footerNote: { textAlign: 'center', fontSize: 12, color: Colors.textMuted, lineHeight: 17 },
});
