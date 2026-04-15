import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X } from 'lucide-react';

export default function RatingModal({ onSubmit, onClose, serviceName }) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) return;
        setLoading(true);
        try {
            await onSubmit(rating, comment);
            onClose();
        } catch(e) {
            alert('Failed to submit rating. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-text-dark text-lg">Rate Your Helper</h2>
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer border-none bg-transparent">
                            <X size={16} />
                        </button>
                    </div>

                    {serviceName && <p className="text-sm text-text-muted mb-4">Service: <span className="font-medium text-text-dark">{serviceName}</span></p>}

                    <div className="flex justify-center gap-2 mb-4">
                        {[1, 2, 3, 4, 5].map(n => (
                            <button
                                key={n}
                                onClick={() => setRating(n)}
                                onMouseEnter={() => setHover(n)}
                                onMouseLeave={() => setHover(0)}
                                className="text-4xl cursor-pointer bg-transparent border-none transition-transform hover:scale-110"
                            >
                                <Star
                                    size={36}
                                    className={n <= (hover || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}
                                />
                            </button>
                        ))}
                    </div>

                    <p className="text-center text-sm font-medium text-text-dark mb-4">
                        {rating === 0 ? 'Tap a star to rate' : ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][rating]}
                    </p>

                    <textarea
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        placeholder="Share your experience (optional)..."
                        rows={3}
                        className="w-full p-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none mb-4"
                    />

                    <div className="flex gap-3">
                        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-gray-50 cursor-pointer bg-white text-text-dark">
                            Skip
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={rating === 0 || loading}
                            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-bold cursor-pointer disabled:opacity-50 hover:opacity-90 transition-opacity"
                        >
                            {loading ? 'Submitting...' : `Submit ${rating > 0 ? `${rating}★` : ''}`}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
