import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import {
  ActivityIndicator, Alert, Animated, KeyboardAvoidingView,
  Platform, ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import { Colors, Radius, Shadow, Spacing } from '../../constants/theme';
import { apiLogin } from '../../services/api';

export default function LoginScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'face' | 'none'>('none');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkBiometrics();
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const checkBiometrics = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (compatible && enrolled) {
        setBiometricAvailable(true);
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('face');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('fingerprint');
        }
        // Animate the fingerprint button if biometric is ready
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, { toValue: 1.08, duration: 900, useNativeDriver: true }),
            Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
          ])
        ).start();
      }
    } catch { /* biometrics not available */ }
  };

  const handleBiometricLogin = async () => {
    try {
      // Check if user has saved credentials for biometric login
      const savedEmail = await AsyncStorage.getItem('biometric_email');
      const savedPassword = await AsyncStorage.getItem('biometric_password');

      if (!savedEmail || !savedPassword) {
        Alert.alert(
          'Biometric Not Set Up',
          'Please log in with your password first to enable biometric login.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: biometricType === 'face' ? 'Scan your face to sign in' : 'Scan your fingerprint to sign in',
        fallbackLabel: 'Use Password',
        disableDeviceFallback: false,
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        setLoading(true);
        try {
          const res = await apiLogin({ email: savedEmail, password: savedPassword });
          const { token, user } = res.data.data;
          await AsyncStorage.setItem('token', token);
          await AsyncStorage.setItem('user', JSON.stringify(user));
          router.replace('/(tabs)');
        } catch (e: any) {
          Alert.alert('Login Failed', e.response?.data?.message || 'Biometric login failed. Please use password.');
        } finally {
          setLoading(false);
        }
      }
    } catch (e) {
      Alert.alert('Biometric Error', 'Could not authenticate. Please use password.');
    }
  };

  const handleLogin = async () => {
    if (mode === 'password') {
      if (!email.trim() || !password.trim()) {
        Alert.alert('Required', 'Please enter email and password');
        return;
      }
    } else {
      if (!otpSent) { Alert.alert('Required', 'Please request an OTP first'); return; }
      if (!otp.trim()) { Alert.alert('Required', 'Please enter the OTP'); return; }
    }
    setLoading(true);
    try {
      const res = await apiLogin({ email: email.trim().toLowerCase(), password });
      const { token, user } = res.data.data;
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      // Offer to save credentials for future biometric login
      if (biometricAvailable) {
        const alreadySaved = await AsyncStorage.getItem('biometric_email');
        if (!alreadySaved) {
          Alert.alert(
            biometricType === 'face' ? '😊 Enable Face ID?' : '👆 Enable Fingerprint Login?',
            `Use your ${biometricType === 'face' ? 'face' : 'fingerprint'} to sign in faster next time.`,
            [
              { text: 'Not Now', style: 'cancel' },
              {
                text: 'Enable',
                onPress: async () => {
                  await AsyncStorage.setItem('biometric_email', email.trim().toLowerCase());
                  await AsyncStorage.setItem('biometric_password', password);
                  Alert.alert('✅ Enabled!', 'You can now sign in with your fingerprint.');
                }
              }
            ]
          );
        }
      }

      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Failed', error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          <View style={styles.heroHeader}>
            <View style={styles.heroBubble} />
            <View style={styles.heroBubble2} />
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backTxt}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.logoBox}><Text style={{ fontSize: 36 }}>🌅</Text></View>
            <Text style={styles.heroTitle}>Welcome Back</Text>
            <Text style={styles.heroSub}>Sign in to your RetireAssist account</Text>
          </View>

          <Animated.View style={[styles.card, { opacity: fadeAnim }]}>

            {/* ── Biometric Button ── */}
            {biometricAvailable && (
              <Animated.View style={{ transform: [{ scale: pulseAnim }], marginBottom: Spacing.md }}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.biometricBtn}
                  onPress={handleBiometricLogin}
                  disabled={loading}
                >
                  <Text style={styles.biometricIcon}>
                    {biometricType === 'face' ? '😊' : '👆'}
                  </Text>
                  <View>
                    <Text style={styles.biometricTitle}>
                      {biometricType === 'face' ? 'Sign in with Face ID' : 'Sign in with Fingerprint'}
                    </Text>
                    <Text style={styles.biometricSub}>Tap to authenticate instantly</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            )}

            <View style={styles.divRow}>
              <View style={styles.div} />
              <Text style={styles.divTxt}>{biometricAvailable ? 'or use password' : 'sign in with'}</Text>
              <View style={styles.div} />
            </View>

            {/* ── Mode Toggle ── */}
            <View style={styles.toggle}>
              {(['password', 'otp'] as const).map(m => (
                <TouchableOpacity
                  key={m}
                  style={[styles.toggleBtn, mode === m && styles.toggleBtnActive]}
                  onPress={() => { setMode(m); setOtpSent(false); }}
                >
                  <Text style={[styles.toggleTxt, mode === m && styles.toggleTxtActive]}>
                    {m === 'password' ? '🔑 Password' : '📱 OTP'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {mode === 'password' ? (
              <>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your password"
                  placeholderTextColor={Colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                <TouchableOpacity style={styles.forgotBtn}>
                  <Text style={styles.forgotTxt}>Forgot Password?</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.label}>Mobile Number</Text>
                <View style={styles.phoneRow}>
                  <View style={styles.prefix}><Text style={styles.prefixTxt}>🇮🇳 +91</Text></View>
                  <TextInput
                    style={[styles.input, styles.phoneInput]}
                    placeholder="10-digit number"
                    placeholderTextColor={Colors.textMuted}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>
                {!otpSent ? (
                  <TouchableOpacity
                    style={styles.otpBtn}
                    onPress={() => { if (phone.length >= 10) setOtpSent(true); }}
                  >
                    <Text style={styles.otpBtnTxt}>Send OTP</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <Text style={styles.otpSentMsg}>✅ OTP sent to +91 {phone}</Text>
                    <Text style={styles.label}>Enter OTP</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="6-digit OTP"
                      placeholderTextColor={Colors.textMuted}
                      value={otp}
                      onChangeText={setOtp}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </>
                )}
              </>
            )}

            <TouchableOpacity
              activeOpacity={0.88}
              style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color={Colors.white} />
                : <Text style={styles.primaryBtnTxt}>Sign In</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/auth/signup')} style={styles.signupLink}>
              <Text style={styles.signupLinkTxt}>
                Don&apos;t have an account?{' '}
                <Text style={{ color: Colors.primary, fontWeight: '700' }}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  scroll: { flexGrow: 1, paddingBottom: Spacing.xxl },
  heroHeader: { backgroundColor: Colors.primary, paddingTop: 52, paddingBottom: 36, paddingHorizontal: Spacing.lg, alignItems: 'center', overflow: 'hidden', borderBottomLeftRadius: 28, borderBottomRightRadius: 28, marginBottom: Spacing.lg },
  heroBubble: { position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.06)' },
  heroBubble2: { position: 'absolute', bottom: -30, left: -30, width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.04)' },
  backBtn: { position: 'absolute', top: 52, left: Spacing.lg },
  backTxt: { color: 'rgba(255,255,255,0.8)', fontSize: 15, fontWeight: '600' },
  logoBox: { width: 68, height: 68, borderRadius: 34, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  heroTitle: { fontSize: 28, fontWeight: '900', color: Colors.white, marginBottom: 6 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.75)' },
  card: { backgroundColor: Colors.surfaceCard, marginHorizontal: Spacing.lg, borderRadius: Radius.xl, padding: Spacing.lg, ...Shadow.md },
  // Biometric
  biometricBtn: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.primaryGhost, borderWidth: 1.5, borderColor: Colors.primaryLight, paddingVertical: 14, paddingHorizontal: Spacing.md, borderRadius: Radius.lg },
  biometricIcon: { fontSize: 32 },
  biometricTitle: { fontSize: 15, fontWeight: '700', color: Colors.primaryDark },
  biometricSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  divRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  div: { flex: 1, height: 1, backgroundColor: Colors.borderLight },
  divTxt: { color: Colors.textMuted, paddingHorizontal: 10, fontSize: 12 },
  toggle: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 3, marginBottom: Spacing.md },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: Radius.sm },
  toggleBtnActive: { backgroundColor: Colors.primary },
  toggleTxt: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  toggleTxtActive: { color: Colors.white },
  label: { fontSize: 13, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  input: { backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.md, fontSize: 15, color: Colors.text, marginBottom: Spacing.md },
  phoneRow: { flexDirection: 'row', marginBottom: Spacing.md },
  prefix: { backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border, borderTopLeftRadius: Radius.md, borderBottomLeftRadius: Radius.md, paddingHorizontal: 12, justifyContent: 'center', borderRightWidth: 0 },
  prefixTxt: { fontSize: 13, fontWeight: '600', color: Colors.text },
  phoneInput: { flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0, marginBottom: 0 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: Spacing.lg },
  forgotTxt: { color: Colors.primary, fontWeight: '600', fontSize: 13 },
  otpBtn: { backgroundColor: Colors.primaryGhost, borderWidth: 1.5, borderColor: Colors.primaryLight, borderRadius: Radius.md, paddingVertical: 12, alignItems: 'center', marginBottom: Spacing.md },
  otpBtnTxt: { color: Colors.primary, fontWeight: '700', fontSize: 15 },
  otpSentMsg: { color: Colors.success, fontWeight: '600', fontSize: 13, marginBottom: Spacing.md },
  primaryBtn: { backgroundColor: Colors.primary, paddingVertical: 15, borderRadius: Radius.xl, alignItems: 'center', marginBottom: Spacing.md, ...Shadow.sm },
  primaryBtnTxt: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  signupLink: { alignItems: 'center', marginTop: 4 },
  signupLinkTxt: { fontSize: 14, color: Colors.textSecondary },
});
