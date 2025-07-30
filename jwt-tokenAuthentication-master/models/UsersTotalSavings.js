const mongoose = require('mongoose');

const UserSavingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  totalSaved: {
    type: Number,
    default: 0,
    min: [0, 'Total savings cannot be negative'],
  },
  withdrawableBalance: {
    type: Number,
    default: 0,
    min: [0, 'Withdrawable balance cannot be negative'],
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

module.exports = mongoose.model('UserSavings', UserSavingsSchema);
