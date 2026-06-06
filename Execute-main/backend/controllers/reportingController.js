const transactionModel = require('../models/transactionModel');
const fraudReportingModel = require('../models/fraud_reporting');

const reportFraud = async (req, res) => {
    try {
        const { transaction_id } = req.body;

        if (!transaction_id) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        const transaction = await transactionModel.findOne({ transaction_id });
        
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        const fraudReport = new fraudReportingModel({
            transaction_id: transaction._id,
            is_fraud: true,
            is_fraud_reported: true,
            reporting_entity_id: "SEBI - ID"
        });
        await fraudReport.save();

        return res.status(200).json({
            success: true,
            message: "Fraud reported successfully",
            data: {
                transaction_id: transaction.transaction_id,
                is_fraud: transaction.is_fraud,
                is_fraud_reported: transaction.is_fraud_reported,
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

module.exports = {
    reportFraud
};
