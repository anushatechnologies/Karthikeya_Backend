const router   = require('express').Router();
const ctrl     = require('../controllers/auth.controller');
const auth     = require('../middleware/auth');
const { validate, loginSchema, signupBuyerSchema, signupSupplierSchema } = require('../utils/validators');

router.post('/login',            validate(loginSchema),           ctrl.login);
router.post('/signup/buyer',     validate(signupBuyerSchema),     ctrl.signupBuyer);
router.post('/signup/supplier',  validate(signupSupplierSchema),  ctrl.signupSupplier);
router.get('/me',                auth,                            ctrl.getMe);

module.exports = router;
