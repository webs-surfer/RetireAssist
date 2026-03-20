import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState, useRef } from 'react';
import {
  ActivityIndicator, Alert, Animated, KeyboardAvoidingView,
  Platform, ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import { Colors, Radius, Shadow, Spacing } from '../../constants/theme';
import { apiSignup } from '../../services/api';

const STEPS = ['Account', 'Profile', 'Security'];

export default function SignupScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricEnrolled, setBiometricEnrolled] = useState(false);
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'face' | 'none'>('none');
  const [registeredUser, setRegisteredUser] = useState<{ token: string; user: any } | null>(null);

  const progressAnim = useRef(new Animated.Value(0)).current;

  const animateProgress = (toStep: number) => {
    Animated.spring(progressAnim, {
      toValue: toStep / (STEPS.length - 1),
      useNativeDriver: false,
    }).start();
  };

  const nextStep = () => {
    const nextS = step + 1;
    setStep(nextS);
    animateProgress(nextS);
  };

  const handleStepZero = () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Required', 'Please fill in name, email and password.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }
    nextStep();
  };

  const handleStepOne = async () => {
    setLoading(true);
    try {
      const res = await apiSignup({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone,
        age: age ? parseInt(age) : undefined,
        city,
        role: 'user',
      });
      const { token, user } = res.data.data;
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      setRegisteredUser({ token, user });

      // Check if biometrics available
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (compatible && enrolled) {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('face');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('fingerprint');
        }
        nextStep();
      } else {
        // No biometrics — skip straight to app
        router.replace('/auth/role-select');
      }
    } catch (error: any) {
      Alert.alert('Signup Failed', error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollBiometric = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: biometricType === 'face'
          ? 'Scan your face to set up Face ID login'
          : 'Touch the fingerprint sensor to register your fingerprint',
        fallbackLabel: 'Skip',
        disableDeviceFallback: false,
        cancelLabel: 'Skip',
      });

      if (result.success) {
        await AsyncStorage.setItem('biometric_email', email.trim().toLowerCase());
        await AsyncStorage.setItem('biometric_password', password);
        setBiometricEnrolled(true);
        Alert.alert(
          '🎉 Fingerprint Registered!',
          `You can now sign in with your ${biometricType === 'face' ? 'face' : 'fingerprint'} instead of your password.`,
          [{ text: 'Continue', onPress: () => router.replace('/auth/role-select') }]
        );
      } else {
        router.replace('/auth/role-select');
      }
    } catch {
      router.replace('/auth/role-select');
    }
  };

  const handleSkipBiometric = () => {
    router.replace('/auth/role-select');
  };

  const handleNext = () => {
    if (step === 0) handleStepZero();
    else if (step === 1) handleStepOne();
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['5%', '100%'],
  });

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => step > 0 ? (setStep(s => s - 1), animateProgress(step - 1)) : router.back()}
            activeOpacity={0.85}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <View style={{ width: 50 }} />
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>

        {/* Step labels */}
        <View style={styles.stepperRow}>
          {STEPS.map((s, i) => (
            <View key={i} style={styles.stepWrap}>
              <View style={[styles.stepDot, step >= i && styles.stepDotActive, step > i && styles.stepDotDone]}>
                <Text style={[styles.stepNum, step >= i && styles.stepNumActive]}>
                  {step > i ? '✓' : i + 1}
                </Text>
              </View>
              <Text style={[styles.stepLbl, step >= i && styles.stepLblActive]}>{s}</Text>
            </View>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>

            {/* ── Step 0: Account ── */}
            {step === 0 && (
              <>
                <Text style={styles.stepTitle}>Create your account</Text>
                <Text style={styles.stepSubtitle}>Your secure gateway to retirement services</Text>

                <Text style={styles.label}>Full Name</Text>
                <TextInput style={styles.input} placeholder="Ramesh Kumar" placeholderTextColor={Colors.textMuted} value={name} onChangeText={setName} />

                <Text style={styles.label}>Email Address</Text>
                <TextInput style={styles.input} placeholder="you@gmail.com" placeholderTextColor={Colors.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

                <Text style={styles.label}>Mobile Number</Text>
                <View style={styles.phoneRow}>
                  <View style={styles.prefix}><Text style={styles.prefixTxt}>🇮🇳 +91</Text></View>
                  <TextInput style={[styles.input, styles.phoneInput]} placeholder="10-digit number" placeholderTextColor={Colors.textMuted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                </View>

                <Text style={styles.label}>Password</Text>
                <TextInput style={styles.input} placeholder="Create a strong password (6+ chars)" placeholderTextColor={Colors.textMuted} value={password} onChangeText={setPassword} secureTextEntry />

                <Text style={styles.label}>Confirm Password</Text>
                <TextInput style={styles.input} placeholder="Re-enter your password" placeholderTextColor={Colors.textMuted} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

                <View style={styles.infoBox}>
                  <Text style={styles.infoTxt}>🔐 Your credentials are encrypted. We never store plain-text passwords.</Text>
                </View>
              </>
            )}

            {/* ── Step 1: Profile ── */}
            {step === 1 && (
              <>
                <Text style={styles.stepTitle}>Your Profile</Text>
                <Text style={styles.stepSubtitle}>Personalise your service recommendations</Text>

                <Text style={styles.label}>Age</Text>
                <TextInput style={styles.input} placeholder="e.g. 63" placeholderTextColor={Colors.textMuted} value={age} onChangeText={setAge} keyboardType="number-pad" />

                <Text style={styles.label}>City / District</Text>
                <TextInput style={styles.input} placeholder="e.g. Patna, Bihar" placeholderTextColor={Colors.textMuted} value={city} onChangeText={setCity} />

                <View style={styles.infoBox}>
                  <Text style={styles.infoTxt}>📍 Location helps us show nearby helpers and relevant government schemes.</Text>
                </View>
              </>
            )}

            {/* ── Step 2: Biometric Security ── */}
            {step === 2 && (
              <>
                <View style={styles.biometricHero}>
                  <Text style={styles.biometricHeroIcon}>
                    {biometricType === 'face' ? '😊' : '👆'}
                  </Text>
                  <Text style={styles.biometricHeroTitle}>
                    {biometricType === 'face' ? 'Set Up Face ID' : 'Register Your Fingerprint'}
                  </Text>
                  <Text style={styles.biometricHeroSub}>
                    Sign in quickly and securely without typing your password every time.
                  </Text>
                </View>

                <View style={styles.benefitRow}>
                  {[
                    { icon: '⚡', label: 'Instant login — no password typing' },
                    { icon: '🛡️', label: 'Your fingerprint never leaves your device' },
                    { icon: '🔒', label: 'Protected by device security hardware' },
                  ].map((b, i) => (
                    <View key={i} style={styles.benefitItem}>
                      <Text style={styles.benefitIcon}>{b.icon}</Text>
                      <Text style={styles.benefitLabel}>{b.label}</Text>
                    </View>
                  ))}
                </View>

                {biometricEnrolled ? (
                  <View style={styles.enrolledBadge}>
                    <Text style={styles.enrolledText}>✅ Fingerprint Registered Successfully!</Text>
                  </View>
                ) : (
                  <>
                    <TouchableOpacity activeOpacity={0.88} style={styles.enrollBtn} onPress={handleEnrollBiometric}>
                      <Text style={styles.enrollBtnIcon}>{biometricType === 'face' ? '😊' : '👆'}</Text>
                      <Text style={styles.enrollBtnText}>
                        {biometricType === 'face' ? 'Set Up Face ID' : 'Register Fingerprint'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleSkipBiometric} style={styles.skipBtn}>
                      <Text style={styles.skipBtnText}>Skip for now</Text>
                    </TouchableOpacity>
                  </>
                )}
                return null;
              </>
            )}

            {/* Continue / Create button (only steps 0 and 1) */}
            {step < 2 && (
              <TouchableOpacity
                activeOpacity={0.88}
                style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
                onPress={handleNext}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color={Colors.white} />
                  : <Text style={styles.primaryBtnTxt}>
                    {step === 0 ? 'Continue →' : 'Create Account 🎉'}
                  </Text>
                }
              </TouchableOpacity>
            )}

            {step === 0 && (
              <TouchableOpacity onPress={() => router.push('/auth/login')} style={styles.loginLink}>
                <Text style={styles.loginLinkTxt}>
                  Already have an account?{' '}
                  <Text style={{ color: Colors.primary, fontWeight: '700' }}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, backgroundColor: Colors.background, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  backText: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  progressTrack: { height: 4, backgroundColor: Colors.borderLight },
  progressFill: { height: 4, backgroundColor: Colors.primary, borderRadius: 2 },
  stepperRow: { flexDirection: 'row', backgroundColor: Colors.background, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.borderLight, justifyContent: 'space-around' },
  stepWrap: { alignItems: 'center', flex: 1 },
  stepDot: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.borderLight, alignItems: 'center', justifyContent: 'center', marginBottom: 4, borderWidth: 2, borderColor: Colors.border },
  stepDotActive: { backgroundColor: Colors.primary, borderColor: Colors.primaryLight },
  stepDotDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  stepNum: { fontSize: 12, fontWeight: '700', color: Colors.textMuted },
  stepNumActive: { color: Colors.white },
  stepLbl: { fontSize: 10, color: Colors.textMuted },
  stepLblActive: { color: Colors.primary, fontWeight: '700' },
  scroll: { flexGrow: 1, padding: Spacing.lg, paddingBottom: Spacing.xxl },
  card: { backgroundColor: Colors.surfaceCard, borderRadius: Radius.xl, padding: Spacing.lg, ...Shadow.sm },
  stepTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  stepSubtitle: { fontSize: 13, color: Colors.textSecondary, marginBottom: Spacing.lg, lineHeight: 19 },
  label: { fontSize: 13, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  input: { backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.md, fontSize: 15, color: Colors.text, marginBottom: Spacing.md },
  phoneRow: { flexDirection: 'row', marginBottom: Spacing.md },
  prefix: { backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border, borderTopLeftRadius: Radius.md, borderBottomLeftRadius: Radius.md, paddingHorizontal: 12, justifyContent: 'center', borderRightWidth: 0 },
  prefixTxt: { fontSize: 13, fontWeight: '600', color: Colors.text },
  phoneInput: { flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0, marginBottom: 0 },
  infoBox: { backgroundColor: Colors.primaryGhost, padding: Spacing.md, borderRadius: Radius.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.primaryLight + '30' },
  infoTxt: { color: Colors.primaryDark, fontSize: 13, lineHeight: 18 },
  // Biometric Step
  biometricHero: { alignItems: 'center', paddingVertical: Spacing.xl },
  biometricHeroIcon: { fontSize: 72, marginBottom: Spacing.md },
  biometricHeroTitle: { fontSize: 22, fontWeight: '900', color: Colors.text, marginBottom: 8, textAlign: 'center' },
  biometricHeroSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  benefitRow: { marginBottom: Spacing.xl, gap: 12 },
  benefitItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  benefitIcon: { fontSize: 20 },
  benefitLabel: { fontSize: 14, color: Colors.text, fontWeight: '500', flex: 1 },
  enrollBtn: { backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: Radius.xl, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: Spacing.md, ...Shadow.md },
  enrollBtnIcon: { fontSize: 22 },
  enrollBtnText: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  skipBtn: { alignItems: 'center', paddingVertical: 12 },
  skipBtnText: { color: Colors.textMuted, fontSize: 14, fontWeight: '600' },
  enrolledBadge: { backgroundColor: Colors.successLight, padding: Spacing.md, borderRadius: Radius.lg, alignItems: 'center', marginBottom: Spacing.md },
  enrolledText: { color: Colors.success, fontWeight: '700', fontSize: 15 },
  primaryBtn: { backgroundColor: Colors.primary, paddingVertical: 15, borderRadius: Radius.xl, alignItems: 'center', marginTop: Spacing.sm, ...Shadow.sm },
  primaryBtnTxt: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  loginLink: { alignItems: 'center', marginTop: Spacing.md },
  loginLinkTxt: { fontSize: 14, color: Colors.textSecondary },
});