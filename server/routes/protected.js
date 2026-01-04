const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// ============================================
// PROTECTED ROUTE
// ============================================
// This route uses authMiddleware to check if user has valid token
router.get('/protected', authMiddleware, (req, res) => {
  // If we reach here, it means token was valid
  // req.user contains the decoded token data
  
  console.log('User accessed protected route:', req.user.id);

  res.status(200).json({
    message: 'You have accessed a protected route',
    user: {
      id: req.user.id,
      role: req.user.role,
    },
  });
});

module.exports = router;