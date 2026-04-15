import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, UserCheck, ShieldCheck, ClipboardList, CreditCard, LogOut, Shield, X } from 'lucide-react';

const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/helpers', icon: UserCheck, label: 'Helpers' },
    { to: '/admin/verification', icon: ShieldCheck, label: 'KYC Verification' },
    { to: '/admin/tasks', icon: ClipboardList, label: 'Tasks Monitor' },
    { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
];

export default function AdminSidebar({ open, onClose }) {
    const { user, logout } = useAuth();

    return (
        <>
            {open && (
                <div className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-[2px]" onClick={onClose} />
            )}
            <aside className={`fixed left-0 top-0 bottom-0 w-64 z-40 transition-transform duration-200 ease-in-out flex flex-col ${open ? 'translate-x-0' : '-translate-x-full'}`}
                style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1f 100%)' }}>
                <div className="px-5 py-5 flex items-center justify-between border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                            <Shield size={18} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-white leading-tight">RetireAssist</h1>
                            <p className="text-[10px] text-purple-400 leading-tight">Admin Control Panel</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white cursor-pointer bg-transparent border-none transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                    {navItems.map(item => (
                        <NavLink key={item.to} to={item.to}
                            onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all no-underline ${isActive
                                    ? 'bg-purple-500/20 text-purple-400'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`
                            }>
                            <item.icon size={18} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            A
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{user?.name || 'Admin'}</p>
                            <p className="text-[11px] text-purple-400 truncate">Administrator</p>
                        </div>
                    </div>
                    <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all cursor-pointer border-none bg-transparent font-medium">
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
}
