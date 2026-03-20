import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Shadow } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function LandingScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  const features = [
    { icon: '🏛️', title: 'Government Services', desc: 'Pension, Aadhaar, PAN & more', bg: '#EEF2FF' },
    { icon: '🤖', title: 'Gemini AI Guide', desc: 'Voice & text in Hindi/English', bg: '#FFF7ED' },
    { icon: '🤝', title: 'Verified Helpers', desc: 'KYC-verified nearby assistants', bg: '#F0FDF4' },
    { icon: '🔐', title: 'Fully Encrypted', desc: 'Zero-knowledge data security', bg: '#FDF4FF' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroBubble1} />
          <View style={styles.heroBubble2} />
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center' }}>
            <View style={styles.logoRing}>
              <Text style={styles.logoEmoji}>🌅</Text>
            </View>
            <Text style={styles.appName}>RetireAssist</Text>
            <Text style={styles.tagline}>Simplifying retirement for{'\n'}every Indian citizen</Text>
          </Animated.View>

          <Animated.View style={[styles.statsBar, { opacity: fadeAnim }]}>
            {[['50K+', 'Users'], ['2K+', 'Helpers'], ['4.8★', 'Rating']].map(([n, l], i) => (
              <View key={i} style={styles.statWrap}>
                <Text style={styles.statNum}>{n}</Text>
                <Text style={styles.statLbl}>{l}</Text>
                {i < 2 && <View style={styles.statDiv} />}
              </View>
            ))}
          </Animated.View>
        </View>

        {/* Features grid */}
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionLabel}>WHAT WE OFFER</Text>
          <View style={styles.grid}>
            {features.map((f, i) => (
              <View key={i} style={[styles.featureCard, Shadow.card, { backgroundColor: f.bg }]}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Badges */}
        <Animated.View style={[styles.badges, { opacity: fadeAnim }]}>
          {['🔒 Encrypted', '✅ KYC Verified', '🇮🇳 Made in India', '🤖 Gemini AI'].map((b, i) => (
            <View key={i} style={styles.badge}><Text style={styles.badgeText}>{b}</Text></View>
          ))}
        </Animated.View>

        {/* CTA */}
        <Animated.View style={[styles.cta, { opacity: fadeAnim }]}>
          <TouchableOpacity activeOpacity={0.88} style={styles.primaryBtn} onPress={() => router.push('/auth/signup')}>
            <Text style={styles.primaryBtnTxt}>Get Started — It's Free →</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.88} style={styles.secondaryBtn} onPress={() => router.push('/auth/login')}>
            <Text style={styles.secondaryBtnTxt}>I Already Have an Account</Text>
          </TouchableOpacity>
          <Text style={styles.disclaimer}>🔐 Your data is end-to-end encrypted. We never share your documents.</Text>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, paddingBottom: Spacing.xxl },
  hero: { backgroundColor: Colors.primary, paddingTop: 56, paddingBottom: 36, paddingHorizontal: Spacing.lg, alignItems: 'center', overflow: 'hidden', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  heroBubble1: { position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.06)' },
  heroBubble2: { position: 'absolute', bottom: -30, left: -50, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.04)' },
  logoRing: { width: 92, height: 92, borderRadius: 46, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)', marginBottom: Spacing.md },
  logoEmoji: { fontSize: 44 },
  appName: { fontSize: 40, fontWeight: '900', color: Colors.white, letterSpacing: 0.5, marginBottom: 8 },
  tagline: { fontSize: 17, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 26, fontWeight: '500', marginBottom: Spacing.xl },
  statsBar: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: Radius.xl, paddingVertical: 14, width: '100%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  statWrap: { flex: 1, alignItems: 'center', position: 'relative' },
  statNum: { fontSize: 22, fontWeight: '900', color: Colors.accentLight },
  statLbl: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  statDiv: { position: 'absolute', right: 0, top: '10%', width: 1, height: '80%', backgroundColor: 'rgba(255,255,255,0.2)' },
  section: { padding: Spacing.lg, paddingTop: Spacing.xl },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: Colors.primary, letterSpacing: 1.5, marginBottom: Spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  featureCard: { width: (width - Spacing.lg * 2 - 12) / 2, padding: Spacing.md, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.borderLight },
  featureIcon: { fontSize: 32, marginBottom: 8 },
  featureTitle: { fontSize: 13, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  featureDesc: { fontSize: 11, color: Colors.textSecondary, lineHeight: 16 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl },
  badge: { backgroundColor: Colors.primaryGhost, paddingVertical: 6, paddingHorizontal: 12, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.primaryLight + '40' },
  badgeText: { color: Colors.primary, fontSize: 12, fontWeight: '700' },
  cta: { paddingHorizontal: Spacing.lg },
  primaryBtn: { backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: Radius.xl, alignItems: 'center', marginBottom: Spacing.md, ...Shadow.md },
  primaryBtnTxt: { color: Colors.white, fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
  secondaryBtn: { paddingVertical: 14, borderRadius: Radius.xl, alignItems: 'center', borderWidth: 2, borderColor: Colors.primary, marginBottom: Spacing.md },
  secondaryBtnTxt: { color: Colors.primary, fontSize: 16, fontWeight: '700' },
  disclaimer: { textAlign: 'center', color: Colors.textMuted, fontSize: 12, lineHeight: 18 },
});
