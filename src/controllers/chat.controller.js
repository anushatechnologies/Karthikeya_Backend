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
