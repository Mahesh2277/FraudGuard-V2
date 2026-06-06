const Transaction = require('../models/transactionModel');

exports.getAnalytics = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Fraud by State
    const fraudByState = await Transaction.aggregate([
      { $match: { is_fraud: true, date: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$state', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Fraud by Payment Channel
    const fraudByChannel = await Transaction.aggregate([
      { $match: { is_fraud: true, date: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$payment_channel', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Fraud Trend (Last 7 Days)
    const fraudTrend = await Transaction.aggregate([
      { $match: { is_fraud: true, date: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Amount Distribution
    const amountDistribution = await Transaction.aggregate([
      { $match: { date: { $gte: thirtyDaysAgo } } },
      {
        $bucket: {
          groupBy: '$amount',
          boundaries: [0, 100, 500, 1000, 5000, 10000, Infinity],
          default: '10000+',
          output: {
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      },
      {
        $project: {
          _id: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id', 0] }, then: '0-100' },
                { case: { $eq: ['$_id', 100] }, then: '100-500' },
                { case: { $eq: ['$_id', 500] }, then: '500-1000' },
                { case: { $eq: ['$_id', 1000] }, then: '1000-5000' },
                { case: { $eq: ['$_id', 5000] }, then: '5000-10000' }
              ],
              default: '10000+'
            }
          },
          count: 1
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      fraudByState,
      fraudByChannel,
      fraudTrend,
      amountDistribution
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
