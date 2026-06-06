const mongoose = require("mongoose");

const payeeSchema = mongoose.Schema({
    payee_id: {
        type: String,
        required: true,
        unique: true
    },
    payer_id: {
        type: String,
        required: true,
        ref: 'Payer'
    },
    transaction_id: {
        type: String,
        required: true,
        ref: 'Transaction'
    }
});

module.exports = mongoose.model("Payee", payeeSchema);
