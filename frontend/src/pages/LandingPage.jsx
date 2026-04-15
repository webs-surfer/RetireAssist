import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { Shield, FileText, Bot, Bell, ArrowRight, CheckCircle, Users, Clock, Phone, Mail, MapPin, ChevronRight, Sparkles, Lock, Zap, HeartHandshake, Building2, Landmark } from 'lucide-react';

/* ─── Framer Motion Variants ─── */
const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };
const scaleIn = { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } } };
const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const floatAnimation = { y: [-5, 5, -5], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } };
const floatAnimationSlow = { y: [-8, 8, -8], transition: { duration: 4, repeat: Infinity, ease: "easeInOut" } };
const hoverLift = { scale: 1.03, y: -5, transition: { duration: 0.3 } };
const tapAnim = { scale: 0.97 };

/* ─── Cursor parallax hook ─── */
function useCursorParallax(strength = 20) {
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const sx = useSpring(mx, { stiffness: 60, damping: 18, mass: 0.8 });
    const sy = useSpring(my, { stiffness: 60, damping: 18, mass: 0.8 });
    const onMove = useCallback((e) => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        mx.set(((e.clientX - cx) / cx) * strength);
        my.set(((e.clientY - cy) / cy) * strength);
    }, [mx, my, strength]);
    return { sx, sy, onMove };
}

/* ─── Slideshow images ─── */
import oldManPic from '../assets/old-man-pic.png';
import oldLadyPic from '../assets/oldlady.png';
import childrenPic from '../assets/children.png';
const heroImages = [oldManPic, oldLadyPic, childrenPic];

/* ─── Color palette ─── */
const C = {
    primary: '#1E3A8A', primaryLight: '#3B82F6', secondary: '#6366f1',
    accent: '#10B981', danger: '#EF4444',
    text: '#0F172A', textLight: '#64748B', textMuted: '#94A3B8',
    bg: '#F8FAFC', border: '#E2E8F0', white: '#FFFFFF',
};

/* ─── Centered wrapper style ─── */
const centered = (maxW = '1100px') => ({ maxWidth: maxW, margin: '0 auto', width: '100%' });

/* ════════════════════════════════════════════════════════
   NAVBAR
   ════════════════════════════════════════════════════════ */
function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
    return (
        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: scrolled ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${scrolled ? C.border : 'transparent'}`, transition: 'all 0.3s ease', boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.06)' : 'none' }}>
            <div style={{ ...centered('1200px'), padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                    <div style={{ width: '38px', height: '38px', background: `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})`, borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(30,58,138,0.3)' }}>
                        <Shield size={18} color="#fff" />
                    </div>
                    <div>
                        <div style={{ fontSize: '17px', fontWeight: 800, color: C.text, lineHeight: 1.2 }}>RetireAssist</div>
                        <div style={{ fontSize: '10px', color: C.textMuted, lineHeight: 1.2 }}>Secure Digital Pension Management</div>
                    </div>
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {['Features', 'Services', 'Why Us'].map((t, i) => (
                        <a key={i} href={`#${t.toLowerCase().replace(' ', '')}`}
                            style={{ fontSize: '14px', color: C.textLight, textDecoration: 'none', fontWeight: 600, padding: '6px 14px', borderRadius: '8px', transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.color = C.primary; e.currentTarget.style.background = 'rgba(30,58,138,0.06)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = C.textLight; e.currentTarget.style.background = 'transparent'; }}>{t}</a>
                    ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', background: 'rgba(16,185,129,0.08)', color: C.accent, borderRadius: '999px', fontSize: '12px', fontWeight: 600, border: '1px solid rgba(16,185,129,0.15)' }}>
                        <Shield size={11} /> Secure
                    </span>
                    <Link to="/login" style={{ padding: '8px 18px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, border: `1.5px solid ${C.border}`, color: C.text, background: '#fff', textDecoration: 'none', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = C.primaryLight; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}>Sign In</Link>
                    <Link to="/signup" style={{ padding: '8px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 700, border: 'none', color: '#fff', background: `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})`, textDecoration: 'none', boxShadow: '0 3px 10px rgba(30,58,138,0.3)', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 18px rgba(30,58,138,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 3px 10px rgba(30,58,138,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}>Get Started</Link>
                </div>
            </div>
        </nav>
    );
}

/* ════════════════════════════════════════════════════════
   HERO
   ════════════════════════════════════════════════════════ */
function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const heroTextRef = useRef(null);
    const { sx, sy, onMove } = useCursorParallax(10);

    useEffect(() => {
        if (heroImages.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section onMouseMove={onMove} style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
            {/* Full-section background slideshow with cursor parallax */}
            <AnimatePresence mode="wait">
                <motion.img
                    key={currentSlide}
                    src={heroImages[currentSlide]}
                    alt="RetireAssist"
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.04 }}
                    transition={{ duration: 1.2, ease: 'easeInOut' }}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, x: sx, y: sy, scale: 1.04 }}
                />
            </AnimatePresence>

            {/* Dark overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.40) 40%, rgba(0,0,0,0.50) 100%)', zIndex: 1 }} />
            {/* Glossy shine */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 40%, rgba(255,255,255,0.06) 60%, transparent 100%)', zIndex: 2, pointerEvents: 'none' }} />

            {/* Floating ambient badges — decorative, parallax offset */}
            <motion.div style={{ position: 'absolute', top: '22%', left: '6%', zIndex: 3, x: sx, y: sy, pointerEvents: 'none' }} animate={floatAnimation}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '12px', padding: '8px 14px', fontSize: '12px', color: 'rgba(255,255,255,0.85)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    <Shield size={13} /> Secure & Verified
                </div>
            </motion.div>
            <motion.div style={{ position: 'absolute', top: '30%', right: '5%', zIndex: 3, x: sx, y: sy, pointerEvents: 'none' }} animate={floatAnimationSlow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '12px', padding: '8px 14px', fontSize: '12px', color: 'rgba(255,255,255,0.85)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    <Bot size={13} /> AI-Powered
                </div>
            </motion.div>
            <motion.div style={{ position: 'absolute', bottom: '20%', left: '8%', zIndex: 3, x: sx, y: sy, pointerEvents: 'none' }} animate={floatAnimation}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '12px', padding: '8px 14px', fontSize: '12px', color: 'rgba(255,255,255,0.85)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    <Users size={13} /> 10,000+ Retirees
                </div>
            </motion.div>

            {/* Content */}
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" style={{ ...centered('850px'), textAlign: 'center', position: 'relative', zIndex: 3, paddingTop: '160px', paddingBottom: '100px', paddingLeft: '24px', paddingRight: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <motion.div variants={fadeUp} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', padding: '8px 20px', borderRadius: '999px', fontSize: '14px', color: 'rgba(255,255,255,0.9)', marginBottom: '28px', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <Sparkles size={14} /> AI-Powered Retirement Management
                </motion.div>
                <motion.h1 variants={fadeUp} style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 800, color: '#fff', marginBottom: '24px', lineHeight: 1.1, letterSpacing: '-0.02em', textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
                    RetireAssist — Your Personal<br /><span style={{ color: '#67e8f9' }}>Retirement Manager</span>
                </motion.h1>
                <motion.p variants={fadeUp} style={{ fontSize: '18px', color: 'rgba(220,235,255,0.95)', maxWidth: '640px', marginBottom: '36px', lineHeight: 1.7, textShadow: '0 1px 8px rgba(0,0,0,0.15)' }}>
                    Helping retirees manage pensions, insurance claims, income tax filing, and government paperwork through AI guidance, document automation, and personal assistance.
                </motion.p>
                <motion.div variants={fadeUp} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                    <motion.div whileHover={hoverLift} whileTap={tapAnim}>
                        <Link to="/signup"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 32px', borderRadius: '12px', fontSize: '16px', fontWeight: 700, background: C.accent, color: '#fff', textDecoration: 'none', boxShadow: '0 4px 20px rgba(16,185,129,0.4)', border: 'none' }}
                            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(16,185,129,0.5)'; }}
                            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(16,185,129,0.4)'; }}>
                            Get Assistance <ArrowRight size={18} />
                        </Link>
                    </motion.div>
                    <motion.div whileHover={hoverLift} whileTap={tapAnim}>
                        <a href="#features"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 32px', borderRadius: '12px', fontSize: '16px', fontWeight: 700, background: 'rgba(255,255,255,0.12)', color: '#fff', textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)' }}>
                            See How It Works
                        </a>
                    </motion.div>
                </motion.div>
                <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '28px', marginTop: '48px', fontSize: '14px', color: 'rgba(220,235,255,0.8)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Lock size={14} /> Bank-Grade Security</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle size={14} /> Govt. Verified</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={14} /> 10,000+ Retirees</span>
                </motion.div>
            </motion.div>

            {/* Dot indicators */}
            {heroImages.length > 1 && (
                <div style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px', zIndex: 4 }}>
                    {heroImages.map((_, i) => (
                        <button key={i} onClick={() => setCurrentSlide(i)}
                            style={{ width: currentSlide === i ? '28px' : '10px', height: '10px', borderRadius: '999px', border: '2px solid rgba(255,255,255,0.5)', background: currentSlide === i ? '#fff' : 'rgba(255,255,255,0.2)', cursor: 'pointer', transition: 'all 0.4s ease', padding: 0, boxShadow: currentSlide === i ? '0 0 12px rgba(255,255,255,0.4)' : 'none' }}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

/* ════════════════════════════════════════════════════════
   PROBLEMS SECTION
   ════════════════════════════════════════════════════════ */
function Problems() {
    const problems = [
        { icon: Building2, title: 'Multiple Office Visits', desc: 'Retirees must visit different offices repeatedly for pension, tax, and insurance work.', grad: 'linear-gradient(135deg, #ef4444, #f97316)', shadowColor: 'rgba(239,68,68,0.25)' },
        { icon: FileText, title: 'Complex Paperwork', desc: 'Filling complicated government forms and managing multiple documents is stressful.', grad: 'linear-gradient(135deg, #f59e0b, #ef4444)', shadowColor: 'rgba(245,158,11,0.25)' },
        { icon: Clock, title: 'Time Consuming', desc: 'Simple tasks take weeks due to bureaucratic processes and lack of digital tools.', grad: 'linear-gradient(135deg, #8b5cf6, #ec4899)', shadowColor: 'rgba(139,92,246,0.25)' },
        { icon: Lock, title: 'Fraud Risk', desc: 'Depending on agents or middlemen leads to overcharging, lack of transparency, and fraud.', grad: 'linear-gradient(135deg, #e11d48, #be123c)', shadowColor: 'rgba(225,29,72,0.25)' },
    ];

    return (
        <section style={{ padding: '100px 24px', background: 'linear-gradient(180deg, #fff 0%, #fef2f2 40%, #fff5f5 70%, #fff 100%)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(239,68,68,0.04) 0%, transparent 60%)', borderRadius: '50%', pointerEvents: 'none' }} />
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} style={{ ...centered(), position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: '56px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <motion.div variants={fadeUp} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '999px', padding: '6px 16px', marginBottom: '16px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: C.danger, display: 'inline-block' }} />
                        <span style={{ fontSize: '12px', fontWeight: 700, color: C.danger, textTransform: 'uppercase', letterSpacing: '0.1em' }}>The Problem</span>
                    </motion.div>
                    <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(28px,4vw,38px)', fontWeight: 800, color: C.text, marginBottom: '16px', lineHeight: 1.18 }}>
                        Why Retirement Is Harder <br /><span style={{ background: 'linear-gradient(90deg, #ef4444, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Than It Should Be</span>
                    </motion.h2>
                    <motion.p variants={fadeUp} style={{ color: C.textLight, maxWidth: '560px', fontSize: '16px', lineHeight: 1.7 }}>After retirement, people face difficulties managing pensions, ITR, insurance, and government documents.</motion.p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                    {problems.map((p, i) => (
                        <motion.div variants={scaleIn} whileHover={{ y: -6, boxShadow: `0 24px 48px ${p.shadowColor}` }} key={i}
                            style={{ background: '#fff', borderRadius: '20px', padding: '32px 22px', border: '1px solid rgba(239,68,68,0.08)', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', transition: 'box-shadow 0.3s', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                            {/* Full-bleed top gradient */}
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: p.grad }} />
                            {/* Watermark number */}
                            <div style={{ position: 'absolute', top: '8px', right: '12px', fontSize: '52px', fontWeight: 900, color: 'rgba(239,68,68,0.045)', lineHeight: 1, pointerEvents: 'none' }}>0{i + 1}</div>
                            <div style={{ width: '62px', height: '62px', background: p.grad, borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '12px auto 20px', boxShadow: `0 10px 24px ${p.shadowColor}` }}>
                                <p.icon size={28} color="#fff" />
                            </div>
                            <h3 style={{ fontWeight: 700, color: C.text, marginBottom: '10px', fontSize: '16px' }}>{p.title}</h3>
                            <p style={{ fontSize: '14px', color: C.textLight, lineHeight: 1.7 }}>{p.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
}

/* ════════════════════════════════════════════════════════
   STATS STRIP
   ════════════════════════════════════════════════════════ */
function StatsStrip() {
    const stats = [
        { value: '10,000+', label: 'Retirees Helped', icon: Users, color: '#3b82f6' },
        { value: '₹480 Cr+', label: 'Pension Claims Processed', icon: Landmark, color: '#10b981' },
        { value: '98%', label: 'Satisfaction Rate', icon: CheckCircle, color: '#a855f7' },
        { value: '4 min', label: 'Avg. Service Time', icon: Clock, color: '#f97316' },
    ];
    return (
        <section style={{ background: C.text, padding: '0 24px' }}>
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} style={{ ...centered('1100px'), display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {stats.map((s, i) => (
                    <motion.div variants={fadeUp} key={i} style={{ padding: '32px 20px', display: 'flex', alignItems: 'center', gap: '16px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                        <div style={{ width: '44px', height: '44px', background: `${s.color}22`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <s.icon size={20} color={s.color} />
                        </div>
                        <div>
                            <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>{s.value}</div>
                            <div style={{ fontSize: '12px', color: 'rgba(148,163,184,0.85)', marginTop: '2px', fontWeight: 500 }}>{s.label}</div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}

/* ════════════════════════════════════════════════════════
   FEATURES SECTION
   ════════════════════════════════════════════════════════ */
function Features() {
    const features = [
        { icon: Bot, title: 'AI Assistant', desc: 'Get instant answers about pension, tax filing, and insurance claims from our AI.', grad: 'linear-gradient(135deg, #3b82f6, #06b6d4)', tag: 'Smart AI', tagColor: '#3b82f6', shadowColor: 'rgba(59,130,246,0.2)' },
        { icon: FileText, title: 'Document Automation', desc: 'Upload documents with OCR scanning that auto-extracts and fills data for you.', grad: 'linear-gradient(135deg, #a855f7, #ec4899)', tag: 'OCR', tagColor: '#a855f7', shadowColor: 'rgba(168,85,247,0.2)' },
        { icon: Bell, title: 'Smart Reminders', desc: 'Never miss a deadline — automated reminders for life certificates, ITR, and more.', grad: 'linear-gradient(135deg, #f97316, #f87171)', tag: 'Alerts', tagColor: '#f97316', shadowColor: 'rgba(249,115,22,0.2)' },
        { icon: Shield, title: 'Secure Document Vault', desc: 'Bank-grade 256-bit encrypted storage for all your pension and financial documents.', grad: 'linear-gradient(135deg, #10b981, #14b8a6)', tag: 'AES-256', tagColor: '#10b981', shadowColor: 'rgba(16,185,129,0.2)' },
        { icon: Zap, title: 'One-Click Services', desc: 'Apply for pension corrections, bank updates, and life certificates with a single click.', grad: 'linear-gradient(135deg, #2563eb, #7c3aed)', tag: '1-Click', tagColor: '#2563eb', shadowColor: 'rgba(37,99,235,0.2)' },
        { icon: HeartHandshake, title: 'Personal Assistance', desc: 'Get assigned a personal assistant for complex cases requiring human intervention.', grad: 'linear-gradient(135deg, #ec4899, #fb7185)', tag: 'Human Support', tagColor: '#ec4899', shadowColor: 'rgba(236,72,153,0.2)' },
    ];

    return (
        <section id="features" style={{ padding: '100px 24px', background: 'linear-gradient(160deg, #EEF2FF 0%, #E0F2FE 55%, #ECFDF5 100%)', position: 'relative', overflow: 'hidden' }}>
            {/* Subtle grid pattern overlay */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} style={{ ...centered(), position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <motion.div variants={fadeUp} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(30,58,138,0.07)', border: '1px solid rgba(30,58,138,0.12)', borderRadius: '999px', padding: '6px 16px', marginBottom: '16px' }}>
                        <Sparkles size={13} color={C.primary} />
                        <span style={{ fontSize: '12px', fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Platform Features</span>
                    </motion.div>
                    <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(28px,4vw,38px)', fontWeight: 800, color: C.text, marginBottom: '14px', lineHeight: 1.18 }}>Everything You Need, <span style={{ background: 'linear-gradient(90deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>In One Place</span></motion.h2>
                    <motion.p variants={fadeUp} style={{ color: C.textLight, maxWidth: '520px', fontSize: '16px', lineHeight: 1.7 }}>A complete platform designed to make retirement paperwork stress-free, fast, and secure.</motion.p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                    {features.map((f, i) => (
                        <motion.div variants={scaleIn} whileHover={{ y: -6, boxShadow: `0 16px 40px ${f.shadowColor}`, borderColor: 'rgba(99,102,241,0.2)' }} key={i}
                            style={{ background: '#fff', borderRadius: '20px', padding: '30px 26px', border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'box-shadow 0.3s, border-color 0.3s', position: 'relative', overflow: 'hidden' }}>
                            {/* Top gradient bar */}
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: f.grad, borderRadius: '20px 20px 0 0' }} />
                            {/* Tag */}
                            <div style={{ position: 'absolute', top: '16px', right: '16px', background: `${f.tagColor}15`, border: `1px solid ${f.tagColor}30`, borderRadius: '999px', padding: '2px 10px', fontSize: '11px', fontWeight: 700, color: f.tagColor }}>{f.tag}</div>
                            {/* Icon with glowing ring */}
                            <div style={{ width: '54px', height: '54px', background: f.grad, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyItems: 'center', marginBottom: '18px', boxShadow: `0 8px 20px ${f.tagColor}40`, marginTop: '8px', paddingLeft: '14px', paddingTop: '15px' }}>
                                <f.icon size={24} color="#fff" />
                            </div>
                            <h3 style={{ fontWeight: 700, color: C.text, marginBottom: '8px', fontSize: '16px' }}>{f.title}</h3>
                            <p style={{ fontSize: '14px', color: C.textLight, lineHeight: 1.65, marginBottom: '16px' }}>{f.desc}</p>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600, color: f.tagColor }}>
                                Learn more <ChevronRight size={13} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
}

/* ════════════════════════════════════════════════════════
   SERVICES SECTION
   ════════════════════════════════════════════════════════ */
function ServicesSection() {
    const services = [
        { icon: Landmark, title: 'Pension Application', desc: 'Apply and track your pension application seamlessly with real-time status updates and smart form filling.', grad: 'linear-gradient(135deg, #2563eb, #7c3aed)', shadowColor: 'rgba(37,99,235,0.3)', bgTint: 'rgba(37,99,235,0.04)' },
        { icon: FileText, title: 'Life Certificate', desc: 'Submit Jeevan Pramaan digitally without visiting offices. Face verification powered by AI.', grad: 'linear-gradient(135deg, #10b981, #06b6d4)', shadowColor: 'rgba(16,185,129,0.3)', bgTint: 'rgba(16,185,129,0.04)' },
        { icon: Building2, title: 'Income Tax Filing', desc: 'Simplified ITR filing with AI-powered tax assistance, auto-computation, and e-filing support.', grad: 'linear-gradient(135deg, #f59e0b, #ef4444)', shadowColor: 'rgba(245,158,11,0.3)', bgTint: 'rgba(245,158,11,0.04)' },
        { icon: Shield, title: 'Insurance Claims', desc: 'File and track medical and life insurance claims easily with document auto-fill and status alerts.', grad: 'linear-gradient(135deg, #ec4899, #8b5cf6)', shadowColor: 'rgba(236,72,153,0.3)', bgTint: 'rgba(236,72,153,0.04)' },
    ];

    return (
        <section id="services" style={{ padding: '100px 24px', background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 30%, #e0f2fe 60%, #f0fdf4 100%)', position: 'relative', overflow: 'hidden' }}>
            {/* Decorative blobs */}
            <div style={{ position: 'absolute', top: '-60px', right: '-80px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-80px', left: '-60px', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} style={{ ...centered(), position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <motion.p variants={fadeUp} style={{ fontSize: '13px', fontWeight: 700, color: C.accent, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ width: '20px', height: '2px', background: C.accent, display: 'inline-block' }} /> Our Core Services <span style={{ width: '20px', height: '2px', background: C.accent, display: 'inline-block' }} />
                    </motion.p>
                    <motion.h2 variants={fadeUp} style={{ fontSize: '36px', fontWeight: 800, color: C.text, marginBottom: '16px', lineHeight: 1.2 }}>
                        Everything to Navigate Retirement<br /><span style={{ background: 'linear-gradient(90deg, #2563eb, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>with Confidence</span>
                    </motion.h2>
                    <motion.div variants={fadeUp} style={{ width: '60px', height: '4px', background: 'linear-gradient(90deg, #2563eb, #10b981)', borderRadius: '999px', marginBottom: '16px' }} />
                    <motion.p variants={fadeUp} style={{ color: C.textLight, maxWidth: '560px', fontSize: '16px', lineHeight: 1.7 }}>End-to-end digital solutions for all your post-retirement needs — no queues, no paperwork, no hassle.</motion.p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                    {services.map((s, i) => (
                        <motion.div variants={scaleIn} whileHover={{ y: -8, boxShadow: `0 20px 40px ${s.shadowColor}`, borderColor: 'rgba(0,0,0,0.12)' }} key={i}
                            style={{ background: '#fff', borderRadius: '20px', padding: '36px 24px', border: '1px solid rgba(0,0,0,0.06)', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'box-shadow 0.3s, border-color 0.3s', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                            {/* Step number */}
                            <div style={{ position: 'absolute', top: '14px', right: '16px', fontSize: '52px', fontWeight: 900, color: s.bgTint, lineHeight: 1, pointerEvents: 'none' }}>0{i + 1}</div>
                            {/* Top gradient accent bar */}
                            <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '3px', background: s.grad, borderRadius: '0 0 4px 4px', opacity: 0.6 }} />
                            {/* Icon */}
                            <div style={{ width: '64px', height: '64px', background: s.grad, borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: `0 8px 24px ${s.shadowColor}` }}>
                                <s.icon size={28} color="#fff" />
                            </div>
                            <h3 style={{ fontWeight: 700, color: C.text, marginBottom: '10px', fontSize: '17px' }}>{s.title}</h3>
                            <p style={{ fontSize: '14px', color: C.textLight, lineHeight: 1.7 }}>{s.desc}</p>
                            {/* Learn more link */}
                            <div style={{ marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600, color: C.primaryLight }}>
                                Learn More <ChevronRight size={14} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
}

/* ════════════════════════════════════════════════════════
   WHY US SECTION
   ════════════════════════════════════════════════════════ */
function WhyUs() {
    const reasons = [
        { num: '01', icon: CheckCircle, title: 'Government Verified', desc: 'All services are fully compliant with government regulations, verified processes, and official guidelines for pension management.', grad: 'linear-gradient(135deg, #10b981, #06b6d4)', shadowColor: 'rgba(16,185,129,0.35)', accentColor: '#10b981' },
        { num: '02', icon: Lock, title: 'Bank-Grade Security', desc: 'Your documents and personal data are protected with military-grade 256-bit AES encryption and secure cloud storage.', grad: 'linear-gradient(135deg, #3b82f6, #6366f1)', shadowColor: 'rgba(59,130,246,0.35)', accentColor: '#3b82f6' },
        { num: '03', icon: Zap, title: 'AI-Powered Accuracy', desc: 'Our advanced AI reduces errors in form filling and document processing by 95%, saving you hours of tedious manual work.', grad: 'linear-gradient(135deg, #f59e0b, #ef4444)', shadowColor: 'rgba(245,158,11,0.35)', accentColor: '#f59e0b' },
        { num: '04', icon: HeartHandshake, title: 'Senior-Friendly Design', desc: 'Large fonts, intuitive navigation, voice assistance, and accessibility-first design built for comfort at every age.', grad: 'linear-gradient(135deg, #ec4899, #8b5cf6)', shadowColor: 'rgba(236,72,153,0.35)', accentColor: '#ec4899' },
    ];

    return (
        <section id="whyus" style={{ padding: '100px 24px', background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)', position: 'relative', overflow: 'hidden' }}>
            {/* Decorative glowing blobs */}
            <div style={{ position: 'absolute', top: '-100px', right: '-50px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-120px', left: '-80px', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />

            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} style={{ ...centered(), position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <motion.p variants={fadeUp} style={{ fontSize: '13px', fontWeight: 700, color: '#60a5fa', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ width: '20px', height: '2px', background: '#60a5fa', display: 'inline-block' }} /> Why RetireAssist <span style={{ width: '20px', height: '2px', background: '#60a5fa', display: 'inline-block' }} />
                    </motion.p>
                    <motion.h2 variants={fadeUp} style={{ fontSize: '36px', fontWeight: 800, color: '#fff', marginBottom: '16px', lineHeight: 1.2 }}>
                        Built for <span style={{ background: 'linear-gradient(90deg, #60a5fa, #a78bfa, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Trust</span>, Designed for <span style={{ background: 'linear-gradient(90deg, #34d399, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Simplicity</span>
                    </motion.h2>
                    <motion.div variants={fadeUp} style={{ width: '60px', height: '4px', background: 'linear-gradient(90deg, #60a5fa, #a78bfa)', borderRadius: '999px', marginBottom: '16px' }} />
                    <motion.p variants={fadeUp} style={{ color: 'rgba(148,163,184,0.9)', maxWidth: '560px', fontSize: '16px', lineHeight: 1.7 }}>Trusted by 10,000+ retirees across India. Here's why they chose us.</motion.p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                    {reasons.map((r, i) => (
                        <motion.div variants={scaleIn} whileHover={{ y: -6, boxShadow: `0 20px 40px ${r.shadowColor}`, borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)' }} key={i}
                            style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', borderRadius: '20px', padding: '32px 28px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'flex-start', gap: '20px', transition: 'box-shadow 0.3s, border-color 0.3s, background 0.3s', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                            {/* Left accent border */}
                            <div style={{ position: 'absolute', left: 0, top: '15%', bottom: '15%', width: '3px', background: r.grad, borderRadius: '0 4px 4px 0' }} />
                            {/* Large faded background number */}
                            <div style={{ position: 'absolute', right: '20px', bottom: '10px', fontSize: '80px', fontWeight: 900, color: 'rgba(255,255,255,0.02)', lineHeight: 1, pointerEvents: 'none' }}>{r.num}</div>
                            {/* Icon */}
                            <div style={{ width: '56px', height: '56px', background: r.grad, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 8px 20px ${r.shadowColor}` }}>
                                <r.icon size={26} color="#fff" />
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: r.accentColor, background: `${r.accentColor}15`, padding: '2px 10px', borderRadius: '6px' }}>Step {r.num}</span>
                                </div>
                                <h3 style={{ fontWeight: 700, color: '#fff', marginBottom: '8px', fontSize: '18px' }}>{r.title}</h3>
                                <p style={{ fontSize: '14px', color: 'rgba(148,163,184,0.9)', lineHeight: 1.7 }}>{r.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
}

/* ════════════════════════════════════════════════════════
   CTA SECTION
   ════════════════════════════════════════════════════════ */
function CTA() {
    const trustItems = [
        { icon: Shield, text: 'Bank-Grade Encryption' },
        { icon: CheckCircle, text: 'Govt. Verified' },
        { icon: Lock, text: 'No Hidden Fees' },
    ];
    return (
        <section style={{ padding: '100px 24px', background: 'linear-gradient(180deg,#f8fafc 0%,#eef2ff 100%)' }}>
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} style={{ maxWidth: '980px', margin: '0 auto', background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 60%, #06b6d4 100%)', borderRadius: '28px', padding: '72px 56px', textAlign: 'center', position: 'relative', overflow: 'hidden', boxShadow: '0 32px 80px rgba(30,58,138,0.28)' }}>
                {/* Dot mesh pattern */}
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none', borderRadius: '28px' }} />
                {/* Glowing orbs */}
                <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '320px', height: '320px', background: 'rgba(255,255,255,0.07)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-80px', left: '-40px', width: '260px', height: '260px', background: 'rgba(16,185,129,0.12)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
                {/* Floating icons */}
                <motion.div animate={floatAnimation} style={{ position: 'absolute', top: '24px', left: '40px', opacity: 0.18, pointerEvents: 'none' }}><Sparkles size={44} color="#fff" /></motion.div>
                <motion.div animate={floatAnimationSlow} style={{ position: 'absolute', bottom: '24px', right: '48px', opacity: 0.18, pointerEvents: 'none' }}><Shield size={40} color="#fff" /></motion.div>
                <motion.div animate={floatAnimation} style={{ position: 'absolute', top: '50%', left: '24px', opacity: 0.1, pointerEvents: 'none' }}><Bot size={32} color="#fff" /></motion.div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Trust pill */}
                    <motion.div variants={fadeUp} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '999px', padding: '6px 18px', marginBottom: '24px' }}>
                        <CheckCircle size={13} color="#34d399" />
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.06em' }}>TRUSTED BY 10,000+ RETIREES ACROSS INDIA</span>
                    </motion.div>
                    <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 800, color: '#fff', marginBottom: '16px', lineHeight: 1.15, letterSpacing: '-0.01em' }}>Start Your <span style={{ color: '#67e8f9' }}>Stress-Free</span><br />Retirement Journey Today</motion.h2>
                    <motion.p variants={fadeUp} style={{ fontSize: '17px', color: 'rgba(255,255,255,0.78)', maxWidth: '520px', margin: '0 auto 36px', lineHeight: 1.65 }}>Let us handle the paperwork, so you can focus on the moments that truly matter.</motion.p>
                    <motion.div variants={fadeUp} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '36px' }}>
                        <motion.div whileHover={hoverLift} whileTap={tapAnim}>
                            <Link to="/signup"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '15px 36px', borderRadius: '14px', fontSize: '16px', fontWeight: 700, background: '#fff', color: C.primary, textDecoration: 'none', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.18)' }}
                                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.25)'; }}
                                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.18)'; }}>
                                Make an Enquiry <ArrowRight size={17} />
                            </Link>
                        </motion.div>
                        <motion.div whileHover={hoverLift} whileTap={tapAnim}>
                            <a href="tel:1800111960"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '15px 36px', borderRadius: '14px', fontSize: '16px', fontWeight: 700, border: '2px solid rgba(255,255,255,0.4)', color: '#fff', textDecoration: 'none', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', transition: 'background 0.2s ease' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}>
                                <Phone size={17} /> Call 1800-11-1960
                            </a>
                        </motion.div>
                    </motion.div>
                    {/* Trust indicators row */}
                    <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
                        {trustItems.map((t, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
                                <t.icon size={14} color="#34d399" /> {t.text}
                            </div>
                        ))}
                    </motion.div>
                </div>
            </motion.div>
        </section>
    );
}

/* ════════════════════════════════════════════════════════
   FOOTER
   ════════════════════════════════════════════════════════ */
function Footer() {
    const linkStyle = { color: '#9ca3af', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s', display: 'block', marginBottom: '8px' };
    return (
        <footer style={{ background: '#0F172A', color: '#fff', padding: '80px 24px 40px' }}>
            <div style={{ ...centered(), display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '48px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <div style={{ width: '36px', height: '36px', background: `linear-gradient(135deg, ${C.primaryLight}, ${C.accent})`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Shield size={18} color="#fff" />
                        </div>
                        <span style={{ fontSize: '17px', fontWeight: 700 }}>RetireAssist</span>
                    </div>
                    <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.7 }}>Your trusted digital companion for managing pension, insurance, and government paperwork with ease and security.</p>
                </div>
                <div>
                    <h4 style={{ fontWeight: 700, marginBottom: '16px', fontSize: '15px' }}>Services</h4>
                    <a href="#" style={linkStyle}>Pension Application</a>
                    <a href="#" style={linkStyle}>Life Certificate</a>
                    <a href="#" style={linkStyle}>Income Tax Filing</a>
                    <a href="#" style={linkStyle}>Insurance Claims</a>
                </div>
                <div>
                    <h4 style={{ fontWeight: 700, marginBottom: '16px', fontSize: '15px' }}>Platform</h4>
                    <a href="#" style={linkStyle}>AI Assistant</a>
                    <a href="#" style={linkStyle}>Document Vault</a>
                    <a href="#" style={linkStyle}>Smart Reminders</a>
                    <a href="#" style={linkStyle}>Service Tracking</a>
                </div>
                <div>
                    <h4 style={{ fontWeight: 700, marginBottom: '16px', fontSize: '15px' }}>Contact</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', fontSize: '14px', marginBottom: '10px' }}><Phone size={14} /> 1800-11-1960</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', fontSize: '14px', marginBottom: '10px' }}><Mail size={14} /> help@retireassist.in</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', fontSize: '14px', marginBottom: '10px' }}><MapPin size={14} /> New Delhi, India</div>
                </div>
            </div>
            <div style={{ ...centered(), marginTop: '48px', paddingTop: '32px', borderTop: '1px solid #1e293b', textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
                © 2026 RetireAssist. All rights reserved. | Made for Smart India Hackathon
            </div>
        </footer>
    );
}

/* ════════════════════════════════════════════════════════
   MAIN EXPORT
   ════════════════════════════════════════════════════════ */
export default function LandingPage() {
    return (
        <div style={{ minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif" }}>
            <Navbar />
            <Hero />
            <StatsStrip />
            <Problems />
            <Features />
            <ServicesSection />
            <WhyUs />
            <CTA />
            <Footer />
        </div>
    );
}
