const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
});

connectDB();

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Attach io to req for use in routes
app.use((req, _res, next) => { req.io = io; next(); });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/helpers', require('./routes/helpers'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/services', require('./routes/services'));
app.use('/api/pension', require('./routes/pension'));
app.use('/api/reminders', require('./routes/reminders'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/chat', require('./routes/chat'));

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', message: 'RetireAssist API running', timestamp: new Date().toISOString() });
});

// Socket.io — Real-time chat & notifications
const onlineUsers = new Map(); // userId → socketId
const JWT_SECRET = process.env.JWT_SECRET || 'retireassist_jwt_secret_2024';

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Auth via token in handshake
    const token = socket.handshake.query?.token || socket.handshake.auth?.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            socket.userId = decoded.id;
            onlineUsers.set(decoded.id, socket.id);
            socket.join(decoded.id); // personal room
            socket.emit('online', { userId: decoded.id });
        } catch (e) {
            console.log('Socket auth failed:', e.message);
        }
    }

    socket.on('join', (userId) => {
        onlineUsers.set(userId, socket.id);
        socket.userId = socket.userId || userId;
        socket.join(userId);
        socket.emit('online', { userId });
    });

    socket.on('join_room', (room) => socket.join(room));
    socket.on('leave_room', (room) => socket.leave(room));

    socket.on('send_message', (data) => {
        // data: { room, senderId, senderName, senderRole, content, type }
        io.to(data.room).emit('receive_message', { ...data, timestamp: new Date() });
    });

    socket.on('typing', (data) => {
        socket.to(data.room).emit('typing', { senderId: data.senderId, senderName: data.senderName });
    });

    socket.on('stop_typing', (data) => {
        socket.to(data.room).emit('stop_typing', { senderId: data.senderId });
    });

    socket.on('notify_user', ({ targetUserId, notification }) => {
        const targetSocketId = onlineUsers.get(targetUserId);
        if (targetSocketId) io.to(targetSocketId).emit('notification', notification);
        // Also emit to personal room
        io.to(targetUserId).emit('notification', notification);
    });

    socket.on('disconnect', () => {
        if (socket.userId) onlineUsers.delete(socket.userId);
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

// Make io & onlineUsers globally accessible for route handlers
global.io = io;
global.onlineUsers = onlineUsers;

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`\n🚀 RetireAssist Backend running on http://localhost:${PORT}`);
    console.log(`📋 API Health: http://localhost:${PORT}/api/health\n`);
});
