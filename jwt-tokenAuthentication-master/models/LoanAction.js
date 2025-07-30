const mongoose = require("mongoose");

const LoanActionSchema = new mongoose.Schema({
  loan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Loan",
    required: true,
    index: true, // Optimizes querying by loan ID
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true, // Optimizes filtering by user
  },
  role: {
    type: String,
    enum: ["loan_officer", "disburse_officer", "admin"],
    required: true,
  },
  status: {
    type: String,
    enum: ["approved", "processing","disbursed", "cancelled", "updated", "commented", "completed"],
    required: true,
    index: true, // Optimizes filtering by action type
  },
  comment: {
    type: String,
    maxlength: 500, // Optional: prevent long irrelevant text
    trim: true,
  },
}, {
  timestamps: true, // adds createdAt and updatedAt
});
module.exports = mongoose.model("LoanAction", LoanActionSchema);
