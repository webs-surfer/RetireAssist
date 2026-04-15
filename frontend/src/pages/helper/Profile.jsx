import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { validateAadhaar } from '../../utils/verhoeff';
import { generateHelperKeyPair } from '../../utils/cryptoVault';
import { CheckCircle, XCircle, Upload, Camera, ArrowRight, ArrowLeft, Sparkles, ShieldCheck, Clock, MapPin, Loader } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const helperLocIcon = L.divIcon({
    className: 'helper-loc-marker',
    html: `<div style="
        width:24px;height:24px;border-radius:50%;
        background:linear-gradient(135deg, #6366f1, #8b5cf6);
        border:4px solid white;
        box-shadow:0 0 0 3px rgba(99,102,241,0.4), 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});

function RecenterMap({ lat, lng }) {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) map.flyTo([lat, lng], 14, { duration: 1 });
    }, [lat, lng]);
    return null;
}

/* ── Design tokens ────────────────────────────────────────────── */
const C = {
    primary:   '#1E3A8A',
    blue:      '#3B82F6',
    green:     '#10B981',
    amber:     '#F59E0B',
    purple:    '#8B5CF6',
    text:      '#0F172A',
    textLight: '#64748B',
    border:    'rgba(226,232,240,0.8)',
    card:      '#FFFFFF',
};

const SERVICES = [
    'Income Tax Filing', 'Banking Assistance', 'Government Schemes',
    'Legal Aid', 'Health Services', 'Pension Management',
    'Financial Planning', 'Property Registration', 'Insurance Services', 'EPFO/ESI Support',
];

const steps = [
    { label: 'Aadhaar',  icon: '🪪' },
    { label: 'Document', icon: '📄' },
    { label: 'Selfie',   icon: '📷' },
    { label: 'Services', icon: '🛠️' },
    { label: 'Location', icon: '📍' },
];

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

/* ── Shared Button ────────────────────────────────────────────── */
function Btn({ onClick, disabled, children, variant = 'primary', style = {} }) {
    const base = {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        padding: '11px 20px', borderRadius: 12, fontSize: 13, fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1,
        border: 'none', transition: 'opacity 0.2s', width: '100%', ...style,
    };
    const variants = {
        primary: { background: `linear-gradient(135deg,${C.blue},${C.primary})`, color: '#fff', boxShadow: '0 4px 14px rgba(59,130,246,0.3)' },
        success: { background: `linear-gradient(135deg,${C.green},#059669)`, color: '#fff', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' },
        outline: { background: C.card, color: C.text, border: `1px solid ${C.border}`, boxShadow: 'none' },
    };
    return <button onClick={onClick} disabled={!!disabled} style={{ ...base, ...variants[variant] }}>{children}</button>;
}

export default function HelperProfile() {
    const { user } = useAuth();
    const [step, setStep]         = useState(0);
    const [aadhaar, setAadhaar]   = useState('');
    const [aadhaarResult, setAadhaarResult] = useState(null);
    const [aadhaarDoc, setAadhaarDoc]       = useState(null);
    const [faceImage, setFaceImage]         = useState(null);
    const [services, setServices] = useState([]);
    const [city, setCity]         = useState('');
    const [coords, setCoords]     = useState(null);
    const [locLoading, setLocLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted]   = useState(false);
    const [cameraOpen, setCameraOpen] = useState(false);
    const videoRef  = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    // Auto-detect location when step 4 is reached
    useEffect(() => {
        if (step === 4 && !coords) {
            setLocLoading(true);
            navigator.geolocation?.getCurrentPosition(
                async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setCoords({ lat: latitude, lng: longitude });
                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
                        const data = await res.json();
                        const cityName = data.address?.city || data.address?.town || data.address?.state_district || data.address?.county || '';
                        if (cityName) setCity(cityName);
                    } catch {}
                    setLocLoading(false);
                },
                () => {
                    setCoords({ lat: 12.9716, lng: 77.5946 });
                    setCity('Bangalore');
                    setLocLoading(false);
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        }
    }, [step]);

    const handleAadhaarChange = (val) => {
        setAadhaar(val);
        const cleaned = val.replace(/\s+/g, '');
        if (cleaned.length >= 12) setAadhaarResult(validateAadhaar(cleaned));
        else setAadhaarResult(null);
    };

    const openCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
            streamRef.current = stream;
            setCameraOpen(true);
            setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 100);
        } catch { alert('Camera access required. Use file upload if camera unavailable.'); }
    };

    const capture = () => {
        const video = videoRef.current, canvas = canvasRef.current;
        if (!video || !canvas) return;
        canvas.width = video.videoWidth; canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        canvas.toBlob(blob => { setFaceImage(new File([blob], 'selfie.jpg', { type: 'image/jpeg' })); stopCamera(); }, 'image/jpeg', 0.85);
    };

    const stopCamera = () => { streamRef.current?.getTracks().forEach(t => t.stop()); setCameraOpen(false); };
    const toggleService = (s) => setServices(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

    const handleSubmit = async () => {
        if (!coords) return alert('Please wait for location detection');
        if (services.length === 0) return alert('Please select at least one service');
        setSubmitting(true);
        try {
            if (!user?.publicKey) {
                const { publicKey, privateKey } = await generateHelperKeyPair();
                sessionStorage.setItem('helperPrivateKey', JSON.stringify(privateKey));
                await api.put('/helpers/public-key', { publicKey: JSON.stringify(publicKey) });
            }
            const fd = new FormData();
            if (aadhaarDoc) fd.append('aadhaarDoc', aadhaarDoc);
            if (faceImage)  fd.append('faceImage', faceImage);
            fd.append('city', city);
            fd.append('lat', coords.lat.toString());
            fd.append('lng', coords.lng.toString());
            services.forEach(s => fd.append('services', s));
            await api.post('/helpers/onboard', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setSubmitted(true);
        } catch (e) {
            alert('KYC submission failed: ' + (e.response?.data?.message || e.message));
        } finally { setSubmitting(false); }
    };

    /* ── Status States ─────────────────────────────────────────── */
    const statusPage = (icon, title, body, colorToken, bgToken, borderToken) => (
        <div style={{ padding: '8px 0 40px', maxWidth: 560 }}>
            <div style={{
                background: C.card, borderRadius: 20, padding: 40, textAlign: 'center',
                border: `1px solid ${borderToken}`, boxShadow: `0 4px 24px ${bgToken}`,
            }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>{icon}</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: '0 0 10px' }}>{title}</h2>
                <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.6 }}>{body}</p>
            </div>
        </div>
    );

    if (submitted || user?.onboardingStatus === 'approved') {
        return statusPage('✅', user?.onboardingStatus === 'approved' ? 'KYC Approved! 🎉' : 'KYC Submitted!',
            user?.onboardingStatus === 'approved' ? "You are verified and can now accept service requests." : "Your documents are under review. You'll be notified within 24 hours.",
            C.green, 'rgba(16,185,129,0.06)', 'rgba(16,185,129,0.2)');
    }

    if (user?.onboardingStatus === 'pending' || user?.onboardingStatus === 'submitted') {
        return statusPage('⏳', 'KYC Under Review',
            "Your documents are being verified by our admin team. You'll receive a notification once approved.",
            C.amber, 'rgba(245,158,11,0.06)', 'rgba(245,158,11,0.2)');
    }

    /* ── Stepper Form ──────────────────────────────────────────── */
    const inputStyle = {
        width: '100%', padding: '12px 16px', borderRadius: 12, border: `1.5px solid ${C.border}`,
        fontSize: 14, color: C.text, outline: 'none', boxSizing: 'border-box',
        transition: 'border-color 0.2s',
    };

    return (
        <div style={{ padding: '8px 0 40px' }}>
            {/* Header */}
            <div style={{
                background: C.card, borderRadius: 20, padding: '24px 28px', marginBottom: 24,
                border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8,
                    background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.18)',
                    borderRadius: 999, padding: '4px 12px',
                }}>
                    <ShieldCheck size={11} color={C.blue} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.blue, textTransform: 'uppercase', letterSpacing: '0.10em' }}>KYC Verification</span>
                </div>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: 0, lineHeight: 1.2 }}>Helper Verification</h1>
                <p style={{ fontSize: 13, color: C.textLight, marginTop: 6, fontWeight: 500 }}>Complete 5-step verification to start accepting service requests.</p>
            </div>

            {/* Stepper */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 0, marginBottom: 24,
                background: C.card, borderRadius: 16, padding: '16px 20px',
                border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                overflowX: 'auto',
            }}>
                {steps.map((s, i) => (
                    <div key={s.label} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: i < step
                                    ? `linear-gradient(135deg,${C.green},#059669)`
                                    : i === step
                                    ? `linear-gradient(135deg,${C.blue},${C.primary})`
                                    : 'rgba(226,232,240,0.8)',
                                boxShadow: i <= step ? '0 4px 12px rgba(59,130,246,0.2)' : 'none',
                                transition: 'all 0.3s ease',
                            }}>
                                {i < step
                                    ? <CheckCircle size={16} color="#fff" />
                                    : <span style={{ fontSize: 12, fontWeight: 700, color: i === step ? '#fff' : C.textLight }}>{i + 1}</span>}
                            </div>
                            <span style={{ fontSize: 10, fontWeight: 700, color: i === step ? C.blue : C.textLight, whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>{s.label}</span>
                        </div>
                        {i < 4 && (
                            <div style={{ flex: 1, height: 2, margin: '0 6px', marginBottom: 14, background: i < step ? `linear-gradient(90deg,${C.green},#059669)` : C.border, borderRadius: 2, transition: 'background 0.3s' }} />
                        )}
                    </div>
                ))}
            </div>

            {/* Form Card */}
            <motion.div key={step} initial="hidden" animate="visible" variants={fadeUp}>
                <div style={{
                    background: C.card, borderRadius: 20, padding: '28px',
                    border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}>
                    <canvas ref={canvasRef} style={{ display: 'none' }} />

                    {/* Step 0: Aadhaar */}
                    {step === 0 && (
                        <div>
                            <div style={{ marginBottom: 20 }}>
                                <p style={{ fontSize: 11, fontWeight: 700, color: C.blue, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Step 1 of 5</p>
                                <h3 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: 0, marginBottom: 4 }}>Aadhaar Number</h3>
                                <p style={{ fontSize: 13, color: C.textLight }}>Enter your 12-digit Aadhaar number for verification</p>
                            </div>
                            <input
                                type="text" value={aadhaar} maxLength={14}
                                placeholder="1234 5678 9012"
                                onChange={e => handleAadhaarChange(e.target.value)}
                                style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 16, letterSpacing: '0.12em' }}
                                onFocus={e => e.target.style.borderColor = C.blue}
                                onBlur={e => e.target.style.borderColor = C.border}
                            />
                            {aadhaarResult && (
                                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: aadhaarResult.valid ? C.green : '#EF4444' }}>
                                    {aadhaarResult.valid ? <CheckCircle size={15} /> : <XCircle size={15} />}
                                    {aadhaarResult.valid ? 'Valid Aadhaar (Verhoeff ✓)' : aadhaarResult.error}
                                </div>
                            )}
                            <div style={{ marginTop: 20 }}>
                                <Btn onClick={() => setStep(1)} disabled={!aadhaarResult?.valid} variant="primary">
                                    Continue <ArrowRight size={14} />
                                </Btn>
                            </div>
                        </div>
                    )}

                    {/* Step 1: Aadhaar Document */}
                    {step === 1 && (
                        <div>
                            <div style={{ marginBottom: 20 }}>
                                <p style={{ fontSize: 11, fontWeight: 700, color: C.blue, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Step 2 of 5</p>
                                <h3 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: 0, marginBottom: 4 }}>Upload Aadhaar Document</h3>
                                <p style={{ fontSize: 13, color: C.textLight }}>Upload a clear photo of your Aadhaar card (front side)</p>
                            </div>
                            <label style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                height: 140, borderRadius: 14, border: `2px dashed ${aadhaarDoc ? C.green : C.border}`,
                                cursor: 'pointer', transition: 'border-color 0.2s',
                                background: aadhaarDoc ? 'rgba(16,185,129,0.04)' : 'rgba(248,250,252,1)',
                            }}>
                                <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => setAadhaarDoc(e.target.files[0])} />
                                {aadhaarDoc ? (
                                    <>
                                        <CheckCircle size={30} color={C.green} style={{ marginBottom: 8 }} />
                                        <span style={{ fontSize: 13, fontWeight: 600, color: C.green }}>{aadhaarDoc.name}</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={30} color="#CBD5E1" style={{ marginBottom: 8 }} />
                                        <span style={{ fontSize: 13, color: C.textLight }}>Tap to upload Aadhaar image</span>
                                    </>
                                )}
                            </label>
                            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                                <Btn onClick={() => setStep(0)} variant="outline"><ArrowLeft size={14} /> Back</Btn>
                                <Btn onClick={() => setStep(2)} disabled={!aadhaarDoc} variant="primary">Continue <ArrowRight size={14} /></Btn>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Selfie */}
                    {step === 2 && (
                        <div>
                            <div style={{ marginBottom: 20 }}>
                                <p style={{ fontSize: 11, fontWeight: 700, color: C.blue, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Step 3 of 5</p>
                                <h3 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: 0, marginBottom: 4 }}>Capture Selfie</h3>
                                <p style={{ fontSize: 13, color: C.textLight }}>Take a live selfie for identity verification</p>
                            </div>
                            {cameraOpen ? (
                                <div>
                                    <video ref={videoRef} autoPlay playsInline style={{ width: '100%', borderRadius: 12, background: '#000', aspectRatio: '4/3', objectFit: 'cover' }} />
                                    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <Btn onClick={capture} variant="success"><Camera size={16} /> Capture Photo</Btn>
                                        <button onClick={stopCamera} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textLight, fontSize: 12 }}>Cancel</button>
                                    </div>
                                </div>
                            ) : faceImage ? (
                                <div style={{ padding: 16, borderRadius: 14, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                    <CheckCircle size={20} color={C.green} />
                                    <span style={{ fontSize: 13, fontWeight: 600, color: C.green }}>Selfie captured!</span>
                                    <button onClick={() => { setFaceImage(null); openCamera(); }} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: C.textLight, fontSize: 12 }}>Retake</button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <button onClick={openCamera} style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        height: 130, borderRadius: 14, border: `2px dashed ${C.border}`, cursor: 'pointer', background: '#F8FAFC',
                                    }}>
                                        <Camera size={32} color="#CBD5E1" style={{ marginBottom: 8 }} />
                                        <span style={{ fontSize: 13, color: C.textLight }}>Open Camera</span>
                                    </button>
                                    <div style={{ textAlign: 'center', fontSize: 12, color: C.textLight }}>or</div>
                                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', borderRadius: 12, border: `1.5px solid ${C.border}`, cursor: 'pointer', fontSize: 13, color: C.text }}>
                                        <Upload size={14} /> Upload Photo
                                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setFaceImage(e.target.files[0])} />
                                    </label>
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                                <Btn onClick={() => setStep(1)} variant="outline"><ArrowLeft size={14} /> Back</Btn>
                                <Btn onClick={() => setStep(3)} disabled={!faceImage} variant="primary">Continue <ArrowRight size={14} /></Btn>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Services */}
                    {step === 3 && (
                        <div>
                            <div style={{ marginBottom: 20 }}>
                                <p style={{ fontSize: 11, fontWeight: 700, color: C.blue, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Step 4 of 5</p>
                                <h3 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: 0, marginBottom: 4 }}>Select Services</h3>
                                <p style={{ fontSize: 13, color: C.textLight }}>Choose the services you can offer to senior citizens</p>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, maxHeight: 240, overflowY: 'auto', paddingRight: 4 }}>
                                {SERVICES.map(s => (
                                    <button key={s} onClick={() => toggleService(s)} style={{
                                        padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                                        textAlign: 'left', cursor: 'pointer', border: '1.5px solid', transition: 'all 0.2s',
                                        background: services.includes(s) ? 'rgba(59,130,246,0.06)' : '#F8FAFC',
                                        borderColor: services.includes(s) ? C.blue : C.border,
                                        color: services.includes(s) ? C.blue : C.text,
                                        boxShadow: services.includes(s) ? '0 2px 8px rgba(59,130,246,0.12)' : 'none',
                                    }}>
                                        {services.includes(s) && <span style={{ marginRight: 4 }}>✓</span>}{s}
                                    </button>
                                ))}
                            </div>
                            <p style={{ fontSize: 12, color: C.textLight, marginTop: 10 }}>{services.length} selected</p>
                            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                                <Btn onClick={() => setStep(2)} variant="outline"><ArrowLeft size={14} /> Back</Btn>
                                <Btn onClick={() => setStep(4)} disabled={services.length === 0} variant="primary">Continue <ArrowRight size={14} /></Btn>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Location — auto-detected via GPS with map preview */}
                    {step === 4 && (
                        <div>
                            <div style={{ marginBottom: 20 }}>
                                <p style={{ fontSize: 11, fontWeight: 700, color: C.blue, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Step 5 of 5</p>
                                <h3 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: 0, marginBottom: 4 }}>Your Location</h3>
                                <p style={{ fontSize: 13, color: C.textLight }}>We detect your current location automatically via GPS</p>
                            </div>

                            {locLoading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', background: '#F8FAFC', borderRadius: 14 }}>
                                    <Loader size={24} style={{ animation: 'spin 1s linear infinite', color: C.blue, marginBottom: 12 }} />
                                    <p style={{ fontSize: 13, color: C.textLight }}>Detecting your location...</p>
                                </div>
                            ) : coords ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {/* Detected location banner */}
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 14,
                                        background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)',
                                    }}>
                                        <MapPin size={18} color={C.green} style={{ flexShrink: 0 }} />
                                        <div>
                                            <p style={{ fontSize: 14, fontWeight: 700, color: '#065F46', margin: 0 }}>{city || 'Location detected'}</p>
                                            <p style={{ fontSize: 11, color: '#059669', margin: 0 }}>
                                                {coords.lat.toFixed(4)}°N, {coords.lng.toFixed(4)}°E
                                            </p>
                                        </div>
                                        <CheckCircle size={16} color={C.green} style={{ marginLeft: 'auto', flexShrink: 0 }} />
                                    </div>

                                    {/* Map preview */}
                                    <div style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: 220 }}>
                                        <MapContainer
                                            center={[coords.lat, coords.lng]}
                                            zoom={14}
                                            style={{ height: '100%', width: '100%' }}
                                            scrollWheelZoom={false}
                                            dragging={false}
                                            zoomControl={false}
                                        >
                                            <TileLayer
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            <RecenterMap lat={coords.lat} lng={coords.lng} />
                                            <Marker position={[coords.lat, coords.lng]} icon={helperLocIcon} />
                                            <Circle
                                                center={[coords.lat, coords.lng]}
                                                radius={3000}
                                                pathOptions={{ color: '#6366f1', fillColor: '#6366f1', fillOpacity: 0.08, weight: 1 }}
                                            />
                                        </MapContainer>
                                    </div>

                                    <p style={{ fontSize: 11, color: C.textLight, textAlign: 'center' }}>Users within this area will see you as a nearby helper</p>
                                </div>
                            ) : null}

                            <div style={{
                                marginTop: 14, padding: '12px 16px', borderRadius: 12,
                                background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
                                fontSize: 12, color: '#4338CA', lineHeight: 1.6,
                            }}>
                                <strong>Security note:</strong> Your RSA keypair will be generated for secure document sharing. Your private key stays in your browser session only.
                            </div>
                            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                                <Btn onClick={() => setStep(3)} variant="outline"><ArrowLeft size={14} /> Back</Btn>
                                <Btn onClick={handleSubmit} disabled={submitting || !coords || locLoading} variant="success">
                                    {submitting ? 'Submitting...' : 'Submit KYC 🚀'}
                                </Btn>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
