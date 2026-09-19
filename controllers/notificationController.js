// controllers/notificationController.js
const { Notification, User } = require('../models');
const { sendPushNotification } = require('../utils/sendPushNotification');

// ═══════════════════════════════════════════════════════════════
//  PUBLIC HELPER — import from anywhere
// ═══════════════════════════════════════════════════════════════
/**
 * Persist a notification + send a push (best effort).
 * Never throws.
 *
 *   const { notifyUser } = require('./notificationController');
 *   await notifyUser(order.customer_id, {
 *     title: 'Order #12 updated',
 *     message: 'Your order is now READY',
 *     data: { orderId: 12 },
 *   });
 */
const notifyUser = async (userId, { title, message, type = 'push', data = {} } = {}) => {
  try {
    const notif = await Notification.create({
      user_id: userId,
      type,
      title: title || null,
      message: message || '',
      is_read: false,
    });

    // Push (best-effort — user may have no token)
    sendPushNotification(userId, title, message, {
      notificationId: notif.id,
      ...data,
    }).catch((e) => console.warn('[notifyUser] push error:', e.message));

    return notif;
  } catch (err) {
    console.error('[notifyUser] error:', err.message);
    return null;
  }
};

exports.notifyUser = notifyUser;

// ═══════════════════════════════════════════════════════════════
//  AUTHENTICATED ENDPOINTS
// ═══════════════════════════════════════════════════════════════

// GET /api/notifications
exports.getMyNotifications = async (req, res) => {
  try {
    const { limit, unread } = req.query;
    const where = { user_id: req.user.id };
    if (unread === 'true') where.is_read = false;

    const notifications = await Notification.findAll({
      where,
      order: [['created_at', 'DESC']],
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/notifications/unread-count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.count({
      where: { user_id: req.user.id, is_read: false },
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/notifications/:id/read
exports.markRead = async (req, res) => {
  try {
    const notif = await Notification.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!notif) return res.status(404).json({ error: 'Notification not found' });
    await notif.update({ is_read: true });
    res.json({ message: 'Marked read', notification: notif });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/notifications/read-all
exports.markAllRead = async (req, res) => {
  try {
    await Notification.update(
      { is_read: true },
      { where: { user_id: req.user.id, is_read: false } }
    );
    res.json({ message: 'All notifications marked read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/notifications/:id
exports.deleteNotification = async (req, res) => {
  try {
    const notif = await Notification.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!notif) return res.status(404).json({ error: 'Notification not found' });
    await notif.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/notifications
exports.clearAll = async (req, res) => {
  try {
    await Notification.destroy({ where: { user_id: req.user.id } });
    res.json({ message: 'All notifications cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/notifications/save-token   { token }
exports.savePushToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token is required' });

    await User.update({ push_token: token }, { where: { id: req.user.id } });
    res.json({ message: 'Push token saved' });
  } catch (err) {
    console.error('savePushToken error:', err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/notifications/test
exports.sendTestPush = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'push_token'],
    });
    if (!user?.push_token) {
      return res.status(400).json({ error: 'No push token saved for this user' });
    }

    const notif = await notifyUser(req.user.id, {
      title: 'Test Notification',
      message: 'This is a test push from Umucuruzi 🚀',
      data: { kind: 'test' },
    });

    res.json({ message: 'Test sent', notification: notif });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};