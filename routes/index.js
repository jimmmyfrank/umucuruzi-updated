const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const traderController = require('../controllers/traderController');

// ═══════════════════════════════════════════════════════════════
//  PUBLIC ROUTES
//  (anyone can access — no login required)
// ═══════════════════════════════════════════════════════════════
router.use('/auth', require('./authRoutes'));
router.use('/products', require('./productRoutes'));
router.use('/markets', require('./marketRoutes'));
router.use('/pricetable', require('./priceTableRoutes'));
router.use('/reviews', require('./reviewRoutes'));

// ─── Public sub-routes of the trader namespace ────────────────
// These need to be PUBLIC because any visitor can browse:
//   • Nearby shops search (used on the Nearby tab)
//   • Business categories list (used in filters and search)
//
// IMPORTANT: these MUST come before the auth-wrapped /trader mount
// below, otherwise Express matches the protected route first and
// returns 403 Forbidden.
router.get('/trader/nearby', traderController.getNearbyTraders);
router.get('/trader/business-categories', traderController.getBusinessCategories);

// ═══════════════════════════════════════════════════════════════
//  PROTECTED ROUTES
// ═══════════════════════════════════════════════════════════════
router.use('/users', auth, require('./userRoutes'));
router.use('/cart', auth, role('customer'), require('./cartRoutes'));
router.use('/orders', auth, require('./orderRoutes'));
// loyalty routes no longer require role('customer')
router.use('/loyalty', auth, require('./loyaltyRoutes.js'));
router.use('/delivery', auth, role('agent'), require('./deliveryRoutes'));
router.use('/notifications', auth, require('./notificationRoutes'));

// Trader routes (protected — everything else under /trader)
// The two public ones are defined above, so they won't hit this guard.
router.use('/trader', auth, role('trader'), require('./traderRoutes'));

// Promo codes (trader)
router.use('/promo', auth, role('trader'), require('./promoRoutes'));

// Admin routes
router.use('/admin', auth, role('admin'), require('./adminRoutes'));

module.exports = router;
