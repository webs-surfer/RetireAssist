import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, ClipboardList, CheckSquare,
    MessageCircle, DollarSign, User, LogOut,
    Shield, X, ChevronRight, Wrench
} from 'lucide-react';

const navItems = [
    { to: '/helper/dashboard',  icon: LayoutDashboard, label: 'Dashboard',       color: '#60A5FA' },
    { to: '/helper/requests',   icon: ClipboardList,   label: 'Browse Requests', color: '#34D399' },
    { to: '/helper/tasks',      icon: CheckSquare,     label: 'My Tasks',        color: '#A78BFA' },
    { to: '/helper/chat',       icon: MessageCircle,   label: 'Chat',            color: '#38BDF8' },
    { to: '/helper/earnings',   icon: DollarSign,      label: 'Earnings',        color: '#FBBF24' },
    { to: '/helper/profile',    icon: User,            label: 'Profile & KYC',   color: '#FB923C' },
];

const S = {
    sidebar: {
        position: 'fixed', left: 0, top: 0, bottom: 0, width: '16rem',
        background: 'linear-gradient(180deg, #0D1B2E 0%, #0A1525 50%, #071020 100%)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', flexDirection: 'column',
        zIndex: 40, fontFamily: "'Inter', system-ui, sans-serif",
        boxShadow: '4px 0 24px rgba(0,0,0,0.25)',
    },
    header: {
        padding: '20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
    },
    logoWrap: { display: 'flex', alignItems: 'center', gap: '12px' },
    logoIcon: {
        width: 40, height: 40,
        background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
        borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 14px rgba(99,102,241,0.4)', flexShrink: 0,
    },
    logoTitle: { fontSize: 16, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2, letterSpacing: '-0.01em' },
    logoSub: { fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' },
    closeBtn: {
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 8, width: 32, height: 32, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'rgba(255,255,255,0.4)', transition: 'all 0.2s',
    },
    nav: {
        flex: 1, padding: '12px', overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: 2,
    },
    sectionLabel: {
        fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)',
        textTransform: 'uppercase', letterSpacing: '0.12em', padding: '12px 12px 6px',
    },
    footer: {
        padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0,
    },
    userRow: {
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px', borderRadius: 12,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.06)',
        marginBottom: 8,
    },
    userName: { fontSize: 13, fontWeight: 700, color: '#FFFFFF', margin: 0 },
    userEmail: { fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: 0 },
    logoutBtn: {
        width: '100%', display: 'flex', alignItems: 'center', gap: 8,
        padding: '9px 12px', borderRadius: 10,
        background: 'transparent', border: 'none', cursor: 'pointer',
        fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.4)',
        transition: 'all 0.2s', fontFamily: 'inherit',
    },
};

function KYCBadge({ user }) {
    if (!user?.onboardingStatus) return null;
    const cfg = user.isVerified
        ? { bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)', color: '#34D399', label: '✅ Verified Helper' }
        : user.onboardingStatus === 'pending'
        ? { bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)', color: '#FBBF24', label: '⏳ KYC Under Review' }
        : user.onboardingStatus === 'rejected'
        ? { bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)', color: '#F87171', label: '❌ KYC Rejected' }
        : { bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)', color: '#FBBF24', label: '⚠️ KYC Incomplete' };

    return (
        <div style={{
            margin: '0 12px 4px', padding: '8px 12px', borderRadius: 10,
            background: cfg.bg, border: `1px solid ${cfg.border}`,
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 11, fontWeight: 700, color: cfg.color,
        }}>
            <Shield size={11} />
            {cfg.label}
        </div>
    );
}

function NavItem({ item, onClick }) {
    const location = useLocation();
    const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');

    return (
        <NavLink to={item.to} onClick={onClick} style={{ textDecoration: 'none' }}>
            <div
                style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px', borderRadius: 12,
                    background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                    border: isActive ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
                    transition: 'all 0.2s', cursor: 'pointer', position: 'relative',
                }}
                onMouseEnter={e => {
                    if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    }
                }}
                onMouseLeave={e => {
                    if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = 'transparent';
                    }
                }}
            >
                {isActive && (
                    <div style={{
                        position: 'absolute', left: 0, top: '20%', bottom: '20%',
                        width: 3, borderRadius: '0 3px 3px 0',
                        background: item.color, boxShadow: `0 0 8px ${item.color}`,
                    }} />
                )}
                <div style={{
                    width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                    background: isActive ? `${item.color}22` : 'rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                }}>
                    <item.icon size={17} color={isActive ? item.color : 'rgba(255,255,255,0.45)'} />
                </div>
                <span style={{
                    fontSize: 13, fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
                    flex: 1, transition: 'color 0.2s',
                }}>
                    {item.label}
                </span>
                {isActive && <ChevronRight size={14} color={item.color} style={{ opacity: 0.7 }} />}
            </div>
        </NavLink>
    );
}

export default function HelperSidebar({ open, onClose }) {
    const { user, logout } = useAuth();
    const handleClose = () => { if (window.innerWidth < 1024) onClose(); };

    return (
        <>
            {open && (
                <div onClick={onClose} className="lg:hidden" style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(3px)', zIndex: 30,
                }} />
            )}

            <aside style={{
                ...S.sidebar,
                transform: open ? 'translateX(0)' : 'translateX(-100%)',
                transition: 'transform 0.22s cubic-bezier(0.4,0,0.2,1)',
            }}>
                {/* Header */}
                <div style={S.header}>
                    <div style={S.logoWrap}>
                        <div style={S.logoIcon}>
                            <Wrench size={20} color="#fff" />
                        </div>
                        <div>
                            <p style={S.logoTitle}>RetireAssist</p>
                            <p style={S.logoSub}>Helper Portal</p>
                        </div>
                    </div>
                    <button style={S.closeBtn} onClick={onClose}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}>
                        <X size={16} />
                    </button>
                </div>

                {/* KYC Badge */}
                <KYCBadge user={user} />

                {/* Nav */}
                <nav style={S.nav}>
                    <p style={S.sectionLabel}>Navigation</p>
                    {navItems.map(item => (
                        <NavItem key={item.to} item={item} onClick={handleClose} />
                    ))}
                </nav>

                {/* Footer */}
                <div style={S.footer}>
                    <div style={S.userRow}>
                        {user?.profilePhoto ? (
                            <img src={user.profilePhoto} alt={user.name}
                                style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid rgba(255,255,255,0.1)' }} />
                        ) : (
                            <div style={{
                                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                                background: 'linear-gradient(135deg,#3B82F6,#6366F1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <User size={16} color="#fff" />
                            </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={S.userName}>{user?.name || 'Helper'}</p>
                            <p style={S.userEmail}>{user?.email}</p>
                        </div>
                    </div>
                    <button style={S.logoutBtn} onClick={logout}
                        onMouseEnter={e => { e.currentTarget.style.color = '#F87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'transparent'; }}>
                        <LogOut size={15} /> Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
}
