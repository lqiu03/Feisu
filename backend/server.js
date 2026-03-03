import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use(cors());
app.use(express.json());

const pool = new pg.Pool({
    connectionString: process.env.DB_DSN || 'postgres://feishu_admin:secretpassword@localhost:5432/feishu_core',
});

// ─── REST API ───────────────────────────────────────

// Get all users
app.get('/api/users', async (_req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM users ORDER BY display_name');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single user
app.get('/api/users/:id', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all conversations for a user
app.get('/api/conversations', async (req, res) => {
    const userId = req.query.userId || 'u-liubei';
    try {
        const { rows } = await pool.query(`
      SELECT c.*,
        (SELECT json_build_object(
          'id', m.id, 'text', m.text, 'sender_id', m.sender_id,
          'sender_name', u.display_name, 'created_at', m.created_at
        )
        FROM messages m
        LEFT JOIN users u ON u.id = m.sender_id
        WHERE m.conversation_id = c.id
        ORDER BY m.created_at DESC LIMIT 1
        ) as last_message,
        (SELECT json_agg(json_build_object(
          'id', u2.id, 'display_name', u2.display_name, 'initials', u2.initials, 'initials_color', u2.initials_color
        ))
        FROM users u2
        JOIN conversation_members cm2 ON cm2.user_id = u2.id
        WHERE cm2.conversation_id = c.id
        ) as members,
        (SELECT COUNT(*)::int FROM messages m2
         WHERE m2.conversation_id = c.id
         AND m2.created_at > COALESCE(
           (SELECT rr.read_at FROM read_receipts rr
            WHERE rr.conversation_id = c.id AND rr.user_id = $1), '1970-01-01'
         )
         AND m2.sender_id != $1
        ) as unread_count
      FROM conversations c
      WHERE c.id IN (SELECT conversation_id FROM conversation_members WHERE user_id = $1)
         OR c.type IN ('bot', 'group')
      ORDER BY (SELECT COALESCE(MAX(created_at), c.created_at) FROM messages WHERE conversation_id = c.id) DESC
    `, [userId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get messages for a conversation
app.get('/api/conversations/:id/messages', async (req, res) => {
    try {
        const { rows } = await pool.query(`
      SELECT m.*, u.display_name as sender_name, u.initials, u.initials_color
      FROM messages m
      LEFT JOIN users u ON u.id = m.sender_id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC
    `, [req.params.id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get conversation members
app.get('/api/conversations/:id/members', async (req, res) => {
    try {
        const { rows } = await pool.query(`
      SELECT u.* FROM users u
      JOIN conversation_members cm ON cm.user_id = u.id
      WHERE cm.conversation_id = $1
    `, [req.params.id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── WEBSOCKET ──────────────────────────────────────

// Track online users: socketId → userId
const onlineUsers = new Map();

io.on('connection', (socket) => {
    console.log(`🔌 Connected: ${socket.id}`);

    // User identifies themselves
    socket.on('auth', (userId) => {
        onlineUsers.set(socket.id, userId);
        console.log(`👤 ${userId} authenticated`);
        io.emit('presence.update', { userId, status: 'online' });
    });

    // Join a conversation room
    socket.on('conversation.join', (conversationId) => {
        socket.join(conversationId);
        console.log(`📥 ${onlineUsers.get(socket.id)} joined ${conversationId}`);
    });

    // Send a message
    socket.on('message.send', async ({ conversationId, text }) => {
        const senderId = onlineUsers.get(socket.id) || 'u-liubei';
        const msgId = uuidv4();
        const now = new Date().toISOString();

        try {
            // Insert into DB
            await pool.query(
                'INSERT INTO messages (id, conversation_id, sender_id, text, created_at) VALUES ($1, $2, $3, $4, $5)',
                [msgId, conversationId, senderId, text, now]
            );

            // Get sender info
            const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [senderId]);
            const sender = rows[0];

            const message = {
                id: msgId,
                conversation_id: conversationId,
                sender_id: senderId,
                sender_name: sender?.display_name || senderId,
                initials: sender?.initials || '?',
                initials_color: sender?.initials_color || '#8B909A',
                text,
                is_edited: false,
                created_at: now,
            };

            // Broadcast to everyone in the conversation
            io.to(conversationId).emit('message.created', message);

            // Also broadcast to all sockets for chat list updates
            io.emit('conversation.updated', { conversationId, lastMessage: message });

            console.log(`💬 ${sender?.display_name}: ${text}`);
        } catch (err) {
            console.error('Message send error:', err.message);
            socket.emit('error', { message: 'Failed to send message' });
        }
    });

    // Typing indicators
    socket.on('typing.start', ({ conversationId }) => {
        const userId = onlineUsers.get(socket.id);
        socket.to(conversationId).emit('typing.indicator', { conversationId, userId, isTyping: true });
    });

    socket.on('typing.stop', ({ conversationId }) => {
        const userId = onlineUsers.get(socket.id);
        socket.to(conversationId).emit('typing.indicator', { conversationId, userId, isTyping: false });
    });

    // Read receipt
    socket.on('message.read', async ({ conversationId, messageId }) => {
        const userId = onlineUsers.get(socket.id);
        try {
            await pool.query(`
        INSERT INTO read_receipts (conversation_id, user_id, last_read_message_id, read_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (conversation_id, user_id)
        DO UPDATE SET last_read_message_id = $3, read_at = NOW()
      `, [conversationId, userId, messageId]);
            socket.to(conversationId).emit('message.read', { conversationId, messageId, userId });
        } catch (err) {
            console.error('Read receipt error:', err.message);
        }
    });

    // Disconnect
    socket.on('disconnect', () => {
        const userId = onlineUsers.get(socket.id);
        if (userId) {
            io.emit('presence.update', { userId, status: 'offline' });
            onlineUsers.delete(socket.id);
        }
        console.log(`🔌 Disconnected: ${socket.id}`);
    });
});

// ─── START ──────────────────────────────────────────

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Feishu backend running on http://localhost:${PORT}`);
    console.log(`   REST API: http://localhost:${PORT}/api`);
    console.log(`   WebSocket: ws://localhost:${PORT}`);
});
