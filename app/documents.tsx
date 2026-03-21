import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Image, Animated, Modal, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, Radius, Shadow, Typography } from '../constants/theme';
import { apiUploadDocument, apiOcrAadhaar } from '../services/api';
import api from '../services/api';

type Doc = {
  _id: string; title: string; type: string; status: string;
  fileUrl: string; taskId?: string; createdAt: string;
  fileName?: string;
};

type OcrResult = {
  aadhaarNumber?: string; name?: string; dob?: string;
  address?: string; gender?: string; rawText?: string;
  _demoMode?: boolean;
};

export default function DocumentsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('All');
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [showOcrModal, setShowOcrModal] = useState(false);
  const [scannedImage, setScannedImage] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const filters = ['All', 'Approved', 'Pending', 'Rejected'];

  useEffect(() => { fetchDocuments(); }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/document/my-documents');
      const docs = res.data.data?.documents || [];
      setDocuments(docs);
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    } catch {
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  /* ─── OCR Scan (Aadhaar/Document) ─── */
  const handleScanOCR = async () => {
    try {
      Alert.alert('Scan Aadhaar', 'Choose image source:', [
        {
          text: '📷 Camera', onPress: async () => {
            try {
              const perm = await ImagePicker.requestCameraPermissionsAsync();
              if (perm.status !== 'granted') { Alert.alert('Permission Required', 'Camera access needed'); return; }
              const pic = await ImagePicker.launchCameraAsync({ quality: 0.85, allowsEditing: true });
              if (!pic.canceled && pic.assets[0]) await processOCR(pic.assets[0].uri, pic.assets[0].mimeType || 'image/jpeg');
            } catch (cameraErr: any) {
              console.warn('Camera error:', cameraErr);
              Alert.alert('Camera Error', 'Camera unavailable. Try gallery or use Demo Scan.', [
                { text: 'Use Demo', onPress: () => useDemoOCR() },
                { text: 'Cancel', style: 'cancel' },
              ]);
            }
          }
        },
        {
          text: '🖼️ Gallery', onPress: async () => {
            try {
              const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (perm.status !== 'granted') { Alert.alert('Permission Required', 'Gallery access needed'); return; }
              const pic = await ImagePicker.launchImageLibraryAsync({ quality: 0.85, allowsEditing: true });
              if (!pic.canceled && pic.assets[0]) await processOCR(pic.assets[0].uri, pic.assets[0].mimeType || 'image/jpeg');
            } catch (galErr: any) {
              console.warn('Gallery error:', galErr);
              Alert.alert('Gallery Error', 'Could not open gallery. Try Demo Scan.', [
                { text: 'Use Demo', onPress: () => useDemoOCR() },
                { text: 'Cancel', style: 'cancel' },
              ]);
            }
          }
        },
        {
          text: '🧪 Demo Scan', onPress: () => useDemoOCR(),
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } catch (e) {
      Alert.alert('Error', 'Could not open image picker');
    }
  };

  const processOCR = async (uri: string, mimeType: string) => {
    setScanning(true);
    setScannedImage(uri);
    try {
      const fd = new FormData();
      fd.append('aadhaarImage', { uri, name: 'scan.jpg', type: mimeType } as any);
      const res = await apiOcrAadhaar(fd);
      const extracted: OcrResult = res.data.data?.extracted || {};
      setOcrResult(extracted);
      setShowOcrModal(true);
    } catch (e: any) {
      console.warn('OCR API error, falling back to demo:', e.message);
      // Fallback to demo on any error
      useDemoOCR();
    } finally {
      setScanning(false);
    }
  };

  /* ─── Demo OCR (no image needed) ─── */
  const useDemoOCR = async () => {
    setScanning(true);
    setScannedImage(null);
    try {
      const res = await api.post('/ocr/demo');
      const extracted: OcrResult = res.data.data?.extracted || {};
      setOcrResult(extracted);
      setShowOcrModal(true);
    } catch (demoErr: any) {
      // Ultimate fallback: local demo data if even the API is down
      const localDemo: OcrResult = {
        aadhaarNumber: '9876-5432-1098',
        name: 'Ramesh Kumar Sharma',
        dob: '15/03/1955',
        gender: 'Male',
        address: 'H.No. 42, Knowledge Park III, Greater Noida, UP - 201310',
        _demoMode: true,
        rawText: '[DEMO] Local fallback data',
      };
      setOcrResult(localDemo);
      setShowOcrModal(true);
    } finally {
      setScanning(false);
    }
  };

  /* ─── Upload Document ─── */
  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const file = result.assets[0];
      setUploading(true);

      const formData = new FormData();
      formData.append('document', { uri: file.uri, name: file.name, type: file.mimeType || 'application/pdf' } as any);
      formData.append('title', file.name);
      formData.append('type', 'general');

      await apiUploadDocument(formData);
      Alert.alert('✅ Success', 'Document uploaded to your vault!');
      fetchDocuments();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const filtered = activeFilter === 'All'
    ? documents
    : documents.filter(d => d.status.toLowerCase() === activeFilter.toLowerCase());

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return Colors.success;
      case 'pending': return Colors.warning;
      case 'rejected': return Colors.danger;
      default: return Colors.textMuted;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return '✅';
      case 'pending': return '⏳';
      case 'rejected': return '❌';
      default: return '📄';
    }
  };

  const getDocIcon = (type: string) => {
    if (!type) return '📄';
    if (type.includes('pdf')) return '📕';
    if (type.includes('image') || type.includes('jpeg') || type.includes('png')) return '🖼️';
    return '📄';
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Document Vault</Text>
        <TouchableOpacity onPress={handleScanOCR} activeOpacity={0.85} style={styles.scanBtn} disabled={scanning}>
          {scanning
            ? <ActivityIndicator size="small" color={Colors.white} />
            : <Text style={styles.scanBtnText}>🔍 Scan</Text>
          }
        </TouchableOpacity>
      </View>

      {/* Stats row */}
      <Animated.View style={[styles.statsRow, { opacity: fadeAnim }]}>
        {[
          { label: 'Approved', count: documents.filter(d => d.status === 'approved').length, bg: '#E8F5E9', color: Colors.success },
          { label: 'Pending', count: documents.filter(d => d.status === 'pending').length, bg: '#FFF3E0', color: Colors.warning },
          { label: 'Rejected', count: documents.filter(d => d.status === 'rejected').length, bg: '#FCE4EC', color: Colors.danger },
        ].map(stat => (
          <View key={stat.label} style={[styles.statCard, { backgroundColor: stat.bg }]}>
            <Text style={[styles.statNum, { color: stat.color }]}>{stat.count}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </Animated.View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {filters.map((f, i) => (
          <TouchableOpacity key={i} activeOpacity={0.85}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Document list */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={{ fontSize: 52, marginBottom: 12 }}>🔒</Text>
          <Text style={styles.emptyTitle}>Vault is Empty</Text>
          <Text style={styles.emptyText}>Upload documents or scan your Aadhaar to auto-extract data.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {filtered.map((doc, idx) => (
            <Animated.View key={doc._id} style={[styles.docCard, { opacity: fadeAnim }]}>
              <View style={styles.docHeader}>
                <Text style={styles.docIcon}>{getDocIcon(doc.type)}</Text>
                <View style={styles.docInfo}>
                  <Text style={styles.docTitle} numberOfLines={1}>{doc.title || doc.fileName || 'Untitled'}</Text>
                  <Text style={styles.docType}>
                    {doc.type?.split('/')[1] || doc.type || 'document'} · {new Date(doc.createdAt).toLocaleDateString('en-IN')}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(doc.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(doc.status) }]}>
                    {getStatusIcon(doc.status)} {doc.status}
                  </Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </ScrollView>
      )}

      {/* Footer buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.scanOcrBtn]}
          onPress={handleScanOCR}
          disabled={scanning}
        >
          <Text style={styles.scanOcrBtnText}>{scanning ? '⏳ Scanning...' : '🔍 Scan Aadhaar (OCR)'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.uploadBtn, uploading && { opacity: 0.6 }]}
          onPress={handleUpload}
          disabled={uploading}
        >
          <Text style={styles.uploadBtnText}>{uploading ? '⏳ Uploading...' : '📎 Upload Document'}</Text>
        </TouchableOpacity>
      </View>

      {/* OCR Result Modal */}
      <Modal visible={showOcrModal} transparent animationType="slide" onRequestClose={() => setShowOcrModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🔍 OCR Extraction Result</Text>
              <TouchableOpacity onPress={() => setShowOcrModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Demo mode banner */}
            {ocrResult?._demoMode && (
              <View style={styles.demoBanner}>
                <Text style={styles.demoBannerText}>🧪 Demo Mode — sample Aadhaar data shown</Text>
              </View>
            )}

            {scannedImage && (
              <Image source={{ uri: scannedImage }} style={styles.previewImg} resizeMode="cover" />
            )}

            {ocrResult && (
              <ScrollView style={styles.ocrScroll} showsVerticalScrollIndicator={false}>
                {[
                  { label: '🪪 Aadhaar Number', value: ocrResult.aadhaarNumber },
                  { label: '👤 Name', value: ocrResult.name },
                  { label: '🎂 Date of Birth', value: ocrResult.dob },
                  { label: '⚧ Gender', value: ocrResult.gender },
                  { label: '📍 Address', value: ocrResult.address },
                ].filter(f => f.value).map(field => (
                  <View key={field.label} style={styles.ocrRow}>
                    <Text style={styles.ocrLabel}>{field.label}</Text>
                    <Text style={styles.ocrValue}>{field.value}</Text>
                  </View>
                ))}

                {ocrResult.rawText && !ocrResult.name && !ocrResult.aadhaarNumber && (
                  <View style={styles.ocrRawBox}>
                    <Text style={styles.ocrLabel}>📝 Extracted Text</Text>
                    <Text style={styles.ocrRaw}>{ocrResult.rawText}</Text>
                  </View>
                )}
              </ScrollView>
            )}

            <TouchableOpacity style={styles.modalDone} onPress={() => setShowOcrModal(false)}>
              <Text style={styles.modalDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, paddingHorizontal: Spacing.lg, backgroundColor: Colors.primary },
  backBtn: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.white },
  scanBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 6, paddingHorizontal: 14, borderRadius: Radius.full },
  scanBtnText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  statsRow: { flexDirection: 'row', padding: Spacing.md, gap: 8 },
  statCard: { flex: 1, padding: Spacing.md, borderRadius: Radius.lg, alignItems: 'center', ...Shadow.sm },
  statNum: { fontSize: 26, fontWeight: '900' },
  statLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, marginTop: 2 },
  filterRow: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, gap: 8 },
  filterChip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.borderLight, backgroundColor: Colors.surface },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  filterTextActive: { color: Colors.white },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  emptyText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  list: { padding: Spacing.md, paddingBottom: 120 },
  docCard: { backgroundColor: Colors.surface, padding: Spacing.md, borderRadius: Radius.lg, marginBottom: 10, ...Shadow.sm },
  docHeader: { flexDirection: 'row', alignItems: 'center' },
  docIcon: { fontSize: 30, marginRight: Spacing.md },
  docInfo: { flex: 1 },
  docTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  docType: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: Radius.full },
  statusText: { fontSize: 11, fontWeight: '700' },
  footer: { padding: Spacing.md, gap: 10, borderTopWidth: 1, borderTopColor: Colors.borderLight, backgroundColor: Colors.surface },
  scanOcrBtn: { backgroundColor: Colors.primaryGhost, borderWidth: 1.5, borderColor: Colors.primaryLight, paddingVertical: 13, borderRadius: Radius.lg, alignItems: 'center' },
  scanOcrBtnText: { color: Colors.primaryDark, fontSize: 15, fontWeight: '700' },
  uploadBtn: { backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: Radius.lg, alignItems: 'center', ...Shadow.md },
  uploadBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  // Demo banner
  demoBanner: { backgroundColor: '#FFF3E0', padding: 10, borderRadius: Radius.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: '#FFE0B2' },
  demoBannerText: { color: '#E65100', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  // OCR Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: Colors.white, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.lg, paddingBottom: 40, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  modalClose: { fontSize: 22, color: Colors.textMuted },
  previewImg: { width: '100%', height: 160, borderRadius: Radius.lg, marginBottom: Spacing.md },
  ocrScroll: { maxHeight: 320 },
  ocrRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  ocrLabel: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, marginBottom: 2 },
  ocrValue: { fontSize: 15, fontWeight: '700', color: Colors.text },
  ocrRawBox: { paddingVertical: 10 },
  ocrRaw: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  modalDone: { backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: Radius.lg, alignItems: 'center', marginTop: Spacing.lg },
  modalDoneText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
});
