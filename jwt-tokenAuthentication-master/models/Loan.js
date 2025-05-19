// models/Loan.js
const mongoose = require("mongoose");

const LoanSchema = new mongoose.Schema({
  loanAmount: {
    type: Number,
    required: true,
  },
  monthlySavings: {
    type: Number,
    required: true,
  },
  repayment: {
    type: String,
    required: true,
  },
  about: {
    type: String,
    required: true,
  },
  paySlipUrl: {
    type: String,
    required: true,
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CooperativeMember", // correctly referencing the CooperativeMember model
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "processing", "disbursed", "rejected"],
    default: "pending",
  },
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

module.exports = mongoose.model("Loan", LoanSchema);




// const mongoose = require('mongoose')

// const LoanSchema = new mongoose.Schema({
//     loanAmount: {
//         type: Number,
//         required: true
//       },
//       monthlySavings: {
//         type: Number,
//         required: true
//       },
//       repayment: {
//         type: String,
//         required: true
//       },
//       about: {
//         type: String,
//         required: true
//       },
//       member: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'CooperativeMember',
//     required: true
//   },
//       paySlipUrl: { 
//         type: String,
//         required: true
//       },
//       status: {
//         type: String,
//         enum: ['pending', 'approved','processing', 'disbursed', 'rejected'],
//         default: 'pending'
//       },
//     }, {
//       timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
// })

// const LoanModel = mongoose.model("loans", LoanSchema)
// module.exports = LoanModel