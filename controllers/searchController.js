const { Op } = require('sequelize');
const {
  Product,
  Category,
  User,
  TraderProfile,
  Market,
} = require('../models');

// ═══════════════════════════════════════════════════════════════
//  GET /api/search?q=...
//  Searches products, traders, markets — including by category name
// ═══════════════════════════════════════════════════════════════
exports.searchAll = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    if (!q || !q.trim()) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const query = q.trim();
    const like = { [Op.like]: `%${query}%` };
    const limitNum = Math.min(parseInt(limit) || 20, 100);

    // ─── Products: name, description, OR category name ─────────
    let products = [];
    try {
      products = await Product.findAll({
        where: {
          is_active: true,
          [Op.or]: [
            { name: like },
            { description: like },
            { '$Category.name$': like },
          ],
        },
        include: [
          { model: Category, attributes: ['id', 'name'] },
          {
            model: User,
            as: 'trader',
            attributes: ['id', 'full_name', 'username', 'profile_image'],
            include: [
              {
                model: TraderProfile,
                attributes: ['shop_name', 'district', 'sector'],
              },
            ],
          },
        ],
        limit: limitNum,
        subQuery: false,
      });
    } catch (err) {
      console.error('Product search error:', err.message);
    }

    // ─── Traders: name, shop_name, business_category, location ─
    let traders = [];
    try {
      traders = await User.findAll({
        where: {
          role: 'trader',
          is_active: true,
          [Op.or]: [
            { full_name: like },
            { username: like },
            { '$TraderProfile.shop_name$': like },
            { '$TraderProfile.business_category$': like },
            { '$TraderProfile.district$': like },
            { '$TraderProfile.sector$': like },
            { '$TraderProfile.cell$': like },
            { '$TraderProfile.village$': like },
          ],
        },
        attributes: [
          'id',
          'full_name',
          'username',
          'phone',
          'email',
          'profile_image',
          'description',
        ],
        include: [{ model: TraderProfile, required: false }],
        limit: limitNum,
        subQuery: false,
      });
    } catch (err) {
      console.error('Trader search error:', err.message);
    }

    // ─── Markets: name, district, sector, description ──────────
    let markets = [];
    try {
      markets = await Market.findAll({
        where: {
          is_active: true,
          [Op.or]: [
            { name: like },
            { district: like },
            { sector: like },
            { cell: like },
            { village: like },
            { description: like },
          ],
        },
        limit: limitNum,
      });
    } catch (err) {
      console.error('Market search error:', err.message);
    }

    res.json({
      products,
      traders,
      markets,
      total: products.length + traders.length + markets.length,
      query,
    });
  } catch (err) {
    console.error('searchAll error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ═══════════════════════════════════════════════════════════════
//  GET /api/search/traders-by-location?location=...&category=...&sort=...
//
//  Matches traders by ANY of:
//    • district / sector / cell / village   (location)
//    • shop_name                            (name)
//    • business_category                    (category)
//
//  So "Nyabugogo" → traders near Nyabugogo
//     "Restaurant" → traders with business_category = "Restaurant"
//     "Cafe"       → traders with business_category = "Cafe"
// ═══════════════════════════════════════════════════════════════
exports.searchTradersByLocation = async (req, res) => {
  try {
    const { location, category, sort = 'rating' } = req.query;

    if (!location || !location.trim()) {
      return res.status(400).json({ error: 'location is required' });
    }

    const q = location.toLowerCase().trim();

    const traders = await User.findAll({
      where: { role: 'trader', is_active: true },
      attributes: [
        'id',
        'full_name',
        'username',
        'phone',
        'email',
        'profile_image',
        'description',
      ],
      include: [{ model: TraderProfile, required: false }],
    });

    // ─── Match against any of these fields ─────────────────────
    const matching = traders.filter((t) => {
      const p = t.TraderProfile;
      if (!p) return false;
      const fields = [
        p.district,
        p.sector,
        p.cell,
        p.village,
        p.shop_name,
        p.business_category, // ← THE KEY ADDITION
      ];
      return fields.some((f) => (f || '').toLowerCase().includes(q));
    });

    // ─── Category counts from the matched traders ──────────────
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

    // ─── Optional category filter (client-side chips) ──────────
    let filtered = matching;
    if (category && category.trim()) {
      const catLower = category.toLowerCase().trim();
      filtered = matching.filter(
        (t) =>
          (t.TraderProfile?.business_category || '').toLowerCase().trim() ===
          catLower
      );
    }

    // ─── Sort ──────────────────────────────────────────────────
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
    console.error('searchTradersByLocation error:', err);
    res.status(500).json({ error: err.message });
  }
};
