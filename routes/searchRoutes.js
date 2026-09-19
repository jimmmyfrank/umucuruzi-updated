const express = require('express');
const router = express.Router();
const { searchAll } = require('../controllers/searchController');
const { User, TraderProfile } = require('../models');

// ... your existing routes ...
// router.get('/', ...);  ← keep existing

// ═══════════════════════════════════════════════════════════════
//  NEW: Search traders by location (district / sector / cell /
//       village / shop_name) with category breakdown
// ═══════════════════════════════════════════════════════════════
router.get('/traders-by-location', async (req, res) => {
  try {
    const { location, category, sort = 'rating' } = req.query;

    if (!location || !location.trim()) {
      return res.status(400).json({ error: 'location is required' });
    }

    const q = location.toLowerCase().trim();

    // Load all traders with their profiles
    const traders = await User.findAll({
      where: { role: 'trader', is_active: true },
      attributes: [
        'id', 'full_name', 'username', 'phone', 'email',
        'profile_image', 'description',
      ],
      include: [{ model: TraderProfile, required: false }],
    });

    // Match against any location field
    const matching = traders.filter((t) => {
      const p = t.TraderProfile;
      if (!p) return false;
      const fields = [p.district, p.sector, p.cell, p.village, p.shop_name];
      return fields.some((f) => (f || '').toLowerCase().includes(q));
    });

    // Build category counts from all matched traders
    const categoryCounts = {};
    matching.forEach((t) => {
      const raw = t.TraderProfile?.business_category;
      if (raw && raw.trim()) {
        const clean = raw.trim();
        categoryCounts[clean] = (categoryCounts[clean] || 0) + 1;
      }
    });

    const categories = Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Optional server-side category filter
    let filtered = matching;
    if (category && category.trim()) {
      const catLower = category.toLowerCase().trim();
      filtered = matching.filter(
        (t) =>
          (t.TraderProfile?.business_category || '').toLowerCase().trim() ===
          catLower
      );
    }

    // Sort
    const sorted = [...filtered];
    if (sort === 'rating') {
      sorted.sort(
        (a, b) =>
          (parseFloat(b.TraderProfile?.rating_avg) || 0) -
          (parseFloat(a.TraderProfile?.rating_avg) || 0)
      );
    } else if (sort === 'name') {
      sorted.sort((a, b) =>
        (a.TraderProfile?.shop_name || a.full_name || '').localeCompare(
          b.TraderProfile?.shop_name || b.full_name || ''
        )
      );
    }

    res.json({
      location: location.trim(),
      categories,
      traders: sorted,
      total: sorted.length,
      totalInLocation: matching.length,
    });
  } catch (err) {
    console.error('traders-by-location error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
// Public search endpoint – no auth required
router.get('/', searchAll);

module.exports = router;