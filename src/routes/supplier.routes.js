// Supplier public profile route (mounted at /suppliers)
const router = require('express').Router();
const ctrl   = require('../controllers/product.controller');

router.get('/:sellerId', ctrl.getSupplier);

module.exports = router;
