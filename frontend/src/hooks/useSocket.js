import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

let sharedSocket = null;

export function useSocket(token) {
    const socketRef = useRef(null);

    useEffect(() => {
        if (!token) return;

        // Reuse existing connection if token hasn't changed
        if (!sharedSocket || !sharedSocket.connected) {
            sharedSocket = io(SOCKET_URL, {
                query: { token },
                auth: { token },
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: 5
            });
        }

        socketRef.current = sharedSocket;

        return () => {
            // Don't disconnect on unmount — keep shared connection alive
        };
    }, [token]);

    const emit = useCallback((event, data) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit(event, data);
        }
    }, []);

    const on = useCallback((event, handler) => {
        if (socketRef.current) {
            socketRef.current.on(event, handler);
        }
        return () => socketRef.current?.off(event, handler);
    }, []);

    const off = useCallback((event, handler) => {
        socketRef.current?.off(event, handler);
    }, []);

    const joinRoom = useCallback((room) => {
        socketRef.current?.emit('join_room', room);
    }, []);

    const leaveRoom = useCallback((room) => {
        socketRef.current?.emit('leave_room', room);
    }, []);

    return { socket: socketRef.current, emit, on, off, joinRoom, leaveRoom };
}
