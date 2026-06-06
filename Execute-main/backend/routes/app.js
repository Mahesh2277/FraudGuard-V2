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

// Analytics Routes
router.get('/analytics', analyticsController.getAnalytics);

module.exports = router;
