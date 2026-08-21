const { Op }                               = require('sequelize');
const { ChatThread, ChatMessage, User }    = require('../models/index');
const { sendSuccess, sendError }           = require('../utils/response');

// ── 7.1 GET /chats ──────────────────────────────────────────────
exports.getChats = async (req, res, next) => {
  try {
    const threads = await ChatThread.findAll({
      where: {
        [Op.or]: [
          { participantA: req.user.id },
          { participantB: req.user.id },
        ],
      },
      order: [['last_message_at', 'DESC']],
    });
    return sendSuccess(res, 200, 'OK', threads);
  } catch (err) {
    next(err);
  }
};

// ── 7.2 GET /chats/:participantId/messages ──────────────────────
exports.getMessages = async (req, res, next) => {
  try {
    const myId    = req.user.id;
    const otherId = req.params.participantId;

    const thread = await ChatThread.findOne({
      where: {
        [Op.or]: [
          { participantA: myId,    participantB: otherId },
          { participantA: otherId, participantB: myId    },
        ],
      },
    });
    if (!thread) return sendSuccess(res, 200, 'OK', []);

    const messages = await ChatMessage.findAll({
      where: { threadId: thread.id },
      include: [
        { model: User, as: 'sender',   attributes: ['id', 'fullName', 'avatar'] },
        { model: User, as: 'receiver', attributes: ['id', 'fullName', 'avatar'] },
      ],
      order: [['created_at', 'ASC']],
    });

    return sendSuccess(res, 200, 'OK', messages);
  } catch (err) {
    next(err);
  }
};

// ── 7.3 POST /chats/:participantId/messages (HTTP fallback for WebSocket) ──
// Vercel serverless does NOT support WebSocket/Socket.IO.
// This endpoint provides HTTP-based message sending as a fallback.
exports.sendMessage = async (req, res, next) => {
  try {
    const senderId   = req.user.id;
    const receiverId = req.params.participantId;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return sendError(res, 400, 'BAD_REQUEST', 'Message content is required');
    }

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
      thread = await ChatThread.create({
        participantA: senderId,
        participantB: receiverId,
      });
    }

    // Persist message
    const msg = await ChatMessage.create({
      threadId:   thread.id,
      senderId,
      receiverId,
      content: content.trim(),
    });

    // Update thread preview
    await thread.update({ lastMessage: content.trim(), lastMessageAt: new Date() });

    return sendSuccess(res, 201, 'Message sent', {
      id:        msg.id,
      senderId,
      receiverId,
      content:   content.trim(),
      timestamp: msg.created_at,
    });
  } catch (err) {
    next(err);
  }
};
