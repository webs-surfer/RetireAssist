import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
  ActivityIndicator, Linking, Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import MapView, { Marker, Circle } from 'react-native-maps';
import { Colors, Radius, Shadow, Spacing, Typography, AnimConfig } from '../../constants/theme';
import { apiGetNearbyHelpers } from '../../services/api';

type Helper = {
  id: string; profileId: string; name: string; rating: number;
  totalRatings: number; totalJobs: number; experience: number;
  services: string[]; price: { min: number; max: number };
  isAvailable: boolean; languages: string[];
  location?: { coordinates: [number, number]; city?: string };
};

const SERVICE_FILTERS = ['All', 'Pension', 'Insurance', 'Government', 'Health', 'Aadhaar'];

export default function HelpersScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [activeFilter, setActiveFilter] = useState('All');
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedHelper, setSelectedHelper] = useState<Helper | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const fetchHelpers = useCallback(async () => {
    setLoading(true);
    setHelpers([]);
    try {
      let lat = 28.4744;
      let lng = 77.4900;

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        lat = loc.coords.latitude;
        lng = loc.coords.longitude;
        setUserLocation({ latitude: lat, longitude: lng });
        mapRef.current?.animateToRegion({ latitude: lat, longitude: lng, latitudeDelta: 0.1, longitudeDelta: 0.1 }, 800);
      }

      const service = activeFilter !== 'All' ? activeFilter : undefined;
      const res = await apiGetNearbyHelpers(lat, lng, 50000, service);
      const fetched = res.data.data.helpers || [];
      setHelpers(fetched);

      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    } catch (e) {
      console.warn('Failed to fetch helpers:', e);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    fetchHelpers();
  }, [fetchHelpers]);

  const goToProfile = (h: Helper) => {
    router.push({
      pathname: '/helper-profile',
      params: {
        id: h.id, name: h.name, rating: String(h.rating),
        reviews: String(h.totalRatings), distance: '—',
        price: `₹${h.price?.min}–${h.price?.max}`, exp: `${h.experience} yrs`,
        services: h.services.join(','),
      },
    });
  };

  const openStreetView = (h: Helper) => {
    const coords = h.location?.coordinates;
    if (coords && coords[0] !== 0) {
      const [lng, lat] = coords;
      const url = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
      Linking.openURL(url);
    } else {
      // fallback: open Google Maps search for the helper city
      const city = h.location?.city || 'India';
      Linking.openURL(`https://www.google.com/maps/search/${encodeURIComponent(city)}`);
    }
  };

  const getHelperCoords = (h: Helper) => {
    const coords = h.location?.coordinates;
    if (coords && (coords[0] !== 0 || coords[1] !== 0)) {
      return { latitude: coords[1], longitude: coords[0] };
    }
    // spread helpers around user if no coords stored
    return userLocation
      ? { latitude: userLocation.latitude + (Math.random() - 0.5) * 0.05, longitude: userLocation.longitude + (Math.random() - 0.5) * 0.05 }
      : { latitude: 28.4744, longitude: 77.4900 };
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Nearby Helpers</Text>
            <Text style={styles.headerSub}>
              {userLocation ? '📍 Using your location' : '📍 Default location'}
            </Text>
          </View>
          <View style={styles.viewToggle}>
            {(['list', 'map'] as const).map(mode => (
              <TouchableOpacity
                key={mode}
                activeOpacity={0.85}
                style={[styles.toggleBtn, viewMode === mode && styles.toggleBtnActive]}
                onPress={() => setViewMode(mode)}
              >
                <Text style={[styles.toggleText, viewMode === mode && styles.toggleTextActive]}>
                  {mode === 'list' ? '☰ List' : '🗺️ Map'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {SERVICE_FILTERS.map((f, i) => (
          <TouchableOpacity key={i} activeOpacity={0.85}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Finding helpers near you...</Text>
        </View>
      ) : viewMode === 'map' ? (
        /* ─── MAP VIEW ─── */
        <View style={styles.mapWrapper}>
          <MapView
            ref={mapRef}
            style={styles.mapView}

            showsUserLocation
            showsMyLocationButton
            initialRegion={{
              latitude: userLocation?.latitude ?? 28.4744,
              longitude: userLocation?.longitude ?? 77.4900,
              latitudeDelta: 0.15,
              longitudeDelta: 0.15,
            }}
          >
            {/* User accuracy circle */}
            {userLocation && (
              <Circle
                center={userLocation}
                radius={5000}
                fillColor="rgba(82,84,225,0.08)"
                strokeColor="rgba(82,84,225,0.3)"
                strokeWidth={1}
              />
            )}
            {helpers.map(h => {
              const pos = getHelperCoords(h);
              return (
                <Marker
                  key={h.id}
                  coordinate={pos}
                  title={h.name}
                  description={`${h.rating}★  ₹${h.price?.min}–${h.price?.max} · ${h.isAvailable ? 'Available' : 'Busy'}`}
                  pinColor={h.isAvailable ? Colors.success : Colors.warning}
                  onPress={() => setSelectedHelper(h)}
                />
              );
            })}
          </MapView>

          {/* Selected helper card on map */}
          {selectedHelper && (
            <View style={styles.mapCard}>
              <View style={styles.mapCardHeader}>
                <Text style={styles.mapCardName}>{selectedHelper.name}</Text>
                <TouchableOpacity onPress={() => setSelectedHelper(null)}>
                  <Text style={styles.mapCardClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.mapCardStats}>
                {selectedHelper.rating}★  ·  ₹{selectedHelper.price?.min}–{selectedHelper.price?.max}  ·  {selectedHelper.experience} yrs
              </Text>
              <View style={styles.mapCardBtns}>
                <TouchableOpacity style={styles.streetViewBtn} onPress={() => openStreetView(selectedHelper)}>
                  <Text style={styles.streetViewBtnText}>🏙️ Street View</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.profileBtn} onPress={() => goToProfile(selectedHelper)}>
                  <Text style={styles.profileBtnText}>View Profile →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {helpers.length === 0 && (
            <View style={styles.mapEmpty}>
              <Text style={styles.emptyTitle}>No helpers found</Text>
            </View>
          )}
        </View>
      ) : helpers.length === 0 ? (
        /* ─── EMPTY LIST ─── */
        <View style={styles.centerContainer}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>🔍</Text>
          <Text style={styles.emptyTitle}>No Helpers Found</Text>
          <Text style={styles.emptyText}>No verified helpers available in your area yet.</Text>
          <TouchableOpacity style={styles.refreshBtn} onPress={fetchHelpers} activeOpacity={0.85}>
            <Text style={styles.refreshBtnText}>🔄 Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* ─── LIST VIEW ─── */
        <Animated.ScrollView
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          <Text style={styles.countText}>
            {helpers.length} helper{helpers.length !== 1 ? 's' : ''} found near you
          </Text>
          {helpers.map((h) => (
            <View key={h.id} style={styles.helperCard}>
              <View style={styles.cardTop}>
                <View style={styles.avatarContainer}>
                  <View style={[styles.avatar, { backgroundColor: Colors.saffron }]}>
                    <Text style={styles.avatarText}>{h.name?.charAt(0) ?? '?'}</Text>
                  </View>
                  <View style={[styles.statusDot, { backgroundColor: h.isAvailable ? Colors.success : Colors.warning }]} />
                </View>
                <View style={styles.infoContainer}>
                  <View style={styles.nameRow}>
                    <Text style={styles.helperName}>{h.name}</Text>
                    <View style={styles.kycBadge}><Text style={styles.kycText}>✅ KYC</Text></View>
                  </View>
                  <Text style={styles.statsText}>
                    {h.rating}★ ({h.totalRatings}) · {h.experience} yrs · {h.totalJobs} jobs
                  </Text>
                  {h.location?.city && (
                    <Text style={styles.cityText}>📍 {h.location.city}</Text>
                  )}
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>₹{h.price?.min}–{h.price?.max}</Text>
                  <Text style={[styles.statusLabel, { color: h.isAvailable ? Colors.success : Colors.warning }]}>
                    {h.isAvailable ? 'Available' : 'Busy'}
                  </Text>
                </View>
              </View>

              <View style={styles.serviceChips}>
                {h.services.map((s, i) => (
                  <View key={i} style={styles.serviceChip}>
                    <Text style={styles.serviceChipText}>{s}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.streetViewBtnSmall}
                  onPress={() => openStreetView(h)}
                >
                  <Text style={styles.streetViewBtnSmallText}>🏙️ Street View</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[styles.requestBtn, !h.isAvailable && styles.requestBtnDisabled]}
                  disabled={!h.isAvailable}
                  onPress={() => goToProfile(h)}
                >
                  <Text style={[styles.requestBtnText, !h.isAvailable && styles.requestBtnTextDisabled]}>
                    {h.isAvailable ? 'View & Request' : 'Currently Busy'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </Animated.ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.md, borderBottomLeftRadius: Radius.xl, borderBottomRightRadius: Radius.xl },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.white },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  viewToggle: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: Radius.md, padding: 3 },
  toggleBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: Radius.sm },
  toggleBtnActive: { backgroundColor: Colors.white },
  toggleText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  toggleTextActive: { color: Colors.primary },
  filterRow: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, gap: 8 },
  filterChip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.borderLight, backgroundColor: Colors.surface },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  filterTextActive: { color: Colors.white },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  loadingText: { fontSize: 14, color: Colors.textMuted, marginTop: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  emptyText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  refreshBtn: { backgroundColor: Colors.primaryGhost, paddingVertical: 10, paddingHorizontal: 24, borderRadius: Radius.full },
  refreshBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 14 },
  listContainer: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  countText: { fontSize: 13, color: Colors.textMuted, marginBottom: 12 },
  helperCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: 12, ...Shadow.sm },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatarContainer: { position: 'relative', marginRight: Spacing.md },
  avatar: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: Colors.white, fontSize: 22, fontWeight: 'bold' },
  statusDot: { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: Colors.white },
  infoContainer: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  helperName: { fontSize: 16, fontWeight: '700', color: Colors.text },
  kycBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  kycText: { fontSize: 10, fontWeight: '700', color: Colors.success },
  statsText: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  cityText: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  priceContainer: { alignItems: 'flex-end' },
  priceLabel: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  statusLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  serviceChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  serviceChip: { borderWidth: 1, borderColor: Colors.primaryLight, paddingVertical: 4, paddingHorizontal: 10, borderRadius: Radius.full },
  serviceChipText: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  cardActions: { flexDirection: 'row', gap: 8 },
  streetViewBtnSmall: { flex: 1, paddingVertical: 10, borderRadius: Radius.md, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.primaryLight },
  streetViewBtnSmallText: { color: Colors.primaryDark, fontWeight: '700', fontSize: 13 },
  requestBtn: { flex: 2, backgroundColor: Colors.primary, paddingVertical: 10, borderRadius: Radius.md, alignItems: 'center' },
  requestBtnDisabled: { backgroundColor: Colors.borderLight },
  requestBtnText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  requestBtnTextDisabled: { color: Colors.textMuted },
  // Map styles
  mapWrapper: { flex: 1, position: 'relative' },
  mapView: { flex: 1 },
  mapEmpty: { position: 'absolute', top: 20, alignSelf: 'center', backgroundColor: Colors.white, padding: 12, borderRadius: 12 },
  mapCard: { position: 'absolute', bottom: 20, left: 16, right: 16, backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.md, ...Shadow.lg },
  mapCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  mapCardName: { fontSize: 17, fontWeight: '800', color: Colors.text },
  mapCardClose: { fontSize: 20, color: Colors.textMuted },
  mapCardStats: { fontSize: 13, color: Colors.textSecondary, marginBottom: Spacing.md },
  mapCardBtns: { flexDirection: 'row', gap: 8 },
  streetViewBtn: { flex: 1, borderWidth: 1.5, borderColor: Colors.primaryLight, paddingVertical: 10, borderRadius: Radius.md, alignItems: 'center' },
  streetViewBtnText: { color: Colors.primaryDark, fontWeight: '700', fontSize: 13 },
  profileBtn: { flex: 2, backgroundColor: Colors.primary, paddingVertical: 10, borderRadius: Radius.md, alignItems: 'center' },
  profileBtnText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
});