import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { Send, Bot, User, Zap, Loader2, Sparkles, Brain, Shield, TrendingUp } from 'lucide-react';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const CHIPS = [
    { label: 'File ITR', query: 'How do I file ITR?', icon: '📊' },
    { label: 'Form 15H', query: 'What is Form 15H?', icon: '📋' },
    { label: 'Aadhaar Update', query: 'Update my Aadhaar', icon: '🆔' },
    { label: 'PM VVVY', query: 'PM VVVY scheme', icon: '🏛️' },
    { label: 'Senior Savings', query: 'Senior Savings Account', icon: '💰' },
    { label: 'EPFO Help', query: 'EPFO pension claim', icon: '📁' },
];

const FEATURES = [
    { icon: Brain,    label: 'Pension Expert',     color: '#8B5CF6' },
    { icon: TrendingUp, label: 'Tax Planning',     color: '#3B82F6' },
    { icon: Shield,   label: 'Aadhaar & KYC',      color: '#10B981' },
];

/* ── Message Bubble ──────────────────────────────────────────── */
function MessageBubble({ msg, isLatest }) {
    const isUser = msg.role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
                display: 'flex', gap: 10, alignItems: 'flex-end',
                flexDirection: isUser ? 'row-reverse' : 'row',
            }}
        >
            {/* Avatar */}
            <div style={{
                width: 34, height: 34, borderRadius: 12, flexShrink: 0,
                background: isUser
                    ? 'linear-gradient(135deg,#1E3A8A,#3B82F6)'
                    : 'linear-gradient(135deg,#7C3AED,#6366F1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isUser
                    ? '0 4px 12px rgba(59,130,246,0.35)'
                    : '0 4px 12px rgba(99,102,241,0.35)',
                border: '2px solid rgba(255,255,255,0.15)',
            }}>
                {isUser ? <User size={15} color="#fff" /> : <Bot size={15} color="#fff" />}
            </div>

            {/* Bubble */}
            <div style={{
                maxWidth: '72%',
                background: isUser
                    ? 'linear-gradient(135deg,#1E3A8A,#3B82F6)'
                    : 'rgba(255,255,255,0.9)',
                backdropFilter: isUser ? 'none' : 'blur(12px)',
                borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                padding: '13px 16px',
                boxShadow: isUser
                    ? '0 6px 20px rgba(59,130,246,0.25)'
                    : '0 4px 16px rgba(0,0,0,0.08)',
                border: isUser ? 'none' : '1px solid rgba(226,232,240,0.8)',
            }}>
                <p style={{
                    fontSize: 14, lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap',
                    color: isUser ? '#fff' : '#0F172A', fontWeight: 400,
                    fontFamily: "'Inter', system-ui, sans-serif",
                }}>
                    {msg.content}
                </p>
                <p style={{
                    fontSize: 10, margin: '6px 0 0',
                    color: isUser ? 'rgba(255,255,255,0.55)' : '#94A3B8',
                    textAlign: isUser ? 'right' : 'left', fontWeight: 500,
                }}>
                    {msg.timestamp?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        </motion.div>
    );
}

/* ── Typing Indicator ────────────────────────────────────────── */
function TypingIndicator() {
    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <div style={{
                width: 34, height: 34, borderRadius: 12, flexShrink: 0,
                background: 'linear-gradient(135deg,#7C3AED,#6366F1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
            }}>
                <Bot size={15} color="#fff" />
            </div>
            <div style={{
                background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)',
                borderRadius: '20px 20px 20px 4px',
                padding: '14px 18px', display: 'flex', gap: 5, alignItems: 'center',
                border: '1px solid rgba(226,232,240,0.8)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            }}>
                {[0, 1, 2].map(i => (
                    <div key={i} style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: 'linear-gradient(135deg,#8B5CF6,#6366F1)',
                        animation: `bounce-dot 1.2s ease-in-out infinite`,
                        animationDelay: `${i * 0.18}s`,
                    }} />
                ))}
            </div>
        </motion.div>
    );
}

/* ── Main Component ──────────────────────────────────────────── */
export default function AIChat() {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const initialService = searchParams.get('service');

    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: `Namaste ${user?.name?.split(' ')[0] || 'ji'} 🙏\n\nI'm your RetireAssist AI — here to help with pension, tax, government schemes, and retirement planning.${initialService ? `\n\nI see you're asking about **${initialService}**. How can I help?` : '\n\nAsk me anything!'}`,
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const sendMessage = async (text) => {
        const userText = (text || input).trim();
        if (!userText || loading) return;
        setInput('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';

        setMessages(p => [...p, { role: 'user', content: userText, timestamp: new Date() }]);
        setLoading(true);

        try {
            const { data } = await api.post('/chat', { message: userText });
            const reply = data?.message || "Sorry, I couldn't get a response. Please try again.";
            setMessages(p => [...p, { role: 'assistant', content: reply, timestamp: new Date() }]);
        } catch {
            setMessages(p => [...p, { role: 'assistant', content: "Sorry, I couldn't connect right now. Please try again in a moment.", timestamp: new Date() }]);
        } finally {
            setLoading(false);
        }
    };

    const handleTextareaInput = (e) => {
        setInput(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
    };

    const canSend = input.trim() && !loading;

    return (
        <div style={{
            display: 'flex', flexDirection: 'column',
            height: 'calc(100vh - 80px)', maxWidth: 820, margin: '0 auto',
            fontFamily: "'Inter', system-ui, sans-serif",
            background: 'linear-gradient(160deg,#F0F4FF 0%,#EEF2FF 40%,#F0FDF4 100%)',
            borderRadius: 24, overflow: 'hidden',
            boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
            border: '1px solid rgba(226,232,240,0.8)',
        }}>

            {/* ── Header ── */}
            <div style={{
                background: 'linear-gradient(135deg,#4F46E5 0%,#7C3AED 50%,#8B5CF6 100%)',
                padding: '18px 24px', flexShrink: 0, position: 'relative', overflow: 'hidden',
            }}>
                {/* Decorative blobs */}
                <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: -20, left: 60, width: 80, height: 80, background: 'rgba(139,92,246,0.2)', borderRadius: '50%' }} />

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
                    {/* Animated AI avatar */}
                    <div style={{
                        width: 48, height: 48, borderRadius: 16, flexShrink: 0,
                        background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)',
                        border: '2px solid rgba(255,255,255,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                        animation: 'avatar-glow 2.5s ease-in-out infinite',
                    }}>
                        <Sparkles size={22} color="#fff" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>
                            RetireAssist AI
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#34D399', boxShadow: '0 0 6px #34D399', animation: 'pulse-dot 1.5s ease-in-out infinite' }} />
                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>Online · Pension & Retirement Expert</span>
                        </div>
                    </div>

                    {/* Feature badges */}
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                        {FEATURES.map((f, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: 10, padding: '5px 10px',
                                fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.9)',
                            }}>
                                <f.icon size={11} />
                                <span className="hidden sm:inline">{f.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Messages Area ── */}
            <div style={{
                flex: 1, overflowY: 'auto', padding: '20px 24px',
                display: 'flex', flexDirection: 'column', gap: 16,
            }}>
                {messages.map((m, i) => (
                    <MessageBubble key={i} msg={m} isLatest={i === messages.length - 1} />
                ))}
                <AnimatePresence>{loading && <TypingIndicator />}</AnimatePresence>
                <div ref={bottomRef} />
            </div>

            {/* ── Suggestion Chips ── */}
            {messages.length <= 2 && !loading && (
                <div style={{
                    padding: '10px 24px 4px', flexShrink: 0,
                    background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)',
                    borderTop: '1px solid rgba(226,232,240,0.6)',
                }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Quick questions
                    </p>
                    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                        {CHIPS.map(c => (
                            <button key={c.label}
                                onClick={() => sendMessage(c.query)}
                                disabled={loading}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '7px 14px', borderRadius: 999, flexShrink: 0,
                                    background: 'rgba(255,255,255,0.9)',
                                    border: '1.5px solid rgba(99,102,241,0.2)',
                                    fontSize: 12, fontWeight: 600, color: '#4F46E5',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                    boxShadow: '0 2px 8px rgba(99,102,241,0.08)',
                                    fontFamily: 'inherit',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = '#EEF2FF';
                                    e.currentTarget.style.borderColor = 'rgba(99,102,241,0.45)';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.9)';
                                    e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <span style={{ fontSize: 14 }}>{c.icon}</span>
                                {c.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Input Bar ── */}
            <div style={{
                padding: '12px 20px 16px', flexShrink: 0,
                background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(16px)',
                borderTop: '1px solid rgba(226,232,240,0.7)',
            }}>
                <div style={{
                    display: 'flex', gap: 10, alignItems: 'flex-end',
                    background: '#fff', borderRadius: 18,
                    border: '2px solid rgba(99,102,241,0.2)',
                    padding: '10px 12px 10px 16px',
                    boxShadow: '0 4px 16px rgba(99,102,241,0.08)',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                    onFocusCapture={e => {
                        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.15)';
                    }}
                    onBlurCapture={e => {
                        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.08)';
                    }}
                >
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={handleTextareaInput}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                        placeholder="Ask about pension, ITR, Form 15H, EPFO..."
                        rows={1}
                        style={{
                            flex: 1, border: 'none', outline: 'none', resize: 'none',
                            fontSize: 14, lineHeight: 1.6, color: '#0F172A',
                            background: 'transparent', fontFamily: "'Inter', system-ui, sans-serif",
                            maxHeight: 120, overflowY: 'auto', fontWeight: 400,
                        }}
                    />
                    <button
                        onClick={() => sendMessage()}
                        disabled={!canSend}
                        style={{
                            width: 40, height: 40, borderRadius: 13, flexShrink: 0,
                            background: canSend
                                ? 'linear-gradient(135deg,#4F46E5,#7C3AED)'
                                : 'rgba(226,232,240,0.8)',
                            border: 'none', cursor: canSend ? 'pointer' : 'not-allowed',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: canSend ? '0 4px 14px rgba(99,102,241,0.4)' : 'none',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { if (canSend) e.currentTarget.style.transform = 'scale(1.08)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                        {loading
                            ? <Loader2 size={16} color={canSend ? '#fff' : '#94A3B8'} style={{ animation: 'spin 0.8s linear infinite' }} />
                            : <Send size={16} color={canSend ? '#fff' : '#94A3B8'} />
                        }
                    </button>
                </div>
                <p style={{ fontSize: 10.5, color: '#94A3B8', textAlign: 'center', margin: '8px 0 0', fontWeight: 500 }}>
                    Enter to send · Shift+Enter for new line · For medical emergencies call 112
                </p>
            </div>

            {/* Keyframes */}
            <style>{`
                @keyframes bounce-dot {
                    0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
                    40% { transform: translateY(-6px); opacity: 1; }
                }
                @keyframes avatar-glow {
                    0%, 100% { box-shadow: 0 6px 20px rgba(0,0,0,0.2), 0 0 0 0 rgba(255,255,255,0.15); }
                    50% { box-shadow: 0 6px 20px rgba(0,0,0,0.2), 0 0 0 6px rgba(255,255,255,0.07); }
                }
                @keyframes pulse-dot {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
