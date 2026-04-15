import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, MessageCircle } from 'lucide-react';

export default function UserChat() {
    const { API, user } = useAuth();
    const { joinRoom, leaveRoom, sendMessage, onMessage, emitTyping, emitStopTyping, onTyping, onStopTyping } = useSocket();
    const { requestId } = useParams();
    const [requests, setRequests] = useState([]);
    const [activeRoom, setActiveRoom] = useState(requestId || null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(null);
    const [sending, setSending] = useState(false);
    const bottomRef = useRef(null);
    const typingTimeout = useRef(null);

    useEffect(() => {
        API.get('/requests/mine').then(r => {
            const accepted = r.data.filter(req => req.helper && req.status !== 'cancelled');
            setRequests(accepted);
            if (!activeRoom && accepted.length > 0) setActiveRoom(accepted[0]._id);
        }).catch(() => {});
    }, []);

    useEffect(() => {
        if (!activeRoom) return;
        setMessages([]);
        API.get(`/messages/${activeRoom}`).then(r => setMessages(r.data)).catch(() => {});
        joinRoom(activeRoom);
        return () => leaveRoom(activeRoom);
    }, [activeRoom]);

    useEffect(() => {
        const unsub = onMessage(msg => {
            setMessages(prev => [...prev, msg]);
        });
        return unsub;
    }, [onMessage]);

    useEffect(() => {
        const unsub = onTyping(data => { setTyping(data.senderName); clearTimeout(typingTimeout.current); typingTimeout.current = setTimeout(() => setTyping(null), 2000); });
        return unsub;
    }, [onTyping]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !activeRoom) return;
        setSending(true);
        const msgData = {
            room: activeRoom, senderId: user.id || user._id,
            senderName: user.name, senderRole: user.role, content: input, type: 'text'
        };
        sendMessage(msgData);
        try { await API.post(`/messages/${activeRoom}`, { content: input, type: 'text' }); } catch {}
        setInput('');
        setSending(false);
    };

    const handleTyping = (val) => {
        setInput(val);
        if (activeRoom) {
            emitTyping({ room: activeRoom, senderId: user.id || user._id, senderName: user.name });
            clearTimeout(typingTimeout.current);
            typingTimeout.current = setTimeout(() => emitStopTyping({ room: activeRoom, senderId: user.id || user._id }), 1500);
        }
    };

    const activeRequest = requests.find(r => r._id === activeRoom);
    const myId = user?.id || user?._id;

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold text-text-dark mb-1">Chat</h1>
                <p className="text-text-light text-sm">Real-time messaging with your helpers.</p>
            </div>

            {requests.length === 0 ? (
                <div className="card text-center py-12">
                    <MessageCircle size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-text-light">No active chats yet. Accept a helper to start chatting.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[70vh]">
                    {/* Request List */}
                    <div className="card overflow-y-auto p-2 space-y-2">
                        {requests.map(req => (
                            <button key={req._id} onClick={() => setActiveRoom(req._id)}
                                className={`w-full text-left p-3 rounded-lg transition-all cursor-pointer border-2 ${activeRoom === req._id ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-bg'}`}>
                                <p className="text-sm font-semibold text-text-dark truncate">{req.serviceName}</p>
                                <p className="text-xs text-text-muted">with {req.helper?.name}</p>
                            </button>
                        ))}
                    </div>

                    {/* Chat Window */}
                    {activeRoom && (
                        <div className="lg:col-span-2 card flex flex-col p-0 overflow-hidden">
                            {/* Header */}
                            <div className="px-4 py-3 border-b border-border flex items-center gap-3 bg-white/80 backdrop-blur-sm flex-shrink-0">
                                <div className="w-9 h-9 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center text-base">👤</div>
                                <div>
                                    <p className="text-sm font-semibold text-text-dark">{activeRequest?.helper?.name}</p>
                                    <p className="text-xs text-emerald-500">Online</p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-bg">
                                {messages.map((msg, i) => {
                                    const isMine = msg.sender?.toString() === myId?.toString() || msg.senderId === myId;
                                    return (
                                        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                            className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isMine
                                                ? 'bg-gradient-to-br from-primary to-secondary text-white rounded-tr-sm'
                                                : 'bg-white text-text-dark shadow-sm rounded-tl-sm border border-border'}`}>
                                                {!isMine && <p className="text-[10px] font-semibold mb-1 text-primary">{msg.senderName}</p>}
                                                <p>{msg.content}</p>
                                                <p className={`text-[10px] mt-1 ${isMine ? 'text-white/60' : 'text-text-muted'}`}>
                                                    {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                                {typing && (
                                    <div className="flex justify-start">
                                        <div className="bg-white rounded-2xl px-4 py-2 shadow-sm border border-border">
                                            <p className="text-xs text-text-muted italic">{typing} is typing...</p>
                                        </div>
                                    </div>
                                )}
                                <div ref={bottomRef} />
                            </div>

                            {/* Input */}
                            <div className="px-4 py-3 border-t border-border bg-white flex-shrink-0 flex gap-2">
                                <input value={input} onChange={e => handleTyping(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2.5 rounded-full border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-bg" />
                                <button onClick={handleSend} disabled={!input.trim() || sending}
                                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center cursor-pointer hover:opacity-90 transition-all disabled:opacity-40">
                                    <Send size={16} className="text-white" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
