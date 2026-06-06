const Transaction = require("../models/transactionModel");
const Payer = require("../models/payerModel");
const Payee = require("../models/payeeModel");
const geoip = require('geoip-lite');

const FRAUD_SCORE_THRESHOLD = 0.7;

exports.checkFraud = async (req, res) => {
  try {
    const {
      ip,
      amount, 
      payment_mode,
      payment_channel,
      payee_id,
      payer_id,
      state
    } = req.body;
    
    const transaction = await Transaction.create({
      ip,
      amount,
      payment_mode,
      payment_channel,
      payee_id,
      payer_id,
      state,
      payment: 'pending',
      transaction_id: null
    });

    transaction.transaction_id = transaction._id.toString();
    await transaction.save();

    let fraudReason = "No fraud detected";
    let fraudScore = 0.0;
    let fraudFlags = [];
    
    const geo = geoip.lookup(ip);
    const country = geo ? geo.country : null;
    
    const payerExists = await Payer.findOne({ payer_id });
    const payeeExists = await Payee.findOne({ payee_id });
    
    const userTransactions = await getUserTransactionHistory(payer_id);
    const failed_attempts = await getFailedAttempts(payer_id);
    
    // AMOUNT-BASED RULES
    if (amount > 10000) {
      fraudFlags.push("High-value transaction");
      fraudScore += 0.4;
    }
    
    if (amount === 1000 || amount === 500 || amount % 1000 === 0) {
      fraudFlags.push("Round amount transaction");
      fraudScore += 0.1;
    }

    // LOCATION-BASED RULES
    const highRiskCountries = ["PK", "US", "IR", "BY", "RU"];
    if (country && highRiskCountries.includes(country)) {
      fraudFlags.push(`Transaction from high-risk country: ${country}`);
      fraudScore += 0.6;
    }
    
    const highRiskStates = ["Bihar", "Jharkhand", "West Bengal"];
    if (state && highRiskStates.includes(state.toLowerCase())) {
      fraudFlags.push(`Transaction from high-risk state: ${state}`);
      fraudScore += 0.3;
    }
    
    const knownFraudIPs = await getFraudulentIPs();
    if (knownFraudIPs.includes(ip)) {
      fraudFlags.push("Known fraudulent IP address");
      fraudScore += 0.8;
    }
    
    // PAYER-PAYEE RELATIONSHIP VALIDATION
    const priorTransactions = await validatePayerPayeeRelationship(payer_id, payee_id);
    
    if (priorTransactions === 0) {
      if (userTransactions.length === 0) {
        fraudFlags.push("New user with first transaction");
        fraudScore += 0.4;
      } else if (userTransactions.length > 0 && userTransactions.length <= 5) {
        fraudFlags.push("New user's first transaction with this payee");
        fraudScore += 0.3;
      } else {
        fraudFlags.push("Established user's first transaction with this payee");
        fraudScore += 0.2;
      }
    }
    
    // VELOCITY AND PATTERN CHECKS
    if (failed_attempts >= 3) {
      fraudFlags.push("Multiple failed attempts");
      fraudScore += 0.5;
    }
    
    const recentTransactionCount = await getRecentTransactionCount(payer_id, 60);
    if (recentTransactionCount > 5) {
      fraudFlags.push("Unusual transaction frequency");
      fraudScore += 0.3;
    }

    // BEHAVIORAL ANALYSIS
    const userAvgAmount = calculateAverageTransactionAmount(userTransactions);
    if (userAvgAmount && amount > userAvgAmount * 5) {
      fraudFlags.push("Amount significantly above user average");
      fraudScore += 0.5;
    }
    
    const userCommonStates = getCommonStates(userTransactions);
    if (userCommonStates.length > 0 && state && 
        !userCommonStates.includes(state.toLowerCase())) {
      fraudFlags.push("Unusual location for user");
      fraudScore += 0.4;
    }

    // PAYMENT METHOD RISK
    const highRiskPaymentModes = ["cryptocurrency", "wire_transfer", "gift_card"];
    if (highRiskPaymentModes.includes(payment_mode)) {
      fraudFlags.push("High-risk payment method");
      fraudScore += 0.4;
    }
    
    const highRiskChannels = ["api", "third_party_processor"];
    if (highRiskChannels.includes(payment_channel)) {
      fraudFlags.push("High-risk payment channel");
      fraudScore += 0.3;
    }
    
    // PAYEE RISK ANALYSIS
    const payeeFraudRatio = await getPayeeFraudRatio(payee_id);
    if (payeeFraudRatio > 0.1) {
      fraudFlags.push("Payee has high fraud rate");
      fraudScore += 0.5;
    }

    fraudScore = Math.min(fraudScore, 1.0);
    const isFraud = fraudScore >= FRAUD_SCORE_THRESHOLD;
    
    if (isFraud && fraudFlags.length > 0) {
      fraudReason = fraudFlags[0];
    }

    return res.status(200).json({
      transaction_id: transaction.transaction_id,
      is_fraud: isFraud,
      fraud_reason: fraudReason,
      fraud_score: fraudScore,
      failed_attempts: failed_attempts
    });
  } catch (error) {
    return res.status(500).json({
      transaction_id: "unknown",
      is_fraud: false,
      fraud_reason: "Error processing fraud detection",
      fraud_score: 0,
    });
  }
};

async function validatePayerPayeeRelationship(payerId, payeeId) {
  try {
    return await Transaction.countDocuments({
      payer_id: payerId,
      payee_id: payeeId,
      payment: 'completed'
    });
  } catch (error) {
    return 0;
  }
}

async function getUserTransactionHistory(payerId) {
  try {
    return await Transaction.find({ payer_id: payerId })
      .sort({ date: -1 })
      .limit(50);
  } catch (error) {
    return [];
  }
}

async function getFailedAttempts(payerId) {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return await Transaction.countDocuments({
      payer_id: payerId,
      payment: 'failed',
      date: { $gte: oneDayAgo }
    });
  } catch (error) {
    return 0;
  }
}

async function getRecentTransactionCount(payerId, minutes) {
  try {
    const timeWindow = new Date(Date.now() - minutes * 60 * 1000);
    return await Transaction.countDocuments({
      payer_id: payerId,
      date: { $gte: timeWindow }
    });
  } catch (error) {
    return 0;
  }
}

function calculateAverageTransactionAmount(transactions) {
  if (!transactions || transactions.length === 0) return null;
  const sum = transactions.reduce((total, tx) => total + tx.amount, 0);
  return sum / transactions.length;
}

function getCommonStates(transactions) {
  if (!transactions || transactions.length < 3) return [];
  
  const stateCounts = {};
  transactions.forEach(tx => {
    if (tx.state) {
      const state = tx.state.toLowerCase();
      stateCounts[state] = (stateCounts[state] || 0) + 1;
    }
  });
  
  const threshold = transactions.length * 0.2;
  return Object.keys(stateCounts).filter(state => stateCounts[state] >= threshold);
}

async function getFraudulentIPs() {
  try {
    const fraudTxs = await Transaction.find({ is_fraud: true }).limit(1000);
    return [...new Set(fraudTxs.map(tx => tx.ip))];
  } catch (error) {
    return [];
  }
}

async function getPayeeFraudRatio(payeeId) {
  try {
    const totalTxCount = await Transaction.countDocuments({ payee_id: payeeId });
    if (totalTxCount === 0) return 0;
    
    const fraudTxCount = await Transaction.countDocuments({
      payee_id: payeeId,
      is_fraud: true
    });
    
    return fraudTxCount / totalTxCount;
  } catch (error) {
    return 0;
  }
}
