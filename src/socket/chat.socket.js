const { Server }   = require('socket.io');
const { Op }       = require('sequelize');
const { verifyToken }             = require('../utils/jwt');
const { ChatThread, ChatMessage } = require('../models/index');

// Map userId -> socket.id for targeted delivery
const onlineUsers = new Map();

function initChatSocket(server) {
  const io = new Server(server, {
    path: '/ws',
    cors: {
      origin: process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(',')
        : '*',
      methods: ['GET', 'POST'],
    },
  });

  // ── JWT auth handshake ─────────────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.query.token || socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded  = verifyToken(token);
      socket.userId  = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    onlineUsers.set(socket.userId, socket.id);
    console.log(`🔌  [WS] User ${socket.userId} connected`);

    // ── send_message ─────────────────────────────────────────────
    socket.on('send_message', async ({ receiverId, content }) => {
      if (!receiverId || !content) return;

      try {
        const senderId = socket.userId;

        // Find or create chat thread
        let thread = await ChatThread.findOne({
          where: {
            [Op.or]: [
              { participantA: senderId,   participantB: receiverId },
              { participantA: receiverId, participantB: senderId   },
            ],
          },
        });

        if (!thread) {
          thread = await ChatThread.create({ participantA: senderId, participantB: receiverId });
        }

        // Persist message
        const msg = await ChatMessage.create({
          threadId:   thread.id,
          senderId,
          receiverId,
          content,
        });

        // Update thread preview
        await thread.update({ lastMessage: content, lastMessageAt: new Date() });

        const payload = {
          id:        msg.id,
          senderId,
          content,
          timestamp: msg.created_at,
        };

        // Deliver to receiver if online
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive_message', payload);
        }

        // Confirm back to sender
        socket.emit('message_sent', payload);
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
        console.error('[WS] send_message error:', err.message);
      }
    });

    // ── typing indicator (bonus) ──────────────────────────────────
    socket.on('typing', ({ receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_typing', { senderId: socket.userId });
      }
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(socket.userId);
      console.log(`🔌  [WS] User ${socket.userId} disconnected`);
    });
  });

  return io;
}

module.exports = { initChatSocket };
