const router = require('express').Router();
const ctrl   = require('../controllers/product.controller');
const auth   = require('../middleware/auth');

router.get('/',              ctrl.getProducts);
router.get('/:id',           ctrl.getProductById);

module.exports = router;
