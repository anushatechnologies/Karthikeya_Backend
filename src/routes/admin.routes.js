const router      = require('express').Router();
const ctrl        = require('../controllers/admin.controller');
const auth        = require('../middleware/auth');
const requireRole = require('../middleware/role');
const { validate, kycVerifySchema } = require('../utils/validators');

// All admin routes require auth + admin role
router.use(auth, requireRole('admin'));

// ── Dashboard Stats ──
router.get('/dashboard/stats', ctrl.getDashboardStats);

// ── Buyers ──
router.get('/buyers', ctrl.getBuyers);
router.get('/buyers/:id', ctrl.getBuyerById);
router.put('/buyers/:id/status', ctrl.updateBuyerStatus);
router.delete('/buyers/:id', ctrl.deleteBuyer);

// ── Suppliers ──
router.get('/suppliers', ctrl.getSuppliers);
router.get('/suppliers/:id', ctrl.getSupplierById);
router.put('/suppliers/:id/approve', ctrl.approveSupplier);
router.put('/suppliers/:id/reject', ctrl.rejectSupplier);
router.put('/suppliers/:id/suspend', ctrl.suspendSupplier);

// ── KYC Verification ──
router.get('/kyc-applications', ctrl.getKYCApplications);
router.post('/kyc-applications/:id/verify', validate(kycVerifySchema), ctrl.verifyKYC);

// ── Products ──
router.get('/products', ctrl.getProducts);
router.get('/products/:id', ctrl.getProductById);
router.put('/products/:id/approve', ctrl.approveProduct);
router.put('/products/:id/reject', ctrl.rejectProduct);
router.put('/products/:id/toggle-featured', ctrl.toggleFeatured);
router.put('/products/:id/toggle-trending', ctrl.toggleTrending);
router.post('/products/bulk-approve', ctrl.bulkApproveProducts);
router.post('/products/bulk-reject', ctrl.bulkRejectProducts);
router.post('/products/bulk-delete', ctrl.bulkDeleteProducts);

// ── Categories & Brands ──
router.get('/categories', ctrl.getCategories);
router.post('/categories', ctrl.createCategory);
router.get('/brands', ctrl.getBrands);
router.put('/brands/:id/approve', ctrl.approveBrand);

// ── Orders ──
router.get('/orders', ctrl.getOrders);
router.get('/orders/:id', ctrl.getOrderById);
router.put('/orders/:id/status', ctrl.updateOrderStatus);
router.post('/orders/:id/tracking', ctrl.addTracking);

// ── Leads ──
router.get('/leads', ctrl.getLeads);
router.post('/leads', ctrl.createLead);
router.get('/leads/packages', ctrl.getLeadPackages);
router.post('/leads/packages', ctrl.createLeadPackage);
router.get('/leads/settings', ctrl.getLeadSettings);
router.put('/leads/settings', ctrl.updateLeadSettings);

// ── Payments & Transactions ──
router.get('/transactions', ctrl.getTransactions);
router.post('/transactions/:id/refund', ctrl.processRefund);

// ── Chat Moderation ──
router.get('/chat/flagged', ctrl.getFlaggedMessages);
router.put('/chat/flagged/:id/resolve', ctrl.resolveFlag);
router.post('/chat/users/ban', ctrl.banUser);

// ── Broadcast Campaigns ──
router.get('/campaigns', ctrl.getCampaigns);
router.post('/campaigns', ctrl.createCampaign);

// ── Support Tickets ──
router.get('/support/tickets', ctrl.getSupportTickets);
router.put('/support/tickets/:id/status', ctrl.updateTicketStatus);

// ── CMS ──
router.get('/cms/banners', ctrl.getBanners);
router.get('/cms/faqs', ctrl.getFaqs);

// ── Platform Settings & Audit ──
router.get('/settings', ctrl.getPlatformSettings);
router.put('/settings', ctrl.updatePlatformSettings);
router.get('/audit-logs', ctrl.getAuditLogs);

module.exports = router;
