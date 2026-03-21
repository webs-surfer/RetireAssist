import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Radius, Shadow, Spacing } from '../constants/theme';

const { width } = Dimensions.get('window');

const DEEP_PURPLE = '#1A1433';
const MID_PURPLE = '#2A1A6E';
const BRAND = '#7C5CFC';
const BRAND_LIGHT = '#A78BFA';
const BRAND_GLOW = 'rgba(124,92,252,0.28)';
const GOLD = '#F5A623';
const WHITE = '#FFFFFF';
const WHITE70 = 'rgba(255,255,255,0.70)';
const WHITE20 = 'rgba(255,255,255,0.12)';

export default function LandingScreen() {
  const router = useRouter();

  const fade0 = useRef(new Animated.Value(0)).current;
  const slide0 = useRef(new Animated.Value(50)).current;
  const fade1 = useRef(new Animated.Value(0)).current;
  const slide1 = useRef(new Animated.Value(40)).current;
  const fade2 = useRef(new Animated.Value(0)).current;
  const slide2 = useRef(new Animated.Value(40)).current;
  const fade3 = useRef(new Animated.Value(0)).current;
  const slide3 = useRef(new Animated.Value(40)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const run = (f: Animated.Value, s: Animated.Value, delay: number) =>
      Animated.parallel([
        Animated.timing(f, { toValue: 1, duration: 700, delay, useNativeDriver: true }),
        Animated.timing(s, { toValue: 0, duration: 650, delay, useNativeDriver: true }),
      ]);

    Animated.stagger(140, [
      run(fade0, slide0, 0),
      run(fade1, slide1, 0),
      run(fade2, slide2, 0),
      run(fade3, slide3, 0),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.07, duration: 1800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const features = [
    { icon: '🏛️', title: 'Govt Services', desc: 'Pension, Aadhaar, PAN & more', color: BRAND },
    { icon: '🤖', title: 'Gemini AI Guide', desc: 'Hindi & English voice support', color: '#F5A623' },
    { icon: '🤝', title: 'Verified Helpers', desc: 'KYC-verified near you', color: '#10BBAA' },
    { icon: '🔐', title: 'Fully Encrypted', desc: 'Zero-knowledge privacy', color: '#F06292' },
  ];

  const steps = [
    { num: '01', title: 'Sign Up', desc: 'Register in 60 seconds' },
    { num: '02', title: 'Pick Service', desc: 'Choose what you need' },
    { num: '03', title: 'Get Help', desc: 'A helper visits you' },
  ];

  const testimonials = [
    {
      name: 'Ramesh Gupta', age: 67, city: 'Jaipur',
      text: '"Got my pension sorted in 2 days. The helper was extremely patient!"',
    },
    {
      name: 'Sunita Sharma', age: 72, city: 'Lucknow',
      text: '"The AI guided me in Hindi. Best app for seniors Ive ever used!"',
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={DEEP_PURPLE} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ─── HERO ─── */}
        <View style={styles.hero}>
          {/* Background layers that simulate a gradient */}
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: DEEP_PURPLE }]} />
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: MID_PURPLE, opacity: 0.55 }]} />

          {/* Decorative orbs */}
          <View style={[styles.orb, { top: -80, right: -80, width: 260, height: 260, backgroundColor: BRAND_GLOW }]} />
          <View style={[styles.orb, { bottom: -60, left: -70, width: 200, height: 200, backgroundColor: 'rgba(245,166,35,0.10)' }]} />
          <View style={[styles.orb, { top: 120, left: -40, width: 130, height: 130, backgroundColor: 'rgba(124,92,252,0.18)' }]} />

          <Animated.View style={{ opacity: fade0, transform: [{ translateY: slide0 }], alignItems: 'center' }}>
            {/* Logo */}
            <Animated.View style={[styles.logoOuter, { transform: [{ scale: pulse }] }]}>
              <View style={styles.logoInner}>
                <Text style={styles.logoEmoji}>🌅</Text>
              </View>
            </Animated.View>

            <Text style={styles.appName}>RetireAssist</Text>
            <Text style={styles.tagline}>Simplifying retirement for{'\n'}every Indian citizen</Text>

            <View style={styles.trustPill}>
              <Text style={styles.trustPillText}>⭐  Trusted by 50,000+ seniors across India</Text>
            </View>
          </Animated.View>

          {/* Stats bar */}
          <Animated.View style={[styles.statsBar, { opacity: fade0 }]}>
            {[['50K+', 'Users'], ['2K+', 'Helpers'], ['4.8★', 'Rating'], ['12+', 'States']].map(([n, l], i) => (
              <View key={i} style={styles.statWrap}>
                <Text style={styles.statNum}>{n}</Text>
                <Text style={styles.statLbl}>{l}</Text>
                {i < 3 && <View style={styles.statDiv} />}
              </View>
            ))}
          </Animated.View>
        </View>

        {/* ─── HOW IT WORKS ─── */}
        <Animated.View style={[styles.section, { opacity: fade1, transform: [{ translateY: slide1 }] }]}>
          <Text style={styles.sectionTag}>HOW IT WORKS</Text>
          <Text style={styles.sectionTitle}>3 Simple Steps</Text>

          <View style={styles.stepsRow}>
            {steps.map((s, i) => (
              <View key={i} style={styles.stepCard}>
                <View style={styles.stepNumBg}>
                  <Text style={styles.stepNum}>{s.num}</Text>
                </View>
                <Text style={styles.stepTitle}>{s.title}</Text>
                <Text style={styles.stepDesc}>{s.desc}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ─── FEATURES ─── */}
        <Animated.View style={[styles.section, { opacity: fade1, transform: [{ translateY: slide1 }] }]}>
          <Text style={styles.sectionTag}>WHAT WE OFFER</Text>
          <Text style={styles.sectionTitle}>Everything You Need</Text>

          <View style={styles.grid}>
            {features.map((f, i) => (
              <View key={i} style={styles.featureCard}>
                <View style={[styles.featureIconBg, { backgroundColor: f.color + '18', borderColor: f.color + '35' }]}>
                  <Text style={styles.featureEmoji}>{f.icon}</Text>
                </View>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
                <View style={[styles.featureAccent, { backgroundColor: f.color }]} />
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ─── TESTIMONIALS ─── */}
        <Animated.View style={[styles.section, { opacity: fade2, transform: [{ translateY: slide2 }] }]}>
          <Text style={styles.sectionTag}>STORIES</Text>
          <Text style={styles.sectionTitle}>Loved by Seniors ❤️</Text>

          {testimonials.map((t, i) => (
            <View key={i} style={styles.testimonialCard}>
              <View style={styles.tRow}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitial}>{t.name[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tName}>{t.name}, {t.age}</Text>
                  <Text style={styles.tCity}>📍 {t.city}</Text>
                </View>
                <Text style={styles.tStars}>⭐⭐⭐⭐⭐</Text>
              </View>
              <Text style={styles.tText}>{t.text}</Text>
            </View>
          ))}
        </Animated.View>

        {/* ─── TRUST BADGES ─── */}
        <Animated.View style={[styles.badgesWrap, { opacity: fade2 }]}>
          {['🔒 Encrypted', '✅ KYC Verified', '🇮🇳 Made in India', '🤖 Gemini AI'].map((b, i) => (
            <View key={i} style={styles.badge}>
              <Text style={styles.badgeText}>{b}</Text>
            </View>
          ))}
        </Animated.View>

        {/* ─── CTA ─── */}
        <Animated.View style={[styles.ctaSection, { opacity: fade3, transform: [{ translateY: slide3 }] }]}>
          <View style={styles.ctaCard}>
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: DEEP_PURPLE, borderRadius: 32 }]} />
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: MID_PURPLE, opacity: 0.5, borderRadius: 32 }]} />
            <View style={[styles.orb, { top: -40, right: -30, width: 150, height: 150, backgroundColor: BRAND_GLOW }]} />

            <Text style={styles.ctaHeading}>Start Your Journey Today</Text>
            <Text style={styles.ctaSub}>Free forever · No credit card needed</Text>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.primaryBtn}
              onPress={() => router.push('/auth/signup')}
            >
              <View style={[StyleSheet.absoluteFillObject, { backgroundColor: BRAND, borderRadius: Radius.xl }]} />
              <View style={[StyleSheet.absoluteFillObject, { backgroundColor: BRAND_LIGHT, opacity: 0.35, borderRadius: Radius.xl }]} />
              <Text style={styles.primaryBtnTxt}>Get Started — It's Free  →</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.secondaryBtn}
              onPress={() => router.push('/auth/login')}
            >
              <Text style={styles.secondaryBtnTxt}>I Already Have an Account</Text>
            </TouchableOpacity>

            <Text style={styles.disclaimer}>🔐 Your data is end-to-end encrypted and never shared.</Text>
          </View>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F2FF' },
  scroll: { flexGrow: 1, paddingBottom: 40 },

  // ── Hero
  hero: {
    paddingTop: 48,
    paddingBottom: 40,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    overflow: 'hidden',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    minHeight: 380,
  },
  orb: { position: 'absolute', borderRadius: 999 },

  logoOuter: {
    width: 104, height: 104, borderRadius: 52,
    backgroundColor: 'rgba(124,92,252,0.22)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(167,139,250,0.45)',
    marginBottom: 18,
    ...Shadow.lg,
  },
  logoInner: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.09)',
    justifyContent: 'center', alignItems: 'center',
  },
  logoEmoji: { fontSize: 40 },

  appName: {
    fontSize: 42, fontWeight: '900', color: WHITE,
    letterSpacing: 0.5, marginBottom: 12,
  },
  tagline: {
    fontSize: 16, color: WHITE70, textAlign: 'center',
    lineHeight: 25, fontWeight: '500', marginBottom: 18,
  },
  trustPill: {
    backgroundColor: WHITE20, borderRadius: Radius.full,
    paddingVertical: 8, paddingHorizontal: 18,
    borderWidth: 1, borderColor: 'rgba(167,139,250,0.30)',
    marginBottom: 28,
  },
  trustPillText: { color: WHITE70, fontSize: 12, fontWeight: '600' },

  statsBar: {
    flexDirection: 'row',
    backgroundColor: WHITE20,
    borderRadius: Radius.xl,
    paddingVertical: 16, width: '100%',
    borderWidth: 1, borderColor: 'rgba(167,139,250,0.20)',
  },
  statWrap: { flex: 1, alignItems: 'center', position: 'relative' },
  statNum: { fontSize: 20, fontWeight: '900', color: GOLD },
  statLbl: { fontSize: 10, color: WHITE70, marginTop: 3, fontWeight: '600', letterSpacing: 0.3 },
  statDiv: { position: 'absolute', right: 0, top: '10%', width: 1, height: '80%', backgroundColor: 'rgba(255,255,255,0.15)' },

  // ── Sections
  section: { paddingHorizontal: Spacing.lg, paddingTop: 36 },
  sectionTag: {
    fontSize: 10, fontWeight: '800', color: BRAND,
    letterSpacing: 2, marginBottom: 6,
  },
  sectionTitle: { fontSize: 24, fontWeight: '900', color: DEEP_PURPLE, marginBottom: 20 },

  // ── Steps
  stepsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  stepCard: { flex: 1, alignItems: 'center' },
  stepNumBg: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: BRAND,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 10, ...Shadow.md,
  },
  stepNum: { color: WHITE, fontSize: 14, fontWeight: '900' },
  stepTitle: { fontSize: 12, fontWeight: '800', color: DEEP_PURPLE, textAlign: 'center', marginBottom: 4 },
  stepDesc: { fontSize: 10, color: '#6B7280', textAlign: 'center', lineHeight: 15 },

  // ── Feature cards
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  featureCard: {
    width: (width - Spacing.lg * 2 - 12) / 2,
    backgroundColor: WHITE,
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1, borderColor: '#EDE9FE',
    overflow: 'hidden',
    ...Shadow.card,
  },
  featureIconBg: {
    width: 52, height: 52, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, marginBottom: 12,
  },
  featureEmoji: { fontSize: 26 },
  featureTitle: { fontSize: 13, fontWeight: '800', color: DEEP_PURPLE, marginBottom: 5 },
  featureDesc: { fontSize: 11, color: '#6B7280', lineHeight: 16 },
  featureAccent: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
    borderBottomLeftRadius: Radius.xl, borderBottomRightRadius: Radius.xl,
  },

  // ── Testimonials
  testimonialCard: {
    backgroundColor: WHITE, borderRadius: Radius.xl,
    padding: Spacing.md, marginBottom: 14,
    borderWidth: 1, borderColor: '#EDE9FE',
    ...Shadow.card,
  },
  tRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatarCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: BRAND + '20',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: BRAND + '40',
  },
  avatarInitial: { fontSize: 18, fontWeight: '900', color: BRAND },
  tName: { fontSize: 14, fontWeight: '800', color: DEEP_PURPLE },
  tCity: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  tStars: { fontSize: 12 },
  tText: { fontSize: 13, color: '#374151', lineHeight: 20, fontStyle: 'italic' },

  // ── Badges
  badgesWrap: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', gap: 8,
    paddingHorizontal: Spacing.lg, marginTop: 28,
  },
  badge: {
    backgroundColor: '#EDE9FE',
    paddingVertical: 7, paddingHorizontal: 14,
    borderRadius: Radius.full,
    borderWidth: 1, borderColor: BRAND + '30',
  },
  badgeText: { color: BRAND, fontSize: 12, fontWeight: '700' },

  // ── CTA
  ctaSection: { padding: Spacing.lg, paddingTop: 28 },
  ctaCard: {
    borderRadius: 32, padding: 28,
    alignItems: 'center', overflow: 'hidden',
    ...Shadow.lg,
  },
  ctaHeading: {
    fontSize: 24, fontWeight: '900', color: WHITE,
    textAlign: 'center', marginBottom: 8, zIndex: 1,
  },
  ctaSub: {
    fontSize: 13, color: WHITE70, marginBottom: 24,
    textAlign: 'center', zIndex: 1,
  },
  primaryBtn: {
    width: '100%', height: 54,
    borderRadius: Radius.xl,
    justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden', marginBottom: 14,
    zIndex: 1, ...Shadow.md,
  },
  primaryBtnTxt: { color: WHITE, fontSize: 17, fontWeight: '900', letterSpacing: 0.3, zIndex: 2 },
  secondaryBtn: {
    width: '100%', paddingVertical: 14,
    borderRadius: Radius.xl, alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(167,139,250,0.50)',
    marginBottom: 18, zIndex: 1,
  },
  secondaryBtnTxt: { color: WHITE70, fontSize: 15, fontWeight: '700' },
  disclaimer: {
    textAlign: 'center', color: 'rgba(255,255,255,0.40)',
    fontSize: 11, lineHeight: 18, zIndex: 1,
  },
});
