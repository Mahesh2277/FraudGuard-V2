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

// ML Predict Route (proxies request to Flask ML server)
router.post("/predict", async (req, res) => {
  try {
    const flaskApiUrl = process.env.FLASK_API_URL || "http://localhost:5001";
    const response = await fetch(`${flaskApiUrl}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });
    
    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText || "Error calling prediction server" });
    }
    
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error calling Flask ML service:", error.message);
    return res.status(500).json({
      error: "Failed to communicate with ML prediction server"
    });
  }
});

// Analytics Routes
router.get('/analytics', analyticsController.getAnalytics);

module.exports = router;
