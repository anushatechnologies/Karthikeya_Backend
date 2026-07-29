const router = require('express').Router();
const ctrl   = require('../controllers/order.controller');
const auth   = require('../middleware/auth');
const { validate, placeOrderSchema } = require('../utils/validators');

router.post('/',   auth, validate(placeOrderSchema), ctrl.placeOrder);
router.get('/',    auth,                              ctrl.getOrders);
router.get('/:id', auth,                              ctrl.getOrderById);

module.exports = router;
