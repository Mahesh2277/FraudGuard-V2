const express = require("express");
const router = express.Router();
const { loginUser, registerUser, getCurrentUser } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { checkFraud } = require("../controllers/ruleBasedController"); 
const transactionController = require('../controllers/transactionController');
const { updateController } = require("../controllers/updateController");
const reportingController = require("../controllers/reportingController");
const analyticsController = require('../controllers/analyticsController');

// Authentication Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/user", protect, getCurrentUser);

// Transaction Routes
router.post("/ruleBased", checkFraud);
router.post("/update", updateController);
router.get('/transactions', transactionController.getTransactions);
router.get('/transactions/stats', transactionController.getTransactionStats);
router.post('/result', reportingController.reportFraud);

// ML Predict Route (now processed directly in Node.js to prevent Render sleep issues)
router.post("/predict", async (req, res) => {
  try {
    const data = req.body;
    
    // Extract parameters
    const amount = parseFloat(data.amount || 0);
    const failedAttempt = parseInt(data.failed_attempt || 0);
    
    // Implement the prediction rule directly:
    // Transactions over $10,000 or accounts with more than 3 failed attempts are flagged as fraudulent
    const isFraud = amount > 10000 || failedAttempt > 3;
    
    console.log(`[ML Predict Route] Request processed locally. Amount: $${amount}, Failed Attempts: ${failedAttempt}. Result (isFraud): ${isFraud}`);
    
    return res.status(200).json({ fraudulent: isFraud });
  } catch (error) {
    console.error("Error in prediction logic:", error.message);
    return res.status(500).json({
      error: "Failed to process ML prediction request"
    });
  }
});

// Analytics Routes
router.get('/analytics', analyticsController.getAnalytics);

module.exports = router;
