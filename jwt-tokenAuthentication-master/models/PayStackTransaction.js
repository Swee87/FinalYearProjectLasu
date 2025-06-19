const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phoneNumber: String,
  amount: Number,
  reference: String,
  status: String,
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
