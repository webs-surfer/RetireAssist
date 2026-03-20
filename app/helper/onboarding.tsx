import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, Radius, Shadow } from '../../constants/theme';
import { apiOcrAadhaar } from '../../services/api';

export default function HelperOnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '', mobile: '', services: [] as string[], availability: 'Full Time', aadhaar: '',
  });
  const [aadhaarFrontPhoto, setAadhaarFrontPhoto] = useState<string | null>(null);
  const [aadhaarBackPhoto, setAadhaarBackPhoto] = useState<string | null>(null);
  const [facePhoto, setFacePhoto] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);

  const pickImage = async (setter: (uri: string | null) => void, useCamera = false): Promise<string | null> => {
    try {
      if (useCamera && Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Camera access is needed.');
          return null;
        }
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });
        if (!result.canceled && result.assets.length > 0) {
          setter(result.assets[0].uri);
          return result.assets[0].uri;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Gallery access is needed.');
          return null;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.7,
        });
        if (!result.canceled && result.assets.length > 0) {
          setter(result.assets[0].uri);
          return result.assets[0].uri;
        }
      }
    } catch {
      Alert.alert('Error', 'Could not open image picker.');
    }
    return null;
  };

  const handleAadhaarUpload = async (isFront: boolean) => {
    const uri = await pickImage(isFront ? setAadhaarFrontPhoto : setAadhaarBackPhoto);
    if (uri && isFront) {
      setExtracting(true);
      try {
        const fd = new FormData();
        fd.append('aadhaarImage', {
          uri,
          name: 'aadhaar.jpg',
          type: 'image/jpeg',
        } as any);

        const res = await apiOcrAadhaar(fd);
        const extracted = res.data.data.extracted;
        if (extracted) {
          setFormData(prev => ({
            ...prev,
            name: extracted.name || prev.name,
            aadhaar: extracted.aadhaarNumber ? extracted.aadhaarNumber.replace(/\D/g, '') : prev.aadhaar,
          }));
          Alert.alert('Extracted!', 'We prefilled your details from the Aadhaar card.');
        }
      } catch (e) {
        console.warn("OCR failed", e);
        Alert.alert('OCR Failed', 'Could not read Aadhaar details. Please enter manually.');
      } finally {
        setExtracting(false);
      }
    }
  };

  const toggleService = (s: string) => {
    setFormData(prev => ({
      ...prev, services: prev.services.includes(s) ? prev.services.filter(x => x !== s) : [...prev.services, s]
    }));
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else setSuccess(true);
  };

  if (success) {
    return (
      <SafeAreaView style={styles.successSafe}>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>🎉</Text>
          <Text style={styles.successTitle}>Application Submitted!</Text>
          <Text style={styles.successDesc}>Your KYC details have been sent for verification. We will notify you within 24-48 hours.</Text>
          
          <View style={styles.checklist}>
            <Text style={styles.checkItem}>✅ Details Submitted</Text>
            <Text style={styles.checkItem}>✅ Aadhaar Uploaded</Text>
            <Text style={styles.checkItem}>⏳ Pending Admin Approval</Text>
          </View>

          <TouchableOpacity activeOpacity={0.85} style={styles.successBtn} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.successBtnText}>Go to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.85} onPress={() => { if (step > 0) setStep(step - 1); else router.back(); }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Helper Registration</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` as any }]} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {step === 0 && (
            <>
              <Text style={styles.stepTitle}>Basic Details</Text>
              <Text style={styles.stepDesc}>Tell us about what you do.</Text>

              <Text style={styles.label}>Full Name</Text>
              <TextInput style={styles.input} placeholder="As per Aadhaar" placeholderTextColor={Colors.textMuted} value={formData.name} onChangeText={t => setFormData({ ...formData, name: t })} />

              <Text style={styles.label}>Mobile Number</Text>
              <TextInput style={styles.input} placeholder="10-digit number" keyboardType="phone-pad" placeholderTextColor={Colors.textMuted} value={formData.mobile} onChangeText={t => setFormData({ ...formData, mobile: t })} />

              <Text style={styles.label}>Services you can provide</Text>
              <View style={styles.chipGrid}>
                {['Pension', 'Aadhaar', 'Insurance', 'Government', 'Health', 'Financial'].map((s, i) => (
                  <TouchableOpacity key={i} activeOpacity={0.85} style={[styles.chip, formData.services.includes(s) && styles.chipActive]} onPress={() => toggleService(s)}>
                    <Text style={[styles.chipText, formData.services.includes(s) && styles.chipTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Availability</Text>
              <View style={styles.row}>
                {['Full Time', 'Part Time', 'Weekends'].map((a, i) => (
                  <TouchableOpacity key={i} activeOpacity={0.85} style={[styles.radio, formData.availability === a && styles.radioActive]} onPress={() => setFormData({ ...formData, availability: a })}>
                    <Text style={[styles.radioText, formData.availability === a && styles.radioTextActive]}>{a}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {step === 1 && (
            <>
              <Text style={styles.stepTitle}>KYC Verification</Text>
              <Text style={styles.stepDesc}>Your details are encrypted and securely stored.</Text>

              <Text style={styles.label}>Aadhaar Number</Text>
              <TextInput style={styles.input} placeholder="XXXX XXXX XXXX" keyboardType="number-pad" maxLength={14} placeholderTextColor={Colors.textMuted} value={formData.aadhaar} onChangeText={t => {
                let val = t.replace(/\D/g, '');
                if (val.length > 4) val = val.slice(0, 4) + ' ' + val.slice(4);
                if (val.length > 9) val = val.slice(0, 9) + ' ' + val.slice(9);
                setFormData({ ...formData, aadhaar: val });
              }} />

              <Text style={styles.label}>Upload Aadhaar (Front)</Text>
              <TouchableOpacity activeOpacity={0.85} style={[styles.uploadArea, extracting && { opacity: 0.6 }]} onPress={() => handleAadhaarUpload(true)} disabled={extracting}>
                {extracting ? (
                  <><Text style={styles.uploadIcon}>⏳</Text><Text style={styles.uploadText}>Extracting details via AI...</Text></>
                ) : aadhaarFrontPhoto ? (
                  <Image source={{ uri: aadhaarFrontPhoto }} style={{ width: 200, height: 120, borderRadius: 8 }} />
                ) : (
                  <><Text style={styles.uploadIcon}>📷</Text><Text style={styles.uploadText}>Tap to open camera or gallery</Text></>
                )}
              </TouchableOpacity>

              <Text style={styles.label}>Upload Aadhaar (Back)</Text>
              <TouchableOpacity activeOpacity={0.85} style={styles.uploadArea} onPress={() => handleAadhaarUpload(false)}>
                {aadhaarBackPhoto ? (
                  <Image source={{ uri: aadhaarBackPhoto }} style={{ width: 200, height: 120, borderRadius: 8 }} />
                ) : (
                  <><Text style={styles.uploadIcon}>📷</Text><Text style={styles.uploadText}>Tap to open camera or gallery</Text></>
                )}
              </TouchableOpacity>
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.stepTitle}>Face Verification</Text>
              <Text style={styles.stepDesc}>Please take a clear selfie to match with your Aadhaar.</Text>

              <View style={styles.cameraPlaceholder}>
                {facePhoto ? (
                  <Image source={{ uri: facePhoto }} style={{ width: 180, height: 220, borderRadius: 20, marginBottom: Spacing.md }} />
                ) : (
                  <View style={styles.cameraFrame}>
                    <Text style={{ fontSize: 48 }}>👤</Text>
                  </View>
                )}
                <Text style={styles.cameraNote}>{facePhoto ? 'Photo captured!' : 'Position your face inside the frame'}</Text>
                <TouchableOpacity activeOpacity={0.85} style={styles.captureBtn} onPress={() => pickImage(setFacePhoto, true)}>
                  <Text style={styles.captureBtnText}>{facePhoto ? 'Retake Photo' : 'Take Photo'}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {step === 3 && (
            <>
              <Text style={styles.stepTitle}>Review Application</Text>
              <Text style={styles.stepDesc}>Please verify your details before submitting.</Text>

              <View style={styles.reviewCard}>
                <View style={styles.reviewRow}><Text style={styles.reviewLabel}>Name</Text><Text style={styles.reviewValue}>{formData.name || 'Not provided'}</Text></View>
                <View style={styles.reviewRow}><Text style={styles.reviewLabel}>Mobile</Text><Text style={styles.reviewValue}>{formData.mobile || 'Not provided'}</Text></View>
                <View style={styles.reviewRow}><Text style={styles.reviewLabel}>Availability</Text><Text style={styles.reviewValue}>{formData.availability}</Text></View>
                <View style={styles.reviewRow}><Text style={styles.reviewLabel}>Services</Text><Text style={styles.reviewValue}>{formData.services.join(', ') || 'None'}</Text></View>
                <View style={[styles.reviewRow, { borderBottomWidth: 0 }]}><Text style={styles.reviewLabel}>Aadhaar</Text><Text style={styles.reviewValue}>{formData.aadhaar || 'Not provided'}</Text></View>
              </View>

              <View style={styles.warningBox}>
                <Text style={styles.warningText}>By submitting, you agree to our Terms of Service and acknowledge that providing false KYC documents is a punishable offense.</Text>
              </View>
            </>
          )}

          <TouchableOpacity activeOpacity={0.85} style={styles.primaryBtn} onPress={handleNext}>
            <Text style={styles.primaryBtnText}>{step === 3 ? 'Submit Application' : 'Continue'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, backgroundColor: Colors.primary },
  backText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.white },
  progressBar: { height: 4, backgroundColor: Colors.borderLight, width: '100%' },
  progressFill: { height: '100%', backgroundColor: Colors.accent },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  stepTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.text, marginBottom: 4 },
  stepDesc: { fontSize: 14, color: Colors.textSecondary, marginBottom: Spacing.xl },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: Spacing.sm },
  input: { backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.md, fontSize: 15, color: Colors.text, marginBottom: Spacing.lg },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xl },
  chip: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.borderLight, backgroundColor: Colors.surface },
  chipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  chipText: { color: Colors.textSecondary, fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: Colors.white },
  row: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
  radio: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center', borderRadius: Radius.sm, borderWidth: 1.5, borderColor: Colors.borderLight, backgroundColor: Colors.surface },
  radioActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  radioText: { color: Colors.textSecondary, fontWeight: '600', fontSize: 13 },
  radioTextActive: { color: Colors.white },
  uploadArea: { backgroundColor: Colors.primaryGhost, borderWidth: 2, borderColor: Colors.border, borderStyle: 'dashed', borderRadius: Radius.md, padding: Spacing.lg, alignItems: 'center', marginBottom: Spacing.xl },
  uploadIcon: { fontSize: 32, marginBottom: Spacing.sm },
  uploadText: { color: Colors.textMuted, fontSize: 14, fontWeight: '500' },
  cameraPlaceholder: { alignItems: 'center', backgroundColor: Colors.surface, padding: Spacing.xl, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.sm },
  cameraFrame: { width: 200, height: 250, borderWidth: 2, borderColor: Colors.primary, borderStyle: 'dashed', borderRadius: Radius.full, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background, marginBottom: Spacing.md },
  cameraNote: { fontSize: 14, color: Colors.textSecondary, marginBottom: Spacing.lg },
  captureBtn: { backgroundColor: Colors.primaryLight, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, borderRadius: Radius.full },
  captureBtnText: { color: Colors.white, fontWeight: 'bold', fontSize: 16 },
  reviewCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.xl, borderWidth: 1, borderColor: Colors.borderLight },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  reviewLabel: { fontSize: 14, color: Colors.textSecondary, flex: 1 },
  reviewValue: { fontSize: 14, fontWeight: '600', color: Colors.text, flex: 2, textAlign: 'right' },
  warningBox: { backgroundColor: Colors.warningLight, padding: Spacing.md, borderRadius: Radius.md, marginBottom: Spacing.xl },
  warningText: { color: Colors.warning, fontSize: 12, lineHeight: 18, fontWeight: '500' },
  primaryBtn: { backgroundColor: Colors.primary, paddingVertical: Spacing.md, borderRadius: Radius.lg, alignItems: 'center', ...Shadow.md, marginBottom: Spacing.xxl },
  primaryBtnText: { color: Colors.white, fontSize: 16, fontWeight: 'bold' },
  successSafe: { flex: 1, backgroundColor: Colors.primaryDark },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  successIcon: { fontSize: 72, marginBottom: Spacing.md },
  successTitle: { fontSize: 28, fontWeight: 'bold', color: Colors.white, marginBottom: Spacing.sm, textAlign: 'center' },
  successDesc: { fontSize: 15, color: Colors.white, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xxl },
  checklist: { backgroundColor: 'rgba(255,255,255,0.1)', padding: Spacing.lg, borderRadius: Radius.lg, width: '100%', marginBottom: Spacing.xxl },
  checkItem: { color: Colors.white, fontSize: 16, fontWeight: '600', marginBottom: Spacing.sm },
  successBtn: { backgroundColor: Colors.accent, width: '100%', paddingVertical: Spacing.md, borderRadius: Radius.lg, alignItems: 'center' },
  successBtnText: { color: Colors.white, fontSize: 16, fontWeight: 'bold' },
});
