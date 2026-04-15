import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, Menu, Shield, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { useState } from 'react';

export default function Navbar({ sidebarOpen, onToggleSidebar }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showProfile, setShowProfile] = useState(false);

    const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
    const roleLabel = user?.role === 'helper' ? '🤝 Helper' : user?.role === 'admin' ? '⚙️ Admin' : '👤 User';
    const profilePath = user?.role === 'helper' ? '/helper/profile' : '/user/profile';

    return (
        <nav
            className="fixed top-0 right-0 z-30 bg-white/80 backdrop-blur-md border-b border-border h-16 transition-all duration-200"
            style={{ left: sidebarOpen ? '16rem' : '0' }}
        >
            <div className="flex items-center justify-between h-full px-4 lg:px-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onToggleSidebar}
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-text-light hover:bg-bg transition-all cursor-pointer border-none bg-transparent"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="hidden sm:flex items-center gap-2 bg-bg rounded-lg px-3 py-2 w-64">
                        <Search size={16} className="text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search services, documents..."
                            className="bg-transparent border-none outline-none text-sm w-full text-text placeholder:text-text-muted"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="trust-badge hidden md:inline-flex"><Shield size={12} /> Secure Platform</span>

                    <button
                        onClick={() => navigate('/notifications')}
                        className="relative w-10 h-10 rounded-lg flex items-center justify-center text-text-light hover:bg-bg transition-all cursor-pointer border-none bg-transparent"
                    >
                        <Bell size={18} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full" />
                    </button>

                    {/* ── Avatar + Dropdown ── */}
                    <div className="relative">
                        <button
                            onClick={() => setShowProfile(!showProfile)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '6px 10px', borderRadius: 12, border: 'none',
                                background: showProfile ? 'rgba(99,102,241,0.08)' : 'transparent',
                                cursor: 'pointer', transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { if (!showProfile) e.currentTarget.style.background = 'rgba(99,102,241,0.07)'; }}
                            onMouseLeave={e => { if (!showProfile) e.currentTarget.style.background = 'transparent'; }}
                        >
                            {user?.profilePhoto ? (
                                <img src={user.profilePhoto} alt={user.name}
                                    style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(99,102,241,0.3)' }} />
                            ) : (
                                <div style={{
                                    width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                                    background: 'linear-gradient(135deg,#4F46E5,#7C3AED)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 13, fontWeight: 800, color: '#fff',
                                    border: '2px solid rgba(99,102,241,0.25)',
                                    boxShadow: '0 2px 8px rgba(99,102,241,0.25)',
                                }}>{initials}</div>
                            )}
                            <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', fontFamily: 'inherit' }} className="hidden md:block">
                                {user?.name?.split(' ')[0]}
                            </span>
                            <ChevronDown size={14} color="#64748B"
                                style={{ transform: showProfile ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
                                className="hidden md:block" />
                        </button>

                        {showProfile && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
                                <div style={{
                                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                                    width: 244, zIndex: 50,
                                    background: '#fff', borderRadius: 20,
                                    boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(226,232,240,0.8)',
                                    overflow: 'hidden',
                                    animation: 'dropdown-in 0.18s cubic-bezier(0.16,1,0.3,1)',
                                    fontFamily: "'Inter', system-ui, sans-serif",
                                }}>
                                    {/* Gradient header */}
                                    <div style={{
                                        background: 'linear-gradient(135deg,#1E3A8A 0%,#4F46E5 55%,#7C3AED 100%)',
                                        padding: '18px 16px 20px', position: 'relative', overflow: 'hidden',
                                    }}>
                                        <div style={{ position: 'absolute', top: -25, right: -25, width: 90, height: 90, background: 'rgba(255,255,255,0.07)', borderRadius: '50%', pointerEvents: 'none' }} />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
                                            {user?.profilePhoto ? (
                                                <img src={user.profilePhoto} alt={user.name}
                                                    style={{ width: 46, height: 46, borderRadius: 15, objectFit: 'cover', border: '2px solid rgba(255,255,255,0.4)', flexShrink: 0 }} />
                                            ) : (
                                                <div style={{
                                                    width: 46, height: 46, borderRadius: 15, flexShrink: 0,
                                                    background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                                                    border: '2px solid rgba(255,255,255,0.3)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 19, fontWeight: 800, color: '#fff',
                                                }}>{initials}</div>
                                            )}
                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                <p style={{ fontSize: 14, fontWeight: 800, color: '#fff', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {user?.name}
                                                </p>
                                                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', margin: '0 0 7px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {user?.email}
                                                </p>
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center',
                                                    background: 'rgba(255,255,255,0.18)',
                                                    border: '1px solid rgba(255,255,255,0.25)',
                                                    borderRadius: 999, padding: '2px 9px',
                                                    fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: '0.01em',
                                                }}>
                                                    {roleLabel}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Menu items */}
                                    <div style={{ padding: '8px' }}>
                                        {[
                                            { label: 'Profile', icon: User, color: '#4F46E5', bg: '#EEF2FF', path: profilePath },
                                            { label: 'Settings', icon: Settings, color: '#0284C7', bg: '#E0F2FE', path: '/notifications' },
                                        ].map(item => (
                                            <button key={item.label}
                                                onClick={() => { navigate(item.path); setShowProfile(false); }}
                                                style={{
                                                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                                                    padding: '9px 12px', borderRadius: 12, border: 'none',
                                                    background: 'transparent', cursor: 'pointer',
                                                    fontSize: 13, fontWeight: 600, color: '#0F172A',
                                                    fontFamily: 'inherit', transition: 'background 0.15s', textAlign: 'left',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <div style={{
                                                    width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                                                    background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    <item.icon size={15} color={item.color} />
                                                </div>
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div style={{ height: 1, background: 'rgba(226,232,240,0.8)', margin: '0 8px' }} />

                                    {/* Sign Out */}
                                    <div style={{ padding: '8px' }}>
                                        <button
                                            onClick={() => { logout(); navigate('/login'); }}
                                            style={{
                                                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                                                padding: '9px 12px', borderRadius: 12, border: 'none',
                                                background: 'transparent', cursor: 'pointer',
                                                fontSize: 13, fontWeight: 700, color: '#EF4444',
                                                fontFamily: 'inherit', transition: 'background 0.15s', textAlign: 'left',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <div style={{
                                                width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                                                background: 'rgba(239,68,68,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                <LogOut size={15} color="#EF4444" />
                                            </div>
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes dropdown-in {
                    from { opacity: 0; transform: translateY(-8px) scale(0.96); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </nav>
    );
}
