// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// All routes require authentication
router.use(authenticateToken);

// ── Specific static routes FIRST (before :id) ─────────────
router.get('/', notificationController.getMyNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.put('/read-all', notificationController.markAllRead);
router.post('/save-token', notificationController.savePushToken);
router.post('/test', notificationController.sendTestPush);
router.delete('/', notificationController.clearAll);

// ── Dynamic :id routes LAST ───────────────────────────────
router.put('/:id/read', notificationController.markRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;