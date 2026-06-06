const mongoose = require("mongoose");

const transactionSchema = mongoose.Schema({
    transaction_id: {
        type: String,
    },
    failed_attempts: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    },
    payment_mode: {
        type: String,
        required: true
    },
    payment_channel: {
        type: String,
        required: true
    },
    payment: {
        type: String,
        required: true,
        enum: ['pending', 'completed', 'failed']
    },
    payee_id: {
        type: String,
        required: true,
        ref: 'Payee'
    },
    payer_id: {
        type: String,
        required: true,
        ref: 'Payer'
    },
    amount: {
        type: Number,
        required: true
    },
    ip: {
        type: String,
        required: true
    },
    state : {
        type : String,
        required : true
    },
    is_fraud: {
        type: Boolean,
        default: false
    },
    is_fraud_reported: {
        type: Boolean,
        default: false
    },
    fraud_score : {
        type : Number,
    },
});

module.exports = mongoose.model("Transaction", transactionSchema);