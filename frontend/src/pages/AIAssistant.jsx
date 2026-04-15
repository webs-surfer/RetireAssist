import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Bot, Send, Sparkles, User, RefreshCcw } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const suggestions = [
    '🏛️ How do I apply for pension?',
    '📄 Documents required for ITR filing?',
    '🛡️ How to claim insurance?',
    '🪪 How to update Aadhaar details?',
    '📋 Steps for life certificate submission?',
    '🏦 How to change pension bank account?',
];

export default function AIAssistant() {
    const { API } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEnd = useRef(null);
    const scroll = () => messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(scroll, [messages]);

    const sendMessage = async (text) => {
        const msg = text || input.trim();
        if (!msg || loading) return;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: msg }]);
        setLoading(true);
        try {
            const res = await API.post('/chat', { message: msg });
            setMessages(prev => [...prev, { role: 'bot', content: res.data.reply || res.data.message || 'I can help with that. Let me find the right information for you.' }]);
        } catch {
            setMessages(prev => [...prev, { role: 'bot', content: 'I am having trouble connecting. Please try again or call 📞 1800-11-1960 for immediate assistance.' }]);
        } finally { setLoading(false); }
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }} className="flex flex-col h-[calc(100vh-7rem)]">
            <motion.div variants={fadeUp} className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-dark flex items-center gap-2"><Bot size={24} /> AI Assistant</h1>
                    <p className="text-sm text-text-light mt-0.5">Ask questions about pension, tax, insurance, and more</p>
                </div>
                <button onClick={() => setMessages([])} className="btn-ghost text-sm"><RefreshCcw size={14} /> Clear</button>
            </motion.div>

            {/* Chat Area */}
            <div className="flex-1 bg-bg rounded-xl border border-border overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center py-10">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Sparkles size={28} className="text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-text-dark mb-1">How can I help you today?</h3>
                            <p className="text-sm text-text-muted mb-6">Ask me anything about retirement services, pension processes, or document requirements.</p>
                            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                                {suggestions.map((q, i) => (
                                    <button key={i} onClick={() => sendMessage(q.replace(/^.{2}\s/, ''))} className="px-3 py-2 text-xs font-medium bg-white rounded-lg border border-border text-text-light hover:border-primary/30 hover:text-primary transition-all cursor-pointer">
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                            {msg.role === 'bot' && (
                                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                    <Bot size={14} className="text-white" />
                                </div>
                            )}
                            <div className={msg.role === 'user' ? 'chat-user' : 'chat-bot'}>
                                {msg.content.split('\n').map((line, j) => (
                                    <p key={j} className={j > 0 ? 'mt-1' : ''}>
                                        {line.split(/(\*\*[^*]+\*\*)/).map((part, k) =>
                                            part.startsWith('**') ? <strong key={k}>{part.slice(2, -2)}</strong> : part
                                        )}
                                    </p>
                                ))}
                            </div>
                            {msg.role === 'user' && (
                                <div className="w-8 h-8 bg-gradient-to-br from-accent to-teal-400 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                    <User size={14} className="text-white" />
                                </div>
                            )}
                        </div>
                    ))}

                    {loading && (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                                <Bot size={14} className="text-white" />
                            </div>
                            <div className="chat-bot flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-primary-light rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-primary-light rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-primary-light rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEnd} />
                </div>

                {/* Input */}
                <div className="p-3 bg-white border-t border-border">
                    <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-center gap-2">
                        <input type="text" className="input !rounded-lg" placeholder="Type your question about pension, tax, insurance..." value={input} onChange={e => setInput(e.target.value)} disabled={loading} />
                        <button type="submit" disabled={loading || !input.trim()} className="btn-primary !rounded-lg !px-4 disabled:opacity-50">
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            </div>
        </motion.div>
    );
}
