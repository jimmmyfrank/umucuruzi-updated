const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const {
  createOrder,
  getCustomerOrders,
  getOrderById,
  trackOrder,
  confirmDelivery,
  getTraderOrders,
  validatePromoCode // 🔧 FIXED: Imported the missing function here
} = require('../controllers/orderController');

// ─── Customer routes ──────────────────────────────────────────────
router.post('/', auth, role('customer'), createOrder);
router.get('/', auth, role('customer'), getCustomerOrders);

// 🔧 FIXED: Changed orderController references to the directly destructured functions
router.post('/validate-promo', auth, validatePromoCode);

// ─── Specific routes FIRST (must be before /:id) ──────────────────
router.get('/:id/track', auth, role('customer'), trackOrder);
router.put('/:id/confirm', auth, role('customer'), confirmDelivery);

// ─── Trader orders (must be BEFORE /:id) ─────────────────────────
router.get('/trader/orders', auth, role('trader'), getTraderOrders);

// ─── Generic order lookup LAST ──────────────────────────────────
router.get('/:id', auth, getOrderById);

module.exports = router;
