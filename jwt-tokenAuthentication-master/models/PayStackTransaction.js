const mongoose = require('mongoose');

const AuthorizationSchema = new mongoose.Schema({
  authorization_code: String,
  bin: String,
  last4: String,
  exp_month: String,
  exp_year: String,
  channel: String,
  card_type: String,
  bank: String,
  country_code: String,
  brand: String,
  reusable: Boolean,
  signature: String,
  account_name: String
}, { _id: false });

const CustomerSchema = new mongoose.Schema({
  id: Number,
  first_name: String,
  last_name: String,
  email: String,
  customer_code: String,
  phone: String,
  metadata: mongoose.Schema.Types.Mixed,
  risk_action: String,
  international_format_phone: String
}, { _id: false });

const TransactionSchema = new mongoose.Schema({
  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  paystackId: { type: Number, required: true },
  reference: { type: String, required: true, unique: true },
  status: String,
  gatewayResponse: String,
  channel: String,
  currency: String,
  ipAddress: String,

  amount: Number,
  requestedAmount: Number,
  fees: Number,

  paidAt: Date,
  createdAtPaystack: Date,
  transactionDate: Date,

  authorization: AuthorizationSchema,
  customer: CustomerSchema,

  metadata: mongoose.Schema.Types.Mixed,
}, {
  timestamps: true // adds createdAt and updatedAt
});

module.exports = mongoose.model('Transaction', TransactionSchema);
