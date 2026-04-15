import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../utils/api';
import { Star, MapPin, List, Map as MapIcon, Loader, Shield, Navigation, ChevronRight, Phone, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/* ── Custom Map Icons ── */
function createHelperIcon(rating, distText, isSelected) {
    const color = rating >= 4.5 ? '#059669' : rating >= 3.5 ? '#2563EB' : '#D97706';
    const glow = isSelected ? `0 0 0 4px ${color}44, ` : '';
    return L.divIcon({
        className: 'helper-marker-custom',
        html: `<div style="position:relative;display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.3));">
            <div style="
                width:44px;height:44px;border-radius:50%;
                background:linear-gradient(145deg, ${color}, ${color}cc);
                border:${isSelected ? '4px' : '3px'} solid white;
                box-shadow:${glow}0 3px 12px rgba(0,0,0,0.35);
                display:flex;align-items:center;justify-content:center;
                position:relative;
            ">
                <span style="font-size:18px;">✅</span>
            </div>
            ${distText ? `<div style="
                margin-top:3px;padding:2px 8px;border-radius:10px;
                background:linear-gradient(135deg,rgba(15,23,42,0.88),rgba(30,58,138,0.88));
                color:white;font-size:10px;font-weight:800;white-space:nowrap;
                letter-spacing:0.02em;
                border:1px solid rgba(255,255,255,0.15);
                box-shadow:0 2px 6px rgba(0,0,0,0.25);
            ">📍 ${distText}</div>` : ''}
        </div>`,
        iconSize: [54, 65],
        iconAnchor: [27, 30],
        popupAnchor: [0, -35],
    });
}

const userIcon = L.divIcon({
    className: 'user-marker-custom',
    html: `<div style="position:relative;display:flex;flex-direction:column;align-items:center;">
        <div style="
            width:22px;height:22px;border-radius:50%;
            background:linear-gradient(135deg,#3B82F6,#1D4ED8);
            border:4px solid white;
            box-shadow:0 0 0 3px rgba(59,130,246,0.4), 0 2px 10px rgba(0,0,0,0.3);
            animation: userPulse 2s ease-in-out infinite;
        "></div>
    </div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
});

function RecenterMap({ lat, lng }) {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) map.flyTo([lat, lng], 13, { duration: 1.2 });
    }, [lat, lng]);
    return null;
}

function distanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function renderStars(rating) {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    let stars = '';
    for (let i = 0; i < 5; i++) {
        if (i < full) stars += '★';
        else if (i === full && half) stars += '★';
        else stars += '☆';
    }
    return stars;
}

/* ── Styles ── */
const S = {
    container: { position: 'relative', fontFamily: "'Inter',system-ui,sans-serif" },
    header: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 14, padding: '0 2px',
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: 10 },
    headerIcon: {
        width: 36, height: 36, borderRadius: 11,
        background: 'linear-gradient(135deg,#059669,#10B981)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
    },
    title: { fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0 },
    subtitle: { fontSize: 12, color: '#64748B', margin: 0, fontWeight: 500 },
    viewToggle: {
        display: 'flex', background: '#F1F5F9', borderRadius: 10, padding: 3,
        border: '1px solid rgba(226,232,240,0.8)',
    },
    viewBtn: (active) => ({
        display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px',
        borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
        border: 'none', transition: 'all 0.2s', fontFamily: 'inherit',
        background: active ? '#fff' : 'transparent',
        color: active ? '#0F172A' : '#94A3B8',
        boxShadow: active ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
    }),
    mapWrap: {
        borderRadius: 18, overflow: 'hidden',
        border: '1px solid rgba(226,232,240,0.8)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        position: 'relative',
    },
    loading: {
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '60px 0', background: 'linear-gradient(135deg,#F8FAFC,#EFF6FF)',
        borderRadius: 18, border: '1px solid rgba(226,232,240,0.8)',
    },
    popupCard: {
        minWidth: 260, fontFamily: "'Inter',system-ui,sans-serif",
        background: '#fff', borderRadius: 16, overflow: 'hidden',
    },
    popupHeader: {
        background: 'linear-gradient(135deg,#0F172A,#1E3A5F)',
        padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
    },
    popupAvatar: {
        width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg,#059669,#10B981)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 800, fontSize: 18,
        border: '3px solid rgba(255,255,255,0.2)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    },
    popupName: { fontSize: 14, fontWeight: 800, color: '#fff', margin: 0 },
    popupBadge: {
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 10, fontWeight: 700, color: '#34D399',
        background: 'rgba(16,185,129,0.15)', padding: '2px 8px',
        borderRadius: 999, marginTop: 3,
    },
    popupBody: { padding: '12px 16px' },
    popupRow: {
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 12, color: '#64748B', marginBottom: 8,
    },
    popupServices: {
        display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12,
    },
    popupServiceTag: {
        fontSize: 10, fontWeight: 700, padding: '3px 8px',
        borderRadius: 999, background: 'rgba(59,130,246,0.08)',
        color: '#2563EB', border: '1px solid rgba(59,130,246,0.15)',
    },
    popupSelectBtn: (selected) => ({
        width: '100%', padding: '10px 0', borderRadius: 10,
        background: selected ? 'linear-gradient(135deg,#059669,#10B981)' : 'linear-gradient(135deg,#1E3A8A,#2563EB)',
        color: '#fff', border: 'none', fontWeight: 800, fontSize: 13,
        cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.03em',
        boxShadow: selected ? '0 4px 12px rgba(16,185,129,0.3)' : '0 4px 12px rgba(37,99,235,0.3)',
        transition: 'all 0.2s',
    }),
    legend: {
        display: 'flex', alignItems: 'center', gap: 16, padding: '10px 4px',
        fontSize: 11, color: '#64748B', fontWeight: 600,
    },
    legendDot: (color) => ({
        width: 10, height: 10, borderRadius: '50%', background: color,
        display: 'inline-block', border: '2px solid white',
        boxShadow: `0 0 0 1px ${color}`,
    }),
    // List view card
    listCard: (selected) => ({
        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
        borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s',
        background: selected ? 'linear-gradient(135deg,rgba(5,150,105,0.06),rgba(16,185,129,0.04))' : '#fff',
        border: selected ? '2px solid #059669' : '2px solid rgba(226,232,240,0.8)',
        boxShadow: selected ? '0 4px 16px rgba(5,150,105,0.15)' : '0 1px 4px rgba(0,0,0,0.04)',
    }),
    listAvatar: (color) => ({
        width: 50, height: 50, borderRadius: 16, flexShrink: 0,
        background: `linear-gradient(135deg,${color},${color}cc)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 800, fontSize: 18,
        boxShadow: `0 4px 12px ${color}40`,
    }),
    listSelectBtn: (selected) => ({
        padding: '7px 16px', borderRadius: 9, fontSize: 11, fontWeight: 800,
        cursor: 'pointer', border: 'none', fontFamily: 'inherit',
        background: selected ? '#059669' : 'linear-gradient(135deg,#1E3A8A,#2563EB)',
        color: '#fff', whiteSpace: 'nowrap', letterSpacing: '0.04em',
        boxShadow: selected ? '0 3px 8px rgba(5,150,105,0.3)' : '0 3px 8px rgba(37,99,235,0.3)',
        transition: 'all 0.2s',
    }),
};

export default function HelperMap({ onSelectHelper, selectedHelper, serviceFilter }) {
    const [userPos, setUserPos] = useState(null);
    const [helpers, setHelpers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('map');
    const mapRef = useRef(null);

    useEffect(() => {
        if (!navigator.geolocation) { fetchHelpers(); return; }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                fetchHelpers(pos.coords.latitude, pos.coords.longitude);
            },
            () => fetchHelpers(),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, []);

    const fetchHelpers = async (lat, lng) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (lat && lng) { params.set('lat', lat); params.set('lng', lng); params.set('radius', '200'); }
            const { data } = await api.get(`/helpers?${params.toString()}`);
            const results = Array.isArray(data) ? data : [];
            
            // Fallback: if geo-query returned nothing, fetch ALL helpers
            if (results.length === 0) {
                const { data: allData } = await api.get('/helpers');
                setHelpers(Array.isArray(allData) ? allData : []);
            } else {
                setHelpers(results);
            }
        } catch {
            setHelpers([]);
        } finally {
            setLoading(false);
        }
    };

    const getDistance = (helper) => {
        if (!userPos || !helper.location?.coordinates) return null;
        const [lng, lat] = helper.location.coordinates;
        return distanceKm(userPos.lat, userPos.lng, lat, lng);
    };

    const sortedHelpers = [...helpers].sort((a, b) => {
        const da = getDistance(a);
        const db = getDistance(b);
        if (da !== null && db !== null) {
            if (Math.abs(da - db) > 0.5) return da - db;
            return (b.rating || 0) - (a.rating || 0);
        }
        if (da !== null) return -1;
        if (db !== null) return 1;
        return (b.rating || 0) - (a.rating || 0);
    });

    const formatDist = (d) => {
        if (d === null) return null;
        return d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)} km`;
    };

    const getHelperColor = (rating) => rating >= 4.5 ? '#059669' : rating >= 3.5 ? '#2563EB' : '#D97706';

    const defaultCenter = userPos ? [userPos.lat, userPos.lng] : [12.9716, 77.5946];

    return (
        <div style={S.container}>
            {/* Header */}
            <div style={S.header}>
                <div style={S.headerLeft}>
                    <div style={S.headerIcon}>
                        <Navigation size={18} color="#fff" />
                    </div>
                    <div>
                        <h3 style={S.title}>
                            {userPos ? 'Helpers Near You' : 'Available Helpers'}
                        </h3>
                        <p style={S.subtitle}>
                            {loading ? 'Searching...' : `${sortedHelpers.length} verified helper${sortedHelpers.length !== 1 ? 's' : ''} found`}
                        </p>
                    </div>
                </div>
                <div style={S.viewToggle}>
                    <button onClick={() => setView('map')} style={S.viewBtn(view === 'map')}>
                        <MapIcon size={13} /> Map
                    </button>
                    <button onClick={() => setView('list')} style={S.viewBtn(view === 'list')}>
                        <List size={13} /> List
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={S.loading}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 16,
                        background: 'linear-gradient(135deg,#3B82F6,#1E3A8A)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 14, boxShadow: '0 8px 24px rgba(59,130,246,0.3)',
                        animation: 'pulse 1.5s ease-in-out infinite',
                    }}>
                        <Loader size={22} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>Locating nearby helpers...</p>
                    <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>Using your GPS for best results</p>
                </div>
            ) : view === 'map' ? (
                /* ── MAP VIEW ── */
                <div>
                    <div style={{ ...S.mapWrap, height: 420 }}>
                        <MapContainer
                            center={defaultCenter}
                            zoom={13}
                            style={{ height: '100%', width: '100%' }}
                            ref={mapRef}
                            scrollWheelZoom={true}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {userPos && <RecenterMap lat={userPos.lat} lng={userPos.lng} />}

                            {/* User marker */}
                            {userPos && (
                                <>
                                    <Marker position={[userPos.lat, userPos.lng]} icon={userIcon}>
                                        <Popup><div style={{ fontFamily: "'Inter',sans-serif", textAlign: 'center' }}>
                                            <strong style={{ fontSize: 13 }}>📍 Your Location</strong>
                                        </div></Popup>
                                    </Marker>
                                    <Circle
                                        center={[userPos.lat, userPos.lng]}
                                        radius={5000}
                                        pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.04, weight: 1.5, dashArray: '6 4' }}
                                    />
                                </>
                            )}

                            {/* Helper markers with rich popup cards */}
                            {sortedHelpers.map(helper => {
                                if (!helper.location?.coordinates) return null;
                                const [lng, lat] = helper.location.coordinates;
                                const dist = getDistance(helper);
                                const distLabel = formatDist(dist);
                                const isSelected = selectedHelper?._id === helper._id;
                                const hColor = getHelperColor(helper.rating || 0);

                                return (
                                    <Marker
                                        key={helper._id}
                                        position={[lat, lng]}
                                        icon={createHelperIcon(helper.rating || 0, distLabel, isSelected)}
                                    >
                                        <Popup maxWidth={290} minWidth={260}>
                                            <div style={S.popupCard}>
                                                {/* Card header — dark */}
                                                <div style={S.popupHeader}>
                                                    <div style={{ ...S.popupAvatar, background: `linear-gradient(135deg,${hColor},${hColor}cc)` }}>
                                                        {helper.name?.[0]?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p style={S.popupName}>{helper.name}</p>
                                                        {helper.isVerified && (
                                                            <div style={S.popupBadge}>
                                                                <Shield size={9} /> Verified Helper
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Card body */}
                                                <div style={S.popupBody}>
                                                    {/* Rating + Distance */}
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                            <span style={{ color: '#F59E0B', fontSize: 13, letterSpacing: 1 }}>{renderStars(helper.rating || 0)}</span>
                                                            <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>{helper.rating || 0}</span>
                                                            <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>({helper.totalReviews || 0})</span>
                                                        </div>
                                                        {dist !== null && (
                                                            <div style={{
                                                                display: 'flex', alignItems: 'center', gap: 4,
                                                                background: 'rgba(59,130,246,0.08)',
                                                                padding: '3px 10px', borderRadius: 999,
                                                                fontSize: 11, fontWeight: 700, color: '#2563EB',
                                                            }}>
                                                                <MapPin size={10} /> {distLabel}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Services */}
                                                    {helper.services?.length > 0 && (
                                                        <div style={S.popupServices}>
                                                            {helper.services.slice(0, 3).map((s, i) => (
                                                                <span key={i} style={S.popupServiceTag}>🛠️ {s}</span>
                                                            ))}
                                                            {helper.services.length > 3 && (
                                                                <span style={{ ...S.popupServiceTag, background: 'rgba(100,116,139,0.08)', color: '#64748B' }}>
                                                                    +{helper.services.length - 3} more
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Bio */}
                                                    {helper.bio && (
                                                        <p style={{ fontSize: 11, color: '#64748B', lineHeight: 1.5, margin: '0 0 12px' }}>
                                                            {helper.bio.slice(0, 100)}{helper.bio.length > 100 ? '…' : ''}
                                                        </p>
                                                    )}

                                                    {/* Select button */}
                                                    <button
                                                        onClick={() => onSelectHelper?.(helper)}
                                                        style={S.popupSelectBtn(isSelected)}
                                                    >
                                                        {isSelected ? '✓ SELECTED' : 'SELECT HELPER'}
                                                    </button>
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                );
                            })}
                        </MapContainer>
                    </div>

                    {/* Legend */}
                    <div style={S.legend}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span style={S.legendDot('#3B82F6')} /> You
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span style={S.legendDot('#059669')} /> ⭐4.5+
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span style={S.legendDot('#2563EB')} /> ⭐3.5+
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span style={S.legendDot('#D97706')} /> Below
                        </span>
                        {userPos && (
                            <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 600, color: '#94A3B8' }}>
                                📍 5 km search radius
                            </span>
                        )}
                    </div>
                </div>
            ) : (
                /* ── LIST VIEW ── */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 420, overflowY: 'auto', paddingRight: 4 }}>
                    {sortedHelpers.length === 0 ? (
                        <div style={{
                            textAlign: 'center', padding: '48px 24px',
                            background: '#F8FAFC', borderRadius: 18,
                            border: '1px solid rgba(226,232,240,0.8)',
                        }}>
                            <MapPin size={36} color="#CBD5E1" style={{ marginBottom: 10 }} />
                            <p style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>No helpers found nearby</p>
                            <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>Try expanding your search area</p>
                        </div>
                    ) : sortedHelpers.map((helper, idx) => {
                        const dist = getDistance(helper);
                        const distLabel = formatDist(dist);
                        const isSelected = selectedHelper?._id === helper._id;
                        const hColor = getHelperColor(helper.rating || 0);

                        return (
                            <div
                                key={helper._id}
                                onClick={() => onSelectHelper?.(helper)}
                                style={S.listCard(isSelected)}
                            >
                                {/* Rank badge */}
                                <div style={{
                                    position: 'absolute', left: -4, top: -4,
                                    width: 22, height: 22, borderRadius: '50%',
                                    background: idx === 0 ? 'linear-gradient(135deg,#F59E0B,#D97706)' : '#E2E8F0',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 10, fontWeight: 800, color: idx === 0 ? '#fff' : '#64748B',
                                    boxShadow: idx === 0 ? '0 2px 6px rgba(245,158,11,0.4)' : 'none',
                                }}>
                                    {idx + 1}
                                </div>

                                {/* Avatar */}
                                <div style={S.listAvatar(hColor)}>
                                    {helper.name?.[0]?.toUpperCase()}
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                                        <p style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: 0 }}>{helper.name}</p>
                                        {helper.isVerified && (
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 3,
                                                fontSize: 9, fontWeight: 800, color: '#059669',
                                                background: 'rgba(5,150,105,0.08)',
                                                padding: '2px 6px', borderRadius: 999,
                                            }}>
                                                <Shield size={8} /> Verified
                                            </span>
                                        )}
                                    </div>

                                    {/* Rating + Distance row */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <span style={{ color: '#F59E0B', fontSize: 11, letterSpacing: 1 }}>{renderStars(helper.rating || 0)}</span>
                                        <span style={{ fontSize: 12, fontWeight: 800, color: '#0F172A' }}>{helper.rating || 0}</span>
                                        {distLabel && (
                                            <>
                                                <span style={{ color: '#CBD5E1' }}>·</span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, color: '#2563EB' }}>
                                                    <MapPin size={10} /> {distLabel}
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    {/* Services */}
                                    {helper.services?.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                            {helper.services.slice(0, 3).map((s, i) => (
                                                <span key={i} style={{
                                                    fontSize: 9, fontWeight: 700, padding: '2px 7px',
                                                    borderRadius: 999, background: 'rgba(59,130,246,0.06)',
                                                    color: '#3B82F6', border: '1px solid rgba(59,130,246,0.12)',
                                                }}>
                                                    {s}
                                                </span>
                                            ))}
                                            {helper.services.length > 3 && (
                                                <span style={{ fontSize: 9, fontWeight: 600, color: '#94A3B8' }}>
                                                    +{helper.services.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Select button */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); onSelectHelper?.(helper); }}
                                    style={S.listSelectBtn(isSelected)}
                                >
                                    {isSelected ? '✓ SELECTED' : 'SELECT'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* CSS Animations */}
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
                @keyframes userPulse {
                    0% { box-shadow: 0 0 0 3px rgba(59,130,246,0.4), 0 2px 10px rgba(0,0,0,0.3); }
                    50% { box-shadow: 0 0 0 8px rgba(59,130,246,0.15), 0 2px 10px rgba(0,0,0,0.3); }
                    100% { box-shadow: 0 0 0 3px rgba(59,130,246,0.4), 0 2px 10px rgba(0,0,0,0.3); }
                }
                .leaflet-popup-content-wrapper {
                    padding: 0 !important;
                    border-radius: 16px !important;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.2) !important;
                    overflow: hidden !important;
                }
                .leaflet-popup-content {
                    margin: 0 !important;
                    width: auto !important;
                }
                .leaflet-popup-tip {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
                }
            `}</style>
        </div>
    );
}
