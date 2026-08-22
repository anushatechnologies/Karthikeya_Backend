const router   = require('express').Router();
const ctrl     = require('../controllers/auth.controller');
const auth     = require('../middleware/auth');
const { validate, loginSchema, sendOtpSchema, verifyOtpSchema, signupBuyerSchema, signupSupplierSchema } = require('../utils/validators');

router.post('/check-phone',                                       ctrl.checkPhone);
router.post('/send-otp',         validate(sendOtpSchema),         ctrl.sendOtp);
router.post('/verify-otp',       validate(verifyOtpSchema),       ctrl.verifyOtp);
router.post('/firebase-login',                                    ctrl.firebaseLogin);
router.post('/login',            validate(loginSchema),           ctrl.login);
router.post('/signup/buyer',     validate(signupBuyerSchema),     ctrl.signupBuyer);
router.post('/signup/supplier',  validate(signupSupplierSchema),  ctrl.signupSupplier);
router.get('/me',                auth,                            ctrl.getMe);
router.put('/profile',           auth,                            ctrl.updateProfile);
router.post('/change-password',  auth,                            ctrl.changePassword);
router.delete('/account',        auth,                            ctrl.deleteAccount);

module.exports = router;

