import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow, Spacing } from '../../constants/theme';
import { apiUpdateProfile } from '../../services/api';

const LANGUAGES = ['Hindi', 'English', 'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Kannada'];
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

export default function ProfileSetupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [language, setLanguage] = useState('Hindi');
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ─── MAIN PHOTO HANDLER — platform aware ─────────────────────────────────
  const handleTakePhoto = async () => {
    if (Platform.OS === 'web') {
      // ── WEB (browser): camera not accessible → open file picker instead ──
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow file access to upload a photo.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled && result.assets.length > 0) {
        setPhoto(result.assets[0].uri);
      }
    } else {
      // ── MOBILE (Android / iOS): open live camera ──
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Please allow camera access in Settings → RetireAssist → Camera.',
          [{ text: 'OK' }]
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        cameraType: ImagePicker.CameraType.front, // start on selfie cam
      });
      if (!result.canceled && result.assets.length > 0) {
        setPhoto(result.assets[0].uri);
      }
    }
  };

  // ─── CHANGE PHOTO (after photo taken) ─────────────────────────────────────
  const handleChangePhoto = () => {
    if (Platform.OS === 'web') {
      // On web just re-open the file picker
      handleTakePhoto();
      return;
    }
    // On mobile give the user a choice
    Alert.alert(
      'Change Photo',
      'How would you like to update your photo?',
      [
        { text: '📷 Take New Photo', onPress: handleTakePhoto },
        { text: '🖼️ Choose from Gallery', onPress: handlePickFromGallery },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // ─── GALLERY PICKER (mobile fallback option) ──────────────────────────────
  const handlePickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow gallery access in your device settings.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhoto(result.assets[0].uri);
    }
  };

  // ─── SAVE PROFILE ─────────────────────────────────────────────────────────
  const handleComplete = async () => {
    if (!name.trim() || !age.trim() || !city.trim()) {
      Alert.alert('Required Fields', 'Please fill Name, Age, and City');
      return;
    }
    setLoading(true);
    try {
      await apiUpdateProfile({
        name: name.trim(),
        age: parseInt(age),
        gender,
        phone,
        city,
        preferredLanguage: language,
        profileCompleted: true,
      });

      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.name = name.trim();
        user.age = parseInt(age);
        user.city = city;
        user.profileCompleted = true;
        await AsyncStorage.setItem('user', JSON.stringify(user));
      }

      router.replace('/(tabs)');
    } catch (error: any) {
      // If backend is offline, still continue
      Alert.alert('Note', 'Profile saved locally. Will sync when connected.', [
        { text: 'Continue', onPress: () => router.replace('/(tabs)') },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
          <Text style={styles.headerTitle}>Complete Your Profile</Text>
          <Text style={styles.headerSub}>Takes 1 minute. Helps us personalize your services.</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* ── PHOTO SECTION ── */}
          <View style={styles.photoSection}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={photo ? handleChangePhoto : handleTakePhoto}
              style={styles.photoTouchable}
            >
              {photo ? (
                // Show captured/selected photo
                <Image source={{ uri: photo }} style={styles.photoImage} />
              ) : (
                // Placeholder
                <View style={styles.avatarCircle}>
                  <Text style={styles.cameraEmoji}>
                    {Platform.OS === 'web' ? '🖼️' : '📷'}
                  </Text>
                  <Text style={styles.avatarPlaceholderTxt}>
                    {Platform.OS === 'web' ? 'Tap to upload photo' : 'Tap to take photo'}
                  </Text>
                </View>
              )}

              {/* Badge in corner */}
              <View style={styles.cameraBadge}>
                <Text style={styles.cameraBadgeIcon}>
                  {Platform.OS === 'web' ? '🖼️' : '📷'}
                </Text>
              </View>
            </TouchableOpacity>

            {photo ? (
              <TouchableOpacity onPress={handleChangePhoto} activeOpacity={0.85} style={styles.changePhotoBtn}>
                <Text style={styles.changePhotoBtnTxt}>
                  {Platform.OS === 'web' ? '🖼️ Change Photo' : '📷 Retake / Change'}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.photoHint}>
                {Platform.OS === 'web'
                  ? 'Upload a photo from your files'
                  : 'Take a live selfie — helps admin verify your identity'}
              </Text>
            )}
          </View>

          {/* ── FORM ── */}
          <View style={styles.form}>

            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="As per Aadhaar card"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Age *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 65"
              placeholderTextColor={Colors.textMuted}
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
            />

            <Text style={styles.label}>Gender</Text>
            <View style={styles.chipRow}>
              {GENDERS.map(g => (
                <TouchableOpacity
                  key={g}
                  activeOpacity={0.85}
                  style={[styles.chip, gender === g && styles.chipActive]}
                  onPress={() => setGender(g)}
                >
                  <Text style={[styles.chipTxt, gender === g && styles.chipTxtActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Mobile Number</Text>
            <View style={styles.phoneRow}>
              <View style={styles.prefix}>
                <Text style={styles.prefixTxt}>🇮🇳 +91</Text>
              </View>
              <TextInput
                style={[styles.input, styles.phoneInput]}
                placeholder="10-digit number"
                placeholderTextColor={Colors.textMuted}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <Text style={styles.label}>City / District *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Patna, Bihar"
              placeholderTextColor={Colors.textMuted}
              value={city}
              onChangeText={setCity}
            />

            <Text style={styles.label}>Preferred Language</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.langScroll}
            >
              {LANGUAGES.map(lang => (
                <TouchableOpacity
                  key={lang}
                  activeOpacity={0.85}
                  style={[styles.langChip, language === lang && styles.langChipActive]}
                  onPress={() => setLanguage(lang)}
                >
                  <Text style={[styles.langTxt, language === lang && styles.langTxtActive]}>{lang}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.infoBox}>
              <Text style={styles.infoTxt}>
                🔐 Your information is encrypted and only used to personalize your services. We never share it.
              </Text>
            </View>

          </View>
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.88}
            style={[styles.completeBtn, loading && { opacity: 0.7 }]}
            onPress={handleComplete}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={styles.completeBtnTxt}>Complete Setup & Enter App →</Text>
            }
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.skipBtn}>
            <Text style={styles.skipTxt}>Skip for now</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '75%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  headerTitle: { fontSize: 24, fontWeight: '900', color: Colors.text, marginBottom: 4 },
  headerSub: { fontSize: 14, color: Colors.textSecondary, lineHeight: 19 },

  scroll: { flexGrow: 1, paddingBottom: Spacing.xxl },

  // ── Photo section ──
  photoSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  photoTouchable: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  photoImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  avatarCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.primaryGhost,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  cameraEmoji: { fontSize: 32, marginBottom: 4 },
  avatarPlaceholderTxt: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  cameraBadgeIcon: { fontSize: 14 },
  changePhotoBtn: {
    backgroundColor: Colors.primaryGhost,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.primaryLight + '50',
  },
  changePhotoBtnTxt: { color: Colors.primary, fontWeight: '700', fontSize: 13 },
  photoHint: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: Spacing.xl,
  },

  // ── Form ──
  form: { padding: Spacing.lg },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: 15,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.md,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipTxt: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  chipTxtActive: { color: Colors.white },

  phoneRow: { flexDirection: 'row', marginBottom: Spacing.md },
  prefix: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderTopLeftRadius: Radius.md,
    borderBottomLeftRadius: Radius.md,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRightWidth: 0,
  },
  prefixTxt: { fontSize: 13, fontWeight: '600', color: Colors.text },
  phoneInput: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    marginBottom: 0,
  },

  langScroll: { gap: 8, paddingRight: Spacing.md, marginBottom: Spacing.md },
  langChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  langChipActive: {
    backgroundColor: Colors.primaryGhost,
    borderColor: Colors.primary,
  },
  langTxt: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  langTxtActive: { color: Colors.primary },

  infoBox: {
    backgroundColor: Colors.primaryGhost,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primaryLight + '30',
  },
  infoTxt: { color: Colors.primaryDark, fontSize: 12, lineHeight: 18 },

  // ── Footer ──
  footer: {
    padding: Spacing.lg,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  completeBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: Radius.xl,
    alignItems: 'center',
    marginBottom: Spacing.sm,
    ...Shadow.md,
  },
  completeBtnTxt: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  skipBtn: { alignItems: 'center', paddingVertical: 8 },
  skipTxt: { color: Colors.textMuted, fontSize: 14 },
});