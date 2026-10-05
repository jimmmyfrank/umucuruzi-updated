const { PromoCode, Order, User, Notification, sequelize } = require('../models');
const { Op } = require('sequelize');

// ─── Get all promo codes for the authenticated trader ──────────────
exports.getMyPromoCodes = async (req, res) => {
  try {
    const codes = await PromoCode.findAll({
      where: { trader_id: req.user.id },
      order: [['created_at', 'DESC']],
    });
    res.json(codes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Create a new promo code ──────────────────────────────────────────
exports.createPromoCode = async (req, res) => {
  try {
    const {
      code,
      discount_type,
      discount_value,
      start_date,
      end_date,
      usage_limit,
      description,
    } = req.body;

    if (!code || !discount_type || !discount_value || !start_date || !end_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!['percentage', 'fixed'].includes(discount_type)) {
      return res.status(400).json({ error: 'Invalid discount type' });
    }
    if (discount_value <= 0) {
      return res.status(400).json({ error: 'Discount value must be positive' });
    }

    const existing = await PromoCode.findOne({
      where: { code: code.trim().toUpperCase(), trader_id: req.user.id },
    });
    if (existing) {
      return res.status(409).json({ error: 'Promo code already exists' });
    }

    const promo = await PromoCode.create({
      trader_id: req.user.id,
      code: code.trim().toUpperCase(),
      discount_type,
      discount_value,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      usage_limit: usage_limit || null,
      used_count: 0,
      description: description || null,
      is_active: true,
    });

    res.status(201).json(promo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Delete a promo code (only if unused) ────────────────────────────
exports.deletePromoCode = async (req, res) => {
  try {
    const promo = await PromoCode.findOne({
      where: { id: req.params.id, trader_id: req.user.id },
    });
    if (!promo) return res.status(404).json({ error: 'Promo code not found' });

    if (promo.used_count > 0) {
      return res
        .status(400)
        .json({ error: 'Cannot delete a promo code that has been used' });
    }

    await promo.destroy();
    res.json({ message: 'Promo code deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Toggle active status ─────────────────────────────────────────────
exports.togglePromoCode = async (req, res) => {
  try {
    const promo = await PromoCode.findOne({
      where: { id: req.params.id, trader_id: req.user.id },
    });
    if (!promo) return res.status(404).json({ error: 'Promo code not found' });
    promo.is_active = !promo.is_active;
    await promo.save();
    res.json(promo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Validate a promo code (public, for customer) ────────────────────
exports.validatePromoCode = async (req, res) => {
  try {
    const { code, trader_id, total_amount } = req.query;
    if (!code || !trader_id || !total_amount) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const promo = await PromoCode.findOne({
      where: {
        code: code.trim().toUpperCase(),
        trader_id,
        is_active: true,
        start_date: { [Op.lte]: new Date() },
        end_date: { [Op.gte]: new Date() },
        [Op.or]: [
          { usage_limit: null },
          { usage_limit: { [Op.gt]: 0 } },
        ],
      },
    });

    if (!promo) {
      return res.status(404).json({ error: 'Invalid or expired promo code' });
    }

    if (promo.usage_limit !== null && promo.used_count >= promo.usage_limit) {
      return res.status(400).json({ error: 'Promo code usage limit reached' });
    }

    let discount = 0;
    if (promo.discount_type === 'percentage') {
      discount = parseFloat(total_amount) * (promo.discount_value / 100);
    } else {
      discount = parseFloat(promo.discount_value);
    }
    discount = Math.min(discount, parseFloat(total_amount));

    res.json({
      valid: true,
      discount,
      promo_code_id: promo.id,
      code: promo.code,
      discount_type: promo.discount_type,
      discount_value: promo.discount_value,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Send promo code to all loyal customers ──────────────────────────
exports.sendPromoCodeToLoyalCustomers = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const promoId = req.params.id;
    const traderId = req.user.id;

    // 1. Find the promo
    const promo = await PromoCode.findOne({
      where: { id: promoId, trader_id: traderId },
      transaction,
    });
    if (!promo) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Promo code not found' });
    }

    // 2. Find loyal customers (completed at least one delivered order)
    const loyalCustomers = await Order.findAll({
      attributes: ['customer_id'],
      where: {
        trader_id: traderId,
        order_status: 'delivered',
      },
      group: ['customer_id'],
      raw: true,
      transaction,
    });

    if (loyalCustomers.length === 0) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: 'No loyal customers found for this trader' });
    }

    const customerIds = loyalCustomers.map((o) => o.customer_id);

    // 3. Look up trader name for a friendly message
    const trader = await User.findByPk(traderId, {
      attributes: ['id', 'full_name', 'username'],
      transaction,
    });
    const traderName =
      trader?.full_name || trader?.username || 'a shop you love';

    // 4. Build the human-readable discount string
    const discountText =
      promo.discount_type === 'percentage'
        ? `${promo.discount_value}% off`
        : `${promo.discount_value} RWF off`;
    const endDateText = new Date(promo.end_date).toLocaleDateString();

    // 5. Create notifications attached to the trader for deep-linking
    const notifications = customerIds.map((customerId) => ({
      user_id: customerId,
      type: 'push',
      title: `🎉 Special promo from ${traderName}`,
      message:
        `You have a promo code from ${traderName}: ${promo.code}. ` +
        `${discountText} on your next order. Valid until ${endDateText}. ` +
        `Tap to browse the shop and use it.`,
      related_type: 'trader',
      related_id: traderId,
      is_read: false,
      created_at: new Date(),
    }));

    await Notification.bulkCreate(notifications, { transaction });

    // 6. Best-effort push notifications (don't fail the txn)
    try {
      const { sendPushNotification } = require('../utils/sendPushNotification');
      for (const customerId of customerIds) {
        await sendPushNotification(
          customerId,
          `🎉 Special promo from ${traderName}`,
          `Use ${promo.code} for ${discountText} on your next order!`,
          { related_type: 'trader', related_id: traderId, code: promo.code }
        );
      }
    } catch (pushErr) {
      console.warn('Push notifications failed:', pushErr.message);
    }

    await transaction.commit();

    res.json({
      message: `Promo code sent to ${customerIds.length} loyal customers`,
      sentTo: customerIds.length,
    });
  } catch (err) {
    await transaction.rollback();
    console.error('Error sending promo code:', err);
    res.status(500).json({ error: err.message });
  }
};
