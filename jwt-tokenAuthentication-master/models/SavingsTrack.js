const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  month: {
    type: String,
    required: true,
    enum: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ],
  },
  year: {
    type: Number,
    required: true,
  },
  amountPaid: {
    type: Number,
    default: 0,
    min: [0, 'Amount cannot be negative'],
  },
  datePaid: {
    type: Date,
    default: null,
  },
  paidPerMonth: {
    type: Boolean,
    default: false,
  },
});

const SavingsTrackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  payments: [PaymentSchema],
}, {
  timestamps: true,
});

module.exports = mongoose.model('SavingsTrack', SavingsTrackSchema);
