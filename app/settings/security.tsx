import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { Colors, Spacing, Radius, Shadow, Typography } from '../../constants/theme';
import api from '../../services/api';

export default function SecurityScreen() {
  const router = useRouter();
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [saving, setSaving] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useState(() => {
    (async () => {
      const hasBio = await AsyncStorage.getItem('biometric_email');
      setBiometricEnabled(!!hasBio);
      const hw = await LocalAuthentication.hasHardwareAsync();
      const en = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(hw && en);
    })();
  });

  const handleChangePassword = async () => {
    if (!currentPass || !newPass) { Alert.alert('Error', 'Fill in all fields.'); return; }
    if (newPass.length < 6) { Alert.alert('Error', 'New password must be at least 6 characters.'); return; }
    if (newPass !== confirmPass) { Alert.alert('Error', 'New passwords do not match.'); return; }
    setSaving(true);
    try {
      await api.put('/user/update', { currentPassword: currentPass, newPassword: newPass });
      Alert.alert('✅ Updated', 'Your password has been changed.');
      setCurrentPass(''); setNewPass(''); setConfirmPass('');
    } catch (e: any) {
      Alert.alert('Failed', e.response?.data?.message || 'Could not update password.');
    } finally { setSaving(false); }
  };

  const toggleBiometric = async (value: boolean) => {
    if (value) {
      const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Verify to enable biometric login' });
      if (result.success) {
        const user = await AsyncStorage.getItem('user');
        const parsed = user ? JSON.parse(user) : {};
        await AsyncStorage.setItem('biometric_email', parsed.email || '');
        setBiometricEnabled(true);
        Alert.alert('✅ Enabled', 'Biometric login is now active.');
      }
    } else {
      await AsyncStorage.multiRemove(['biometric_email', 'biometric_password']);
      setBiometricEnabled(false);
      Alert.alert('Disabled', 'Biometric login has been turned off.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🔑 Security</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Biometric */}
        {biometricAvailable && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>BIOMETRIC LOGIN</Text>
            <View style={styles.card}>
              <View style={styles.switchRow}>
                <View style={[styles.iconWrap, { backgroundColor: '#DBEAFE' }]}>
                  <Text style={{ fontSize: 18 }}>👆</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchLabel}>Fingerprint / Face ID</Text>
                  <Text style={styles.switchDesc}>Sign in without typing your password</Text>
                </View>
                <Switch
                  value={biometricEnabled}
                  onValueChange={toggleBiometric}
                  trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                  thumbColor={biometricEnabled ? Colors.primary : Colors.textLight}
                />
              </View>
            </View>
          </View>
        )}

        {/* Change Password */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CHANGE PASSWORD</Text>
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Current Password</Text>
            <TextInput style={styles.input} secureTextEntry placeholder="Enter current password" placeholderTextColor={Colors.textMuted}
              value={currentPass} onChangeText={setCurrentPass} />

            <Text style={styles.inputLabel}>New Password</Text>
            <TextInput style={styles.input} secureTextEntry placeholder="Min 6 characters" placeholderTextColor={Colors.textMuted}
              value={newPass} onChangeText={setNewPass} />

            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <TextInput style={styles.input} secureTextEntry placeholder="Re-enter new password" placeholderTextColor={Colors.textMuted}
              value={confirmPass} onChangeText={setConfirmPass} />

            <TouchableOpacity activeOpacity={0.85} style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleChangePassword} disabled={saving}>
              <Text style={styles.saveBtnText}>{saving ? 'Saving...' : '🔐 Update Password'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Session */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SESSION</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.dangerRow} activeOpacity={0.85}
              onPress={() => {
                Alert.alert('Sign Out All', 'This will sign you out on all devices.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Sign Out All', style: 'destructive', onPress: async () => {
                    await AsyncStorage.multiRemove(['token', 'user', 'biometric_email', 'biometric_password']);
                    router.replace('/');
                  }},
                ]);
              }}
            >
              <Text style={styles.dangerText}>🚪 Sign Out of All Devices</Text>
            </TouchableOpacity>
          </View>
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
  section: { marginBottom: Spacing.lg },
  sectionTitle: { ...Typography.tiny, color: Colors.textMuted, marginBottom: 8, letterSpacing: 1.5 },
  card: { backgroundColor: Colors.surfaceCard, borderRadius: Radius.xl, padding: Spacing.lg, ...Shadow.sm },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  switchLabel: { ...Typography.bodyBold, color: Colors.text },
  switchDesc: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  inputLabel: { ...Typography.captionBold, color: Colors.text, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.md, fontSize: 15, color: Colors.text },
  saveBtn: { backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: Radius.lg, alignItems: 'center', marginTop: Spacing.lg, ...Shadow.sm },
  saveBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  dangerRow: { paddingVertical: 4 },
  dangerText: { color: Colors.danger, fontWeight: '700', fontSize: 15 },
});
