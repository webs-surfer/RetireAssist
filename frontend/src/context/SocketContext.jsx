import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }) {
    const { user } = useAuth();
    const socketRef = useRef(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!user) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            return;
        }

        const socket = io('http://localhost:5001', { transports: ['websocket'] });
        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('join', user.id || user._id);
        });

        socket.on('notification', (data) => {
            setNotifications(prev => [{ ...data, id: Date.now(), isRead: false, createdAt: new Date() }, ...prev]);
            setUnreadCount(prev => prev + 1);
        });

        return () => { socket.disconnect(); };
    }, [user]);

    const joinRoom = (room) => socketRef.current?.emit('join_room', room);
    const leaveRoom = (room) => socketRef.current?.emit('leave_room', room);
    const sendMessage = (data) => socketRef.current?.emit('send_message', data);
    const emitTyping = (data) => socketRef.current?.emit('typing', data);
    const emitStopTyping = (data) => socketRef.current?.emit('stop_typing', data);
    const onMessage = (cb) => {
        socketRef.current?.on('receive_message', cb);
        return () => socketRef.current?.off('receive_message', cb);
    };
    const onTyping = (cb) => {
        socketRef.current?.on('typing', cb);
        return () => socketRef.current?.off('typing', cb);
    };
    const onStopTyping = (cb) => {
        socketRef.current?.on('stop_typing', cb);
        return () => socketRef.current?.off('stop_typing', cb);
    };
    const clearUnread = () => setUnreadCount(0);

    return (
        <SocketContext.Provider value={{
            socket: socketRef.current, notifications, unreadCount, clearUnread,
            joinRoom, leaveRoom, sendMessage, emitTyping, emitStopTyping, onMessage, onTyping, onStopTyping
        }}>
            {children}
        </SocketContext.Provider>
    );
}
