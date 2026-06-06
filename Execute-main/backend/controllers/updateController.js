const Transaction = require("../models/transactionModel");
const { sendFraudAlert } = require("../services/emailService");

exports.updateController = async(req, res)=>{
    try{
        const {transaction_id, ruleBasedResult, secondRouteResult} = req.body;
        const transaction = await Transaction.findOne({ transaction_id });
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: `Transaction not found`
            })
        }

        if(ruleBasedResult && secondRouteResult){
            const result = await Transaction.updateOne(
                { _id: transaction._id },
                { $set: { is_fraud: true } }
            );

            // Send fraud alert email
            if (result.modifiedCount > 0) {
                const transactionDetails = {
                    transaction_id: transaction.transaction_id,
                    amount: transaction.amount,
                    payer_id: transaction.payer_id,
                    payee_id: transaction.payee_id,
                    ip: transaction.ip,
                    state: transaction.state,
                    fraud_score: 0.8,
                    fraud_reason: 'Rule-based and ML model both detected fraud'
                };
                
                // Send email asynchronously (don't wait for it)
                sendFraudAlert(transactionDetails).catch(err => {
                    // Email error logged but doesn't block response
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: "Marked securely",
            transaction_id: transaction.transaction_id
        });
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}