const router      = require('express').Router();
const sellerCtrl  = require('../controllers/seller.controller');
const productCtrl = require('../controllers/product.controller');
const auth        = require('../middleware/auth');
const requireRole = require('../middleware/role');
const { validate, createProductSchema } = require('../utils/validators');

// All seller routes require auth + seller role
router.use(auth, requireRole('seller'));

// Product management
router.post(  '/products',           validate(createProductSchema), sellerCtrl.createProduct);
router.put(   '/products/:id',       sellerCtrl.updateProduct);
router.delete('/products/:id',       sellerCtrl.deleteProduct);

// Order management
router.get(  '/orders',            sellerCtrl.getSellerOrders);
router.put(  '/orders/:id/status', sellerCtrl.updateOrderStatus);
router.patch('/orders/:id/status', sellerCtrl.updateOrderStatus);

module.exports = router;
