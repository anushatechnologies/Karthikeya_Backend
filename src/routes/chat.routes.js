const router = require('express').Router();
const ctrl   = require('../controllers/chat.controller');
const auth   = require('../middleware/auth');

router.get('/',                          auth, ctrl.getChats);
router.get('/:participantId/messages',   auth, ctrl.getMessages);
router.post('/:participantId/messages',  auth, ctrl.sendMessage);  // HTTP fallback for WebSocket

module.exports = router;
