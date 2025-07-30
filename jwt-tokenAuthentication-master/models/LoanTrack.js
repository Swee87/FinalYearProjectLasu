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
    type: String,
    default: '0',
    min: [0, 'Amount paid cannot be negative'],
  },
  datePaid: {
    type: Date,
    default: null,
  },
  counter: {
    type: Number,
    default: 0,
  },
  paidPerMonth: {
    type: Boolean,
    default: false,
  },
});


const LoanTrackSchema = new mongoose.Schema({
  payments: [PaymentSchema],
  loan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan',
    required: true,
    index: true,
  },
  userDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
}, {
  timestamps: true,
});

module.exports = mongoose.model('LoanTrack', LoanTrackSchema);