const {
  Order, OrderItem, Product, User, TraderProfile, DeliveryAssignment,
  Loyalty, Notification, CartItem, PromoCode, PromoCodeUsage,
  ReferralReward, sequelize
} = require('../models');
const { Op } = require('sequelize');

// Minimum loyalty points required for a customer to redeem ANY promo code.
// Set to 0 to allow everyone.
const MIN_LOYALTY_POINTS_FOR_PROMO = 1;

const createNotification = async (userId, title, message) => {
  try {
    await Notification.create({ user_id: userId, type: 'push', title, message });
  } catch (err) {
    console.error('Error creating notification:', err);
  }
};

// ─────────────────────────────────────────────────────────────────────
//  Promo helpers
// ─────────────────────────────────────────────────────────────────────
const PROMO_INCLUDE = {
  model: PromoCode,
  as: 'PromoCode',
  attributes: ['id', 'code', 'discount_type', 'discount_value', 'description']
};

const validatePromoForTrader = async (rawCode, traderId, userId, transaction) => {
  if (!rawCode || !String(rawCode).trim()) {
    return { valid: false, reason: null, promo: null };
  }
  const code = String(rawCode).trim().toUpperCase();

  const promo = await PromoCode.findOne({
    where: { code, trader_id: traderId },
    transaction
  });

  if (!promo)           return { valid: false, reason: 'Promo code is not valid for this order', promo: null };
  if (!promo.is_active) return { valid: false, reason: 'This promo code is no longer active',    promo: null };

  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (promo.start_date) {
    const s = new Date(promo.start_date); s.setHours(0, 0, 0, 0);
    if (s > today) return { valid: false, reason: 'This promo code is not yet active', promo: null };
  }
  if (promo.end_date) {
    const e = new Date(promo.end_date); e.setHours(23, 59, 59, 999);
    if (e < today) return { valid: false, reason: 'This promo code has expired', promo: null };
  }
  if (promo.usage_limit != null && promo.used_count >= promo.usage_limit) {
    return { valid: false, reason: 'This promo code has reached its usage limit', promo: null };
  }

  // Loyalty gate
  if (MIN_LOYALTY_POINTS_FOR_PROMO > 0) {
    const loyalty = await Loyalty.findOne({
      where: { customer_id: userId, trader_id: traderId },
      transaction
    });
    if (!loyalty || (loyalty.points || 0) < MIN_LOYALTY_POINTS_FOR_PROMO) {
      return {
        valid: false,
        reason: 'This promo code is exclusive to loyal customers of this shop',
        promo: null
      };
    }
  }

  return { valid: true, reason: null, promo };
};

const computeDiscount = (promo, amount) => {
  if (!promo) return 0;
  const value = parseFloat(promo.discount_value) || 0;
  const raw = promo.discount_type === 'percentage'
    ? (amount * value) / 100
    : value;
  const capped = Math.min(raw, amount);
  return Math.round(capped * 100) / 100;
};

// ─────────────────────────────────────────────────────────────────────
//  POST /orders/validate-promo
// ─────────────────────────────────────────────────────────────────────
exports.validatePromoCode = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code || !String(code).trim()) {
      return res.status(400).json({ error: 'Promo code is required' });
    }

    const cartItems = await CartItem.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Product }]
    });
    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty' });
    }

    // subtotal per trader
    const perTraderSubtotal = {};
    cartItems.forEach((item) => {
      const tid = item.Product.trader_id;
      perTraderSubtotal[tid] =
        (perTraderSubtotal[tid] || 0) + item.quantity * parseFloat(item.Product.price);
    });

    const per_trader = [];
    let total_discount = 0;
    let anyValid = false;

    for (const traderId of Object.keys(perTraderSubtotal)) {
      const subtotal = perTraderSubtotal[traderId];
      const r = await validatePromoForTrader(code, traderId, req.user.id, null);

      if (r.valid) {
        anyValid = true;
        const discount = computeDiscount(r.promo, subtotal);
        total_discount += discount;
        per_trader.push({
          trader_id: Number(traderId),
          valid: true,
          code: r.promo.code,
          discount_type: r.promo.discount_type,
          discount_value: parseFloat(r.promo.discount_value),
          subtotal,
          discount,
          final: Math.max(subtotal - discount, 0)
        });
      } else {
        per_trader.push({
          trader_id: Number(traderId),
          valid: false,
          reason: r.reason,
          subtotal
        });
      }
    }

    return res.json({
      valid: anyValid,
      code: String(code).trim().toUpperCase(),
      total_discount: Math.round(total_discount * 100) / 100,
      per_trader
    });
  } catch (err) {
    console.error('validatePromoCode error:', err);
    return res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────
//  POST /orders
// ─────────────────────────────────────────────────────────────────────
exports.createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { delivery_type, delivery_address, payment_method, promo_code } = req.body;

    const cartItems = await CartItem.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Product }],
      transaction
    });

    if (cartItems.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Your cart is empty' });
    }

    // group by trader
    const grouped = cartItems.reduce((acc, item) => {
      const tid = item.Product.trader_id;
      if (!acc[tid]) acc[tid] = [];
      acc[tid].push(item);
      return acc;
    }, {});

    const orders = [];
    const promo_errors = [];

    for (const traderId of Object.keys(grouped)) {
      const items = grouped[traderId];

      let total = 0;
      const orderItemsData = items.map((cart) => {
        const subtotal = cart.quantity * parseFloat(cart.Product.price);
        total += subtotal;
        return {
          product_id: cart.Product.id,
          quantity: cart.quantity,
          price_at_time: cart.Product.price,
          subtotal
        };
      });

      // ── Promo validation & discount (per trader) ──
      let promo = null;
      let discountAmount = 0;

      if (promo_code) {
        const r = await validatePromoForTrader(promo_code, traderId, req.user.id, transaction);
        if (r.valid) {
          promo = r.promo;
          discountAmount = computeDiscount(promo, total);
        } else if (r.reason) {
          promo_errors.push({ trader_id: Number(traderId), reason: r.reason });
        }
      }

      const finalAmount = Math.max(total - discountAmount, 0);

      const order = await Order.create({
        customer_id: req.user.id,
        trader_id: traderId,
        delivery_type,
        delivery_address: delivery_type === 'delivery' ? delivery_address : null,
        total_amount: total,
        promo_code_id: promo ? promo.id : null,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        payment_method: payment_method || 'pay_on_delivery',
        order_status: 'pending',
        payment_status: 'pending'
      }, { transaction });

      for (const item of orderItemsData) {
        await OrderItem.create({ ...item, order_id: order.id }, { transaction });
      }

      // ── Record promo usage + bump counter ──
      if (promo) {
        await PromoCodeUsage.create({
          promo_code_id: promo.id,
          order_id: order.id,
          user_id: req.user.id,
          used_at: new Date()
        }, { transaction });

        await promo.update(
          { used_count: (promo.used_count || 0) + 1 },
          { transaction }
        );
      }

      // ── Notify trader ──
      await Notification.create({
        user_id: traderId,
        type: 'push',
        title: 'New Order',
        message:
          `You have a new order from ${req.user.full_name}` +
          (promo ? ` — promo ${promo.code} (-${discountAmount} RWF)` : '')
      }, { transaction });

      orders.push(order);
    }

    await CartItem.destroy({ where: { user_id: req.user.id }, transaction });
    await transaction.commit();

    return res.status(201).json({ orders, promo_errors });
  } catch (err) {
    await transaction.rollback();
    console.error('createOrder error:', err);
    return res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────
//  GETTERS
// ─────────────────────────────────────────────────────────────────────
exports.getMyOrders = async (req, res) => {
  try {
    const whereClause = {};
    if (req.user.role === 'trader')        whereClause.trader_id   = req.user.id;
    else if (req.user.role === 'customer') whereClause.customer_id = req.user.id;
    else if (req.user.role !== 'admin')    return res.status(403).json({ error: 'Unauthorized role' });

    const orders = await Order.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'customer', attributes: ['id', 'full_name', 'username', 'phone'] },
        { model: OrderItem, include: [{ model: Product }] },
        { model: DeliveryAssignment, include: [{ model: User, as: 'agent', attributes: ['id', 'full_name'] }] },
        PROMO_INCLUDE
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { customer_id: req.user.id },
      include: [
        {
          model: User, as: 'trader',
          attributes: ['id', 'full_name', 'username', 'phone', 'email', 'profile_image'],
          include: [{ model: TraderProfile, attributes: ['shop_name', 'district', 'sector'] }]
        },
        { model: OrderItem, include: [{ model: Product }] },
        { model: DeliveryAssignment, include: [{ model: User, as: 'agent', attributes: ['id', 'full_name', 'username'] }] },
        PROMO_INCLUDE
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;

    const whereClause = { id };
    if (role === 'customer')      whereClause.customer_id       = userId;
    else if (role === 'trader')   whereClause.trader_id         = userId;
    else if (role === 'agent')    whereClause.delivery_agent_id = userId;
    else if (role !== 'admin')    return res.status(403).json({ error: 'Unauthorized role' });

    const order = await Order.findOne({
      where: whereClause,
      include: [
        { model: User, as: 'customer', attributes: ['id', 'full_name', 'username', 'phone', 'email', 'profile_image'] },
        {
          model: User, as: 'trader',
          attributes: ['id', 'full_name', 'username', 'phone', 'email', 'profile_image'],
          include: [{ model: TraderProfile, attributes: ['shop_name', 'district', 'sector', 'description', 'payment_code', 'payment_phone'] }]
        },
        { model: OrderItem, include: [{ model: Product }] },
        { model: DeliveryAssignment, include: [{ model: User, as: 'agent', attributes: ['id', 'full_name', 'username', 'phone'] }] },
        PROMO_INCLUDE
      ]
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, customer_id: req.user.id },
      include: [DeliveryAssignment, PROMO_INCLUDE]
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────
//  PUT /orders/:id/confirm  — customer confirms receipt
//  Awards loyalty points AND (on the referred user's first delivered
//  order) awards a referral bonus to whoever referred them.
// ─────────────────────────────────────────────────────────────────────
exports.confirmDelivery = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id: orderId } = req.params;
    const customerId = req.user.id;

    const order = await Order.findOne({
      where: {
        id: orderId,
        customer_id: customerId,
        [Op.or]: [
          { delivery_type: 'delivery', order_status: 'in_transit' },
          { delivery_type: { [Op.ne]: 'delivery' }, order_status: 'ready' }
        ]
      },
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Order not found, or not in a confirmable state' });
    }

    await order.update({ order_status: 'delivered' }, { transaction });

    if (order.delivery_type === 'delivery') {
      const assignment = await DeliveryAssignment.findOne({
        where: { order_id: order.id },
        transaction
      });
      if (assignment) await assignment.update({ status: 'delivered' }, { transaction });
    }

    // ── Loyalty points ──
    let loyalty = await Loyalty.findOne({
      where: { customer_id: customerId, trader_id: order.trader_id },
      transaction
    });
    if (!loyalty) {
      loyalty = await Loyalty.create(
        { customer_id: customerId, trader_id: order.trader_id, points: 0 },
        { transaction }
      );
    }
    const pointsToAdd = parseInt(process.env.LOYALTY_POINTS_PER_ORDER, 10) || 5;
    loyalty.points += pointsToAdd;
    await loyalty.save({ transaction });

    // ═════════════════════════════════════════════════════════════
    //  REFERRAL REWARD
    //  Fire exactly once, on the referred customer's first delivered
    //  order. Idempotent via the referral_rewards unique check.
    // ═════════════════════════════════════════════════════════════
    try {
      const customer = await User.findByPk(customerId, { transaction });

      if (customer?.referred_by) {
        // Count delivered orders for this customer (including the one we
        // just set above, but inside this same transaction it sees the
        // updated row because the UPDATE ran on this transaction).
        const deliveredCount = await Order.count({
          where: { customer_id: customerId, order_status: 'delivered' },
          transaction
        });

        // First delivered order → reward referrer once
        if (deliveredCount === 1) {
          const alreadyRewarded = await ReferralReward.findOne({
            where: {
              referrer_id: customer.referred_by,
              referred_user_id: customerId
            },
            transaction
          });

          if (!alreadyRewarded) {
            const REFERRAL_POINTS = parseInt(
              process.env.REFERRAL_POINTS || '50',
              10
            );

            await ReferralReward.create(
              {
                referrer_id: customer.referred_by,
                referred_user_id: customerId,
                points_awarded: REFERRAL_POINTS,
                awarded_at: new Date()
              },
              { transaction }
            );

            await Notification.create(
              {
                user_id: customer.referred_by,
                type: 'push',
                title: '🎉 Referral reward earned!',
                message:
                  `You earned ${REFERRAL_POINTS} loyalty points because someone you referred completed their first order.`,
                is_read: false,
                created_at: new Date()
              },
              { transaction }
            );

            await Notification.create(
              {
                user_id: customerId,
                type: 'push',
                title: 'Welcome bonus applied 🎁',
                message:
                  'Your first order is complete. Thanks for joining Umucuruzi!',
                is_read: false,
                created_at: new Date()
              },
              { transaction }
            );
          }
        }
      }
    } catch (refErr) {
      // Never let referral logic break the order confirmation
      console.warn('Referral reward failed:', refErr.message);
    }

    await Notification.create({
      user_id: order.trader_id,
      type: 'push',
      title: 'Order Confirmed',
      message: `Order #${order.id} has been confirmed as received by the customer.`
    }, { transaction });

    await transaction.commit();

    await createNotification(
      customerId,
      'Loyalty Points Earned! 🎉',
      `You earned ${pointsToAdd} loyalty points from order #${order.id}`
    );

    return res.json({
      message: 'Order confirmed successfully',
      order_status: order.order_status
    });
  } catch (err) {
    await transaction.rollback();
    console.error('Error confirming order:', err);
    if (!res.headersSent) return res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────
//  TRADER: orders & promo management
// ─────────────────────────────────────────────────────────────────────
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { trader_id: req.user.id },
      include: [
        { model: User, as: 'customer', attributes: ['id', 'full_name', 'username', 'phone', 'email', 'profile_image'] },
        { model: OrderItem, include: [{ model: Product, attributes: ['id', 'name', 'price', 'images'] }] },
        { model: DeliveryAssignment, include: [{ model: User, as: 'agent', attributes: ['id', 'full_name', 'username'] }] },
        PROMO_INCLUDE
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getTraderOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { trader_id: req.user.id },
      include: [
        { model: User, as: 'customer', attributes: ['id', 'full_name', 'username', 'phone', 'email', 'profile_image'] },
        { model: OrderItem, include: [{ model: Product }] },
        { model: DeliveryAssignment, include: [{ model: User, as: 'agent', attributes: ['id', 'full_name', 'username'] }] },
        PROMO_INCLUDE
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// GET /orders/promo-codes — list trader's codes with stats
exports.getTraderPromoCodes = async (req, res) => {
  try {
    const codes = await PromoCode.findAll({
      where: { trader_id: req.user.id },
      include: [{
        model: PromoCodeUsage,
        as: 'usages',
        attributes: ['id', 'order_id', 'user_id', 'used_at'],
        include: [
          { model: User, as: 'customer', attributes: ['id', 'full_name', 'username'] },
          { model: Order, attributes: ['id', 'final_amount', 'discount_amount'] }
        ]
      }],
      order: [['created_at', 'DESC']]
    });

    const totals = codes.reduce((acc, c) => {
      acc.total_codes += 1;
      if (c.is_active) acc.active_codes += 1;
      acc.total_uses += c.used_count || 0;
      acc.total_discount_given += (c.usages || []).reduce(
        (s, u) => s + parseFloat(u.Order?.discount_amount || 0), 0
      );
      return acc;
    }, { total_codes: 0, active_codes: 0, total_uses: 0, total_discount_given: 0 });

    res.json({ codes, totals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// GET /orders/promo-codes/:id/usages — usage history for one code
exports.getPromoCodeUsages = async (req, res) => {
  try {
    const promo = await PromoCode.findOne({
      where: { id: req.params.id, trader_id: req.user.id },
      include: [{
        model: PromoCodeUsage,
        as: 'usages',
        include: [
          { model: User, as: 'customer', attributes: ['id', 'full_name', 'username', 'phone'] },
          { model: Order, attributes: ['id', 'final_amount', 'discount_amount', 'created_at'] }
        ]
      }]
    });
    if (!promo) return res.status(404).json({ error: 'Promo code not found' });

    res.json({
      id: promo.id,
      code: promo.code,
      discount_type: promo.discount_type,
      discount_value: promo.discount_value,
      used_count: promo.used_count,
      usage_limit: promo.usage_limit,
      usages: promo.usages
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
