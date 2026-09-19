const { Review, Product, User, TraderProfile, sequelize } = require('../models');

// ─── Recalculate a trader's average rating ──────────────────────────
const recalcTraderRating = async (traderId) => {
  const row = await Review.findOne({
    attributes: [
      [sequelize.fn('AVG', sequelize.col('rating')), 'avg'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
    ],
    where: { target_type: 'trader', target_id: traderId },
    raw: true,
  });

  const avg = parseFloat(row?.avg) || 0;
  const rounded = Math.round(avg * 10) / 10;

  await TraderProfile.update(
    { rating_avg: rounded },
    { where: { user_id: traderId } }
  );
  return { rating_avg: rounded, review_count: parseInt(row?.count) || 0 };
};

// ─── Product reviews (generic) ──────────────────────────────────────
exports.createReview = async (req, res) => {
  try {
    const { target_type, target_id, rating, comment } = req.body;

    if (target_type === 'product') {
      const product = await Product.findByPk(target_id);
      if (!product) return res.status(404).json({ error: 'Product not found' });
    } else if (target_type === 'trader') {
      const trader = await User.findOne({ where: { id: target_id, role: 'trader' } });
      if (!trader) return res.status(404).json({ error: 'Trader not found' });
    } else {
      return res.status(400).json({ error: 'Invalid target_type' });
    }

    const existing = await Review.findOne({
      where: { customer_id: req.user.id, target_type, target_id },
    });
    if (existing) {
      await existing.update({ rating, comment });
      if (target_type === 'trader') await recalcTraderRating(target_id);
      return res.json(existing);
    }

    const review = await Review.create({
      customer_id: req.user.id,
      target_type,
      target_id,
      rating,
      comment,
    });

    if (target_type === 'trader') {
      await recalcTraderRating(target_id);
    }
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const { target_type, target_id } = req.query;
    if (!target_type || !target_id) {
      return res.status(400).json({ error: 'target_type and target_id required' });
    }
    const reviews = await Review.findAll({
      where: { target_type, target_id },
      include: [{ model: User, as: 'customer', attributes: ['id', 'full_name'] }],
      order: [['created_at', 'DESC']],
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Create / update trader review ─────────────────────────────────
exports.createTraderReview = async (req, res) => {
  try {
    const traderId = parseInt(req.params.traderId, 10);
    const customerId = req.user.id;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    if (traderId === customerId) {
      return res.status(400).json({ error: 'You cannot review yourself' });
    }

    const trader = await User.findByPk(traderId);
    if (!trader || trader.role !== 'trader') {
      return res.status(404).json({ error: 'Trader not found' });
    }

    const existing = await Review.findOne({
      where: { customer_id: customerId, target_type: 'trader', target_id: traderId },
    });

    let review;
    if (existing) {
      await existing.update({ rating, comment: comment || null });
      review = existing;
    } else {
      review = await Review.create({
        customer_id: customerId,
        target_type: 'trader',
        target_id: traderId,
        rating,
        comment: comment || null,
        created_at: new Date(),
      });
    }

    const stats = await recalcTraderRating(traderId);
    res.status(201).json({ review, ...stats });
  } catch (err) {
    console.error('createTraderReview error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── List trader reviews ───────────────────────────────────────────
exports.getTraderReviews = async (req, res) => {
  try {
    const traderId = parseInt(req.params.traderId, 10);
    const reviews = await Review.findAll({
      where: { target_type: 'trader', target_id: traderId },
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'full_name', 'username', 'profile_image'],
        },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Delete a trader review (admin or owner) ───────────────────────
exports.deleteTraderReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findOne({ where: { id, target_type: 'trader' } });
    if (!review) return res.status(404).json({ error: 'Review not found' });

    if (req.user.role !== 'admin' && review.customer_id !== req.user.id) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    const traderId = review.target_id;
    await review.destroy();
    const stats = await recalcTraderRating(traderId);
    res.json({ message: 'Deleted', ...stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};