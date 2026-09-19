// ════════════════════════════════════════════════════════════════════════
//  UMUCURUZI — Unified Backend (App + Admin) on one port
// ════════════════════════════════════════════════════════════════════════
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { Op } = require('sequelize');
require('dotenv').config();

// ─── Models ─────────────────────────────────────────────────────────
const {
  sequelize,
  User,
  TraderProfile,
  Advertisement,
  AppSetting,
  Order,
  OrderItem,
  Product,
  Market,
  Category,
} = require('./models');

// ─── App setup ──────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_admin_key_2026';

// ─── Global middleware (deduped) ────────────────────────────────────
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('dev'));

// ─── Uploads folder (shared by both server sections) ────────────────
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ─── Multer setup (used by admin upload endpoint) ───────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

// ─── Serve /uploads with explicit CORS headers ──────────────────────
app.use(
  '/uploads',
  (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
  },
  express.static(uploadDir)
);

// ════════════════════════════════════════════════════════════════════
//  DEBUG ENDPOINT (public — remove in production if you want)
// ════════════════════════════════════════════════════════════════════
app.post('/api/debug-login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Debug attempt received:', username);

    const user = await User.findOne({ where: { username } });
    if (!user) return res.json({ message: '❌ User not found in DB', userFound: false });

    const valid = await bcrypt.compare(password, user.password_hash);
    res.json({
      userFound: true,
      role: user.role,
      passwordMatches: valid,
      activeStatus: user.is_active,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════
//  ADMIN — JWT utilities + auth middleware
// ════════════════════════════════════════════════════════════════════
const signToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const verifyToken = (token) => jwt.verify(token, JWT_SECRET);

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password_hash'] },
    });
    if (!user) return res.status(401).json({ error: 'User not found' });
    if (!user.is_active) return res.status(403).json({ error: 'Account disabled' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ════════════════════════════════════════════════════════════════════
//  ADMIN — PUBLIC ROUTES (must be declared BEFORE the authMiddleware line)
// ════════════════════════════════════════════════════════════════════
app.post('/api/admin/signup', async (req, res) => {
  try {
    const { full_name, username, email, phone, password } = req.body;
    if (!full_name || !username || !phone || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) return res.status(409).json({ error: 'Username already taken' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await User.create({
      full_name,
      username,
      email: email || null,
      phone,
      password_hash: hashedPassword,
      role: 'admin',
      referral_code: 'ADMIN-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      is_active: true,
    });
    const token = signToken(admin);
    const userData = admin.toJSON();
    delete userData.password_hash;
    res.status(201).json({ token, user: userData });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.is_active) return res.status(403).json({ error: 'Account disabled' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user);
    const userData = user.toJSON();
    delete userData.password_hash;
    res.json({ token, user: userData });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════
//  ADMIN — PROTECTED ROUTES (everything below requires a valid JWT)
// ════════════════════════════════════════════════════════════════════
app.use('/api/admin', authMiddleware);

// ─── Image Upload ───────────────────────────────────────────────────
app.post('/api/admin/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// ─── Basic Stats ────────────────────────────────────────────────────
app.get('/api/admin/stats', async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalTraders = await User.count({ where: { role: 'trader' } });
    const totalOrders = await Order.count();
    const totalProducts = await Product.count();
    const totalMarkets = await Market.count();
    res.json({ totalUsers, totalTraders, totalOrders, totalProducts, totalMarkets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── User Management ────────────────────────────────────────────────
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash'] },
      include: [{ model: TraderProfile, required: false }],
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/users/:id/toggle', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.is_active = !user.is_active;
    await user.save();
    res.json({ message: `User ${user.is_active ? 'activated' : 'deactivated'}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Advertisements CRUD ────────────────────────────────────────────
app.get('/api/admin/ads', async (req, res) => {
  try {
    const ads = await Advertisement.findAll();
    res.json(ads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/admin/ads', async (req, res) => {
  try {
    const ad = await Advertisement.create(req.body);
    res.status(201).json(ad);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put('/api/admin/ads/:id', async (req, res) => {
  try {
    const ad = await Advertisement.findByPk(req.params.id);
    if (!ad) return res.status(404).json({ error: 'Ad not found' });
    await ad.update(req.body);
    res.json(ad);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete('/api/admin/ads/:id', async (req, res) => {
  try {
    const ad = await Advertisement.findByPk(req.params.id);
    if (!ad) return res.status(404).json({ error: 'Ad not found' });
    await ad.destroy();
    res.json({ message: 'Ad deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Markets CRUD (admin) ───────────────────────────────────────────
app.get('/api/admin/markets', async (req, res) => {
  try {
    const markets = await Market.findAll();
    res.json(markets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/markets', async (req, res) => {
  try {
    let daysActive = req.body.days_active;
    if (!daysActive) {
      daysActive = JSON.stringify([]);
    } else if (typeof daysActive === 'object') {
      daysActive = JSON.stringify(daysActive);
    }
    const marketData = {
      ...req.body,
      days_active: daysActive,
      created_by: req.user.id,
      is_active: req.body.is_active !== undefined ? req.body.is_active : true,
    };
    const market = await Market.create(marketData);
    res.status(201).json(market);
  } catch (err) {
    console.error('Market creation error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/markets/:id', async (req, res) => {
  try {
    const market = await Market.findByPk(req.params.id);
    if (!market) return res.status(404).json({ error: 'Market not found' });
    const updateData = { ...req.body };
    if (updateData.days_active && typeof updateData.days_active === 'object') {
      updateData.days_active = JSON.stringify(updateData.days_active);
    }
    await market.update(updateData);
    res.json(market);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/markets/:id', async (req, res) => {
  try {
    const market = await Market.findByPk(req.params.id);
    if (!market) return res.status(404).json({ error: 'Market not found' });
    await market.destroy();
    res.json({ message: 'Market deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Categories CRUD (admin) ────────────────────────────────────────
app.get('/api/admin/categories', async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/admin/categories', async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put('/api/admin/categories/:id', async (req, res) => {
  try {
    const cat = await Category.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    await cat.update(req.body);
    res.json(cat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete('/api/admin/categories/:id', async (req, res) => {
  try {
    const cat = await Category.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    await cat.destroy();
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Settings ───────────────────────────────────────────────────────
app.get('/api/admin/settings', async (req, res) => {
  try {
    const settings = await AppSetting.findAll();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put('/api/admin/settings', async (req, res) => {
  try {
    const { key, value } = req.body;
    const setting = await AppSetting.findOne({ where: { setting_key: key } });
    if (setting) await setting.update({ setting_value: value });
    else await AppSetting.create({ setting_key: key, setting_value: value });
    res.json({ message: 'Setting updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════
//  ADMIN — ANALYTICS
// ════════════════════════════════════════════════════════════════════

// ─── Overview Stats ─────────────────────────────────────────────────
app.get('/api/admin/analytics/overview', async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalTraders = await User.count({ where: { role: 'trader' } });
    const totalOrders = await Order.count();
    const totalProducts = await Product.count();
    const totalMarkets = await Market.count();
    const totalRevenue = await Order.sum('final_amount', {
      where: { order_status: 'delivered' },
    });
    const pendingOrders = await Order.count({ where: { order_status: 'pending' } });
    const deliveredOrders = await Order.count({ where: { order_status: 'delivered' } });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await User.count({ where: { created_at: { [Op.gte]: today } } });
    res.json({
      totalUsers,
      totalTraders,
      totalOrders,
      totalProducts,
      totalMarkets,
      totalRevenue: totalRevenue || 0,
      pendingOrders,
      deliveredOrders,
      newUsersToday,
    });
  } catch (err) {
    console.error('Overview error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Orders over time ───────────────────────────────────────────────
app.get('/api/admin/analytics/orders-over-time', async (req, res) => {
  try {
    const { period = 'day' } = req.query;
    let interval;
    if (period === 'day') {
      interval = sequelize.fn('DATE', sequelize.col('created_at'));
    } else if (period === 'week') {
      interval = sequelize.fn('YEARWEEK', sequelize.col('created_at'), 1);
    } else {
      interval = sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m');
    }
    const results = await Order.findAll({
      attributes: [
        [interval, 'period'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: [sequelize.literal('period')],
      order: [[sequelize.literal('period'), 'ASC']],
      raw: true,
    });
    res.json(results);
  } catch (err) {
    console.error('Orders over time error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Revenue over time ──────────────────────────────────────────────
app.get('/api/admin/analytics/revenue-over-time', async (req, res) => {
  try {
    const { period = 'day' } = req.query;
    let interval;
    if (period === 'day') {
      interval = sequelize.fn('DATE', sequelize.col('created_at'));
    } else if (period === 'week') {
      interval = sequelize.fn('YEARWEEK', sequelize.col('created_at'), 1);
    } else {
      interval = sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m');
    }
    const results = await Order.findAll({
      where: { order_status: 'delivered' },
      attributes: [
        [interval, 'period'],
        [sequelize.fn('SUM', sequelize.col('final_amount')), 'revenue'],
      ],
      group: [sequelize.literal('period')],
      order: [[sequelize.literal('period'), 'ASC']],
      raw: true,
    });
    res.json(results);
  } catch (err) {
    console.error('Revenue over time error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Top products ───────────────────────────────────────────────────
app.get('/api/admin/analytics/top-products', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const results = await OrderItem.findAll({
      attributes: [
        'product_id',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'total_sold'],
      ],
      include: [{ model: Product, attributes: ['name'] }],
      group: ['product_id', 'Product.id'],
      order: [[sequelize.literal('total_sold'), 'DESC']],
      limit: parseInt(limit),
      raw: true,
      nest: true,
    });
    res.json(results);
  } catch (err) {
    console.error('Top products error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Product categories distribution (bug fixed) ────────────────────
app.get('/api/admin/analytics/categories-distribution', async (req, res) => {
  try {
    const results = await Product.findAll({
      attributes: [
        'category_id',
        [sequelize.fn('COUNT', sequelize.col('Product.id')), 'count'],
      ],
      include: [{ model: Category, attributes: ['name'] }],
      group: ['category_id', 'Category.id'],
      raw: true,
      nest: true,
    });
    res.json(results);
  } catch (err) {
    console.error('Categories distribution error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Recent orders ──────────────────────────────────────────────────
app.get('/api/admin/analytics/recent-orders', async (req, res) => {
  try {
    const orders = await Order.findAll({
      limit: 10,
      order: [['created_at', 'DESC']],
      include: [
        { model: User, as: 'customer', attributes: ['full_name'] },
        { model: User, as: 'trader', attributes: ['full_name'] },
      ],
      attributes: ['id', 'final_amount', 'order_status', 'created_at'],
    });
    res.json(orders);
  } catch (err) {
    console.error('Recent orders error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Orders by hour ─────────────────────────────────────────────────
app.get('/api/admin/analytics/orders-by-hour', async (req, res) => {
  try {
    const results = await Order.findAll({
      attributes: [
        [sequelize.fn('HOUR', sequelize.col('created_at')), 'hour'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: [sequelize.literal('hour')],
      order: [[sequelize.literal('hour'), 'ASC']],
      raw: true,
    });
    const fullHours = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
    results.forEach((r) => {
      const idx = fullHours.findIndex((h) => h.hour === r.hour);
      if (idx !== -1) fullHours[idx].count = r.count;
    });
    res.json(fullHours);
  } catch (err) {
    console.error('Orders by hour error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get(
  '/api/trader/business-categories',
  require('./controllers/traderController').getBusinessCategories
);

app.use('/api', require('./routes'));
// ════════════════════════════════════════════════════════════════════
//  MAIN APP ROUTES (from original server.js)
// ════════════════════════════════════════════════════════════════════
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/ads', require('./routes/adRoutes'));
app.use('/api', require('./routes'));                          // mounts /auth, /products, /markets, /reviews, /trader, /users, /cart, /orders, /loyalty, /delivery, /notifications, /promo, /admin(nested)
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/markets', require('./routes/marketRoutes'));
app.use('/api/loyalty', require('./routes/loyaltyRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// ─── Root health check ──────────────────────────────────────────────
app.get('/', (req, res) => res.send('Umucuruzi API is running'));

// ════════════════════════════════════════════════════════════════════
//  ERROR HANDLING
// ════════════════════════════════════════════════════════════════════
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err.name === 'MulterError') {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// ════════════════════════════════════════════════════════════════════
//  START SERVER
// ════════════════════════════════════════════════════════════════════
sequelize.sync({ alter: false })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Unified Server running on port ${PORT}`);
      console.log(`📱 App API:        http://localhost:${PORT}/api`);
      console.log(`📌 Admin Signup:   http://localhost:${PORT}/api/admin/signup`);
      console.log(`📌 Admin Login:    http://localhost:${PORT}/api/admin/login`);
      console.log(`📌 Image Upload:   http://localhost:${PORT}/api/admin/upload`);
      console.log(`📁 Uploads folder: ${uploadDir}`);
    });
  })
  .catch((err) => console.error('DB connection failed:', err));