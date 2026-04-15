import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, Camera } from 'lucide-react';
import PhotoCapture from '../components/PhotoCapture';

export default function CompleteSignup() {
    const { user, API, getRoleHome, updateProfile } = useAuth();
    const navigate = useNavigate();
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!capturedPhoto) return;
        setLoading(true); setError('');
        try {
            await updateProfile({ profilePhoto: capturedPhoto });
            navigate(getRoleHome(user?.role || 'user'));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save photo. Please try again.');
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Camera size={24} className="text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-text-dark">One Last Step</h1>
                    <p className="text-sm text-text-muted">Take your photo to complete signup</p>
                </div>

                <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-text-dark mb-1">Take Your Photo</h3>
                        <p className="text-xs text-text-muted">This helps verified helpers identify you during appointments</p>
                    </div>

                    <PhotoCapture onCapture={setCapturedPhoto} capturedPhoto={capturedPhoto} />

                    {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg text-center">{error}</p>}

                    <button
                        onClick={handleSubmit}
                        disabled={!capturedPhoto || loading}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold cursor-pointer hover:opacity-90 disabled:opacity-50 border-none"
                    >
                        {loading ? 'Saving...' : 'Complete Setup 🚀'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
