const router      = require('express').Router();
const ctrl        = require('../controllers/admin.controller');
const productCtrl = require('../controllers/product.controller');
const auth        = require('../middleware/auth');
const requireRole = require('../middleware/role');
const { validate, kycVerifySchema } = require('../utils/validators');

// All admin routes require auth + admin role
router.use(auth, requireRole('admin'));

router.get('/kyc-applications',              ctrl.getKYCApplications);
router.post('/kyc-applications/:id/verify',  validate(kycVerifySchema), ctrl.verifyKYC);

module.exports = router;
