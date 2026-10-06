const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const referralController = require('../controllers/referralController');

router.get('/me', auth, referralController.getMyReferrals);
router.get('/validate/:code', referralController.validateReferralCode);

module.exports = router;
