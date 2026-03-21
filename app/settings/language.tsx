import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, Shadow, Typography } from '../../constants/theme';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', icon: '🇬🇧' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', icon: '🇮🇳' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', icon: '🇮🇳' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', icon: '🇮🇳' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', icon: '🇮🇳' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', icon: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', icon: '🇮🇳' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', icon: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', icon: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', icon: '🇮🇳' },
  { code: 'ur', name: 'Urdu', native: 'اردو', icon: '🇮🇳' },
];

export default function LanguageScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState('en');

  useState(() => {
    AsyncStorage.getItem('language').then(l => l && setSelected(l));
  });

  const handleSelect = async (code: string) => {
    setSelected(code);
    await AsyncStorage.setItem('language', code);
    const lang = LANGUAGES.find(l => l.code === code);
    Alert.alert('✅ Language Updated', `App language set to ${lang?.name || code}. AI assistant will respond in ${lang?.name}.`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🌐 Language</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.hint}>Choose your preferred language. AI assistant will respond in the selected language.</Text>

        {LANGUAGES.map(lang => (
          <TouchableOpacity key={lang.code} activeOpacity={0.85}
            style={[styles.langCard, selected === lang.code && styles.langCardActive]}
            onPress={() => handleSelect(lang.code)}
          >
            <Text style={styles.langIcon}>{lang.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.langName}>{lang.name}</Text>
              <Text style={styles.langNative}>{lang.native}</Text>
            </View>
            {selected === lang.code && (
              <View style={styles.checkCircle}>
                <Text style={styles.checkMark}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
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
  hint: { ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.lg, lineHeight: 20 },
  langCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceCard, borderRadius: Radius.xl, padding: Spacing.md, marginBottom: 10, gap: 14, ...Shadow.sm, borderWidth: 1.5, borderColor: Colors.borderLight },
  langCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryGhost },
  langIcon: { fontSize: 28 },
  langName: { ...Typography.bodyBold, color: Colors.text },
  langNative: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  checkCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  checkMark: { color: Colors.white, fontSize: 14, fontWeight: '900' },
});
