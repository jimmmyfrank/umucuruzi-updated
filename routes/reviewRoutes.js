const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Try/Catch intercept wrapper block to surface hidden configuration bugs
let reviewController;
try {
  reviewController = require('../controllers/reviewController');
} catch (error) {
  console.error('🔥 SEQUELIZE INITIALIZATION CRASH LOG DETECTED:');
  console.error(error.stack || error);
  process.exit(1); 
}

const { 
  createReview, 
  getReviews,
  createTraderReview,
  getTraderReviews,
  deleteTraderReview 
} = reviewController;

router.post('/', auth, createReview);
router.get('/', getReviews);
router.get('/trader/:traderId', getTraderReviews);
router.post('/trader/:traderId', auth, createTraderReview);
router.delete('/trader/:id', auth, deleteTraderReview);

module.exports = router;
