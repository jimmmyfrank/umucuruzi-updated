const { User, TraderProfile, ReferralReward, Notification } = require('../models');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { signToken } = require('../utils/jwt');
const { generateReferralCode } = require('../utils/referral');
const { generateQR } = require('../utils/qr');
const { sendEmail } = require('../utils/email');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// ---------- Helper: create notification ----------
const createNotification = async (userId, type, title, message) => {
  await Notification.create({ user_id: userId, type, title, message });
};

// ═══════════════════════════════════════════════════════════════
//  SIGNUP
// ═══════════════════════════════════════════════════════════════
exports.signup = async (req, res) => {
  try {
    const {
      full_name,
      username,
      email,
      phone,
      password,
      role,
      profile_image,
      description,
    } = req.body;

    // ── Required fields ──
    if (!full_name || !username || !phone || !password || !role) {
      return res.status(400).json({
        error: 'Please fill in all required fields.',
        code: 'MISSING_FIELDS',
        fields: {
          full_name: !full_name,
          username: !username,
          phone: !phone,
          password: !password,
          role: !role,
        },
      });
    }

    // ── Role whitelist ──
    if (!['customer', 'trader', 'agent'].includes(role)) {
      return res.status(400).json({
        error: 'The selected account type is not allowed.',
        code: 'INVALID_ROLE',
      });
    }

    // ── Password strength ──
    if (String(password).length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long.',
        code: 'WEAK_PASSWORD',
      });
    }

    // ── Duplicate checks (specific field) ──
    let conflictField = null;
    let conflictValue = null;

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      conflictField = 'username';
      conflictValue = username;
    }

    if (!conflictField && email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        conflictField = 'email';
        conflictValue = email;
      }
    }

    if (!conflictField) {
      const existingPhone = await User.findOne({ where: { phone } });
      if (existingPhone) {
        conflictField = 'phone';
        conflictValue = phone;
      }
    }

    if (conflictField) {
      const friendly = {
        username: 'That username is already taken. Please choose another.',
        email: 'That email is already registered. Try logging in instead.',
        phone: 'That phone number is already registered. Try logging in.',
      }[conflictField];

      return res.status(409).json({
        error: friendly,
        code: 'DUPLICATE_FIELD',
        field: conflictField,
        value: conflictValue,
      });
    }

    // ── Profile image (base64) ──
    let profileImagePath = null;
    if (profile_image) {
      try {
        let base64String = profile_image;
        let fileExtension = 'jpg';

        if (profile_image.startsWith('data:image')) {
          const matches = profile_image.match(
            /^data:image\/([a-zA-Z]+);base64,(.+)$/
          );
          if (matches && matches.length === 3) {
            fileExtension = matches[1];
            base64String = matches[2];
          } else {
            const parts = profile_image.split(',');
            if (parts.length === 2) {
              const mimeMatch = parts[0].match(
                /^data:image\/([a-zA-Z]+);base64$/
              );
              if (mimeMatch) fileExtension = mimeMatch[1];
              base64String = parts[1];
            }
          }
        }

        const buffer = Buffer.from(base64String, 'base64');

        if (buffer.length > 2 * 1024 * 1024) {
          return res.status(400).json({
            error:
              'Your profile photo is too large. Please use a file under 2 MB.',
            code: 'IMAGE_TOO_LARGE',
          });
        }

        const uploadsDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const filename = `profile-${Date.now()}-${Math.round(
          Math.random() * 1e9
        )}.${fileExtension}`;
        const filePath = path.join(uploadsDir, filename);

        fs.writeFileSync(filePath, buffer);
        profileImagePath = `/uploads/${filename}`;
      } catch (imageError) {
        console.error('Image processing error:', imageError);
        // Continue without image — don't block signup
        profileImagePath = null;
      }
    }

    // ── Create user ──
    const hashed = await hashPassword(password);
    const referralCode = generateReferralCode();

    const user = await User.create({
      full_name,
      username,
      email: email || null,
      phone,
      password_hash: hashed,
      role,
      referral_code: referralCode,
      profile_image: profileImagePath,
      description: description || null,
    });

    // ── If trader, create minimal trader profile ──
    if (role === 'trader') {
      await TraderProfile.create({
        user_id: user.id,
        shop_name: `${full_name}'s Shop`,
        is_paid: true,
      });
    }

    // ── Response ──
    const token = signToken(user);
    const userData = user.toJSON();
    delete userData.password_hash;

    res.status(201).json({ token, user: userData });
  } catch (err) {
    console.error('❌ Signup error:', err);
    res.status(500).json({
      error: 'Something went wrong while creating your account. Please try again.',
      code: 'INTERNAL_ERROR',
    });
  }
};

// ═══════════════════════════════════════════════════════════════
//  LOGIN
// ═══════════════════════════════════════════════════════════════
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('🔍 Login attempt for:', username);

    if (!username || !password) {
      return res.status(400).json({
        error: 'Please enter your username and password.',
        code: 'MISSING_CREDENTIALS',
      });
    }

    const user = await User.findOne({ where: { username } });
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({
        error: 'No account found with that username.',
        code: 'USER_NOT_FOUND',
      });
    }

    if (!user.is_active) {
      console.log('⚠️ User is disabled');
      return res.status(403).json({
        error: 'Your account has been disabled. Please contact support.',
        code: 'ACCOUNT_DISABLED',
      });
    }

    const bcrypt = require('bcryptjs');
    const match = await bcrypt.compare(password, user.password_hash);
    console.log('🔑 Password match:', match);

    if (!match) {
      return res.status(401).json({
        error: 'Incorrect password. Please try again.',
        code: 'WRONG_PASSWORD',
      });
    }

    const token = signToken(user);
    const userData = user.toJSON();
    delete userData.password_hash;

    res.json({ token, user: userData });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({
      error: 'Something went wrong. Please try again in a moment.',
      code: 'INTERNAL_ERROR',
    });
  }
};

// ═══════════════════════════════════════════════════════════════
//  GOOGLE AUTH (placeholder)
// ═══════════════════════════════════════════════════════════════
exports.googleAuth = async (req, res) => {
  res.status(501).json({
    error: 'Google sign-in is not available yet.',
    code: 'NOT_IMPLEMENTED',
  });
};

// ═══════════════════════════════════════════════════════════════
//  GENERATE TRADER QR
// ═══════════════════════════════════════════════════════════════
exports.generateTraderQR = async (req, res) => {
  try {
    const traderId = req.params.traderId;
    const trader = await User.findByPk(traderId);
    if (!trader || trader.role !== 'trader') {
      return res.status(404).json({
        error: 'Trader not found.',
        code: 'TRADER_NOT_FOUND',
      });
    }
    const url = `${process.env.QR_BASE_URL}/api/trader/${traderId}`;
    const qr = await generateQR(url);
    res.json({ qr });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Could not generate QR code. Please try again.',
      code: 'QR_GENERATION_FAILED',
    });
  }
};
