import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Search, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const LIMIT = 10;

    const fetchUsers = (p = page) => {
        setLoading(true);
        const params = new URLSearchParams({ page: p, limit: LIMIT });
        if (search) params.append('search', search);
        if (roleFilter) params.append('role', roleFilter);
        api.get(`/admin/users?${params}`).then(r => {
            setUsers(r.data.users || r.data || []);
            setTotal(r.data.total || 0);
            setPages(r.data.pages || 1);
        }).catch(() => {}).finally(() => setLoading(false));
    };

    useEffect(() => { fetchUsers(1); setPage(1); }, [search, roleFilter]);
    useEffect(() => { fetchUsers(page); }, [page]);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete user ${name}?`)) return;
        await api.delete(`/admin/users/${id}`).catch(() => {});
        fetchUsers();
    };

    return (
        <div className="p-6 max-w-6xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-text-dark">Users</h1>
                    <p className="text-sm text-text-muted">{total} total users</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email..." className="pl-9 pr-4 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 w-52" />
                    </div>
                    <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="px-3 py-2 rounded-xl border border-border text-sm focus:outline-none bg-white">
                        <option value="">All Roles</option>
                        <option value="user">Users</option>
                        <option value="helper">Helpers</option>
                        <option value="admin">Admins</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-gray-50/50">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted">Email</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted">Role</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted">Pensioner</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted">Aadhaar</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted">PAN</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted">Pension ID</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted">City</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted">Joined</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={10} className="py-8 text-center text-text-muted text-sm">Loading...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={10} className="py-8 text-center text-text-muted text-sm">No users found</td></tr>
                            ) : users.map(u => (
                                <tr key={u._id} className="border-b border-border/50 hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-text-dark">{u.name}</td>
                                    <td className="px-4 py-3 text-text-muted">{u.email}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${u.role === 'admin' ? 'bg-red-100 text-red-700' : u.role === 'helper' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{u.role}</span>
                                    </td>
                                    <td className="px-4 py-3 text-xs">{u.isPensioner ? '🏅 Yes' : '—'}</td>
                                    {/* Encrypted PII — never display ciphertext */}
                                    <td><span className="encrypted-badge">🔒 Protected</span></td>
                                    <td><span className="encrypted-badge">🔒 Protected</span></td>
                                    <td><span className="encrypted-badge">🔒 Protected</span></td>
                                    <td className="px-4 py-3 text-xs text-text-muted">{u.city || '—'}</td>
                                    <td className="px-4 py-3 text-xs text-text-muted">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => handleDelete(u._id, u.name)} className="w-7 h-7 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer bg-transparent border-none"><Trash2 size={13} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                        <p className="text-xs text-text-muted">Page {page} of {pages} · {total} users</p>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-text-dark hover:bg-gray-100 disabled:opacity-40 cursor-pointer bg-white"><ChevronLeft size={14} /></button>
                            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-text-dark hover:bg-gray-100 disabled:opacity-40 cursor-pointer bg-white"><ChevronRight size={14} /></button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
