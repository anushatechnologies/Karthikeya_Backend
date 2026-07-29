const router      = require('express').Router();
const ctrl        = require('../controllers/rfq.controller');
const auth        = require('../middleware/auth');
const requireRole = require('../middleware/role');
const { validate, rfqSchema, rfqQuoteSchema } = require('../utils/validators');

router.post('/',                    auth, requireRole('buyer'),  validate(rfqSchema),      ctrl.createRFQ);
router.get('/',                     auth,                                                   ctrl.getRFQs);
router.post('/:rfqId/quotes',       auth, requireRole('seller'), validate(rfqQuoteSchema),  ctrl.submitQuote);

module.exports = router;
