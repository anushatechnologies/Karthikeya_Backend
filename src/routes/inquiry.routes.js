const router = require('express').Router();
const ctrl   = require('../controllers/inquiry.controller');
const auth   = require('../middleware/auth');
const { validate, inquirySchema } = require('../utils/validators');

router.post('/', auth, validate(inquirySchema), ctrl.createInquiry);
router.get('/',  auth,                          ctrl.getInquiries);

module.exports = router;
