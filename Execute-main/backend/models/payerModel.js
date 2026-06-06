const mongoose = require("mongoose");

const payerSchema = mongoose.Schema({
    payer_id: {
        type: String,
        required: true,
        unique: true
    },
    payee_id: {
        type: String,
        required: true,
        ref: 'Payee'
    },
    transaction_id: {
        type: String,
        required: true,
        ref: 'Transaction'
    }
});

module.exports = mongoose.model("Payer", payerSchema);
