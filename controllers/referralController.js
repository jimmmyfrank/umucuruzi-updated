const { User, ReferralReward, Order, sequelize } = require('../models');
const { Op } = require('sequelize');

/* ─────────────────────────────────────────────────────────────
   GET /referrals/me  (auth)
   Returns the caller's code, share link, stats, and referred users.
   ───────────────────────────────────────────────────────────── */
exports.getMyReferrals = async (req, res) => {
  try {
    const me = await User.findByPk(req.user.id, {
      attributes: ['id', 'full_name', 'username', 'referral_code'],
    });
    if (!me) return res.status(404).json({ error: 'User not found' });

    // Who signed up using my code?
    const referredUsers = await User.findAll({
      where: { referred_by: req.user.id },
      attributes: [
        'id',
        'full_name',
        'username',
        'profile_image',
        'role',
        'created_at',
      ],
      order: [['created_at', 'DESC']],
      limit: 50,
    });

    // Which of them have completed at least one delivered order?
    const referredIds = referredUsers.map((u) => u.id);
    const firstOrderMap = {};

    if (referredIds.length > 0) {
      const counts = await Order.findAll({
        attributes: [
          'customer_id',
          [sequelize.fn('COUNT', sequelize.col('id')), 'cnt'],
        ],
        where: {
          customer_id: { [Op.in]: referredIds },
          order_status: 'delivered',
        },
        group: ['customer_id'],
        raw: true,
      });
      counts.forEach((row) => {
        firstOrderMap[row.customer_id] = parseInt(row.cnt, 10);
      });
    }

    // Rewards earned
    const rewards = await ReferralReward.findAll({
      where: { referrer_id: req.user.id },
      order: [['awarded_at', 'DESC']],
    });
    const totalPoints = rewards.reduce(
      (sum, r) => sum + (r.points_awarded || 0),
      0
    );

    res.json({
      code: me.referral_code,
      link: `https://umucuruzi.com/signup?ref=${me.referral_code}`,
      stats: {
        invited: referredUsers.length,
        rewarded: rewards.length,
        total_points: totalPoints,
      },
      referred_users: referredUsers.map((u) => ({
        id: u.id,
        full_name: u.full_name,
        username: u.username,
        profile_image: u.profile_image,
        role: u.role,
        joined_at: u.created_at,
        has_ordered: (firstOrderMap[u.id] || 0) > 0,
      })),
      rewards: rewards.map((r) => ({
        id: r.id,
        referred_user_id: r.referred_user_id,
        points_awarded: r.points_awarded,
        awarded_at: r.awarded_at,
      })),
    });
  } catch (err) {
    console.error('getMyReferrals error:', err);
    res.status(500).json({ error: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   GET /referrals/validate/:code  (public)
   Used by the signup form to preview who referred the user.
   ───────────────────────────────────────────────────────────── */
exports.validateReferralCode = async (req, res) => {
  try {
    const code = String(req.params.code || '').trim().toUpperCase();
    if (!code) return res.status(400).json({ error: 'Code is required' });

    const referrer = await User.findOne({
      where: { referral_code: code },
      attributes: ['id', 'full_name', 'username', 'profile_image'],
    });

    if (!referrer) {
      return res.status(404).json({ valid: false, error: 'Invalid code' });
    }

    res.json({
      valid: true,
      referrer: {
        id: referrer.id,
        full_name: referrer.full_name,
        username: referrer.username,
        profile_image: referrer.profile_image,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
