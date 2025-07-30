// // models/Loan.js

// models/Loan.js
const mongoose = require("mongoose");

const LoanSchema = new mongoose.Schema({
  loanAmount: {
    type: String,
    required: true,
  },
  monthlySavings: {
    type: Number,
    required: true,
  },
  repaymentAmount: {
    type: String,
    required: true,
  },
  repayment: {
    type: Number,
    required: true,
    min: 1,
    max: 36,
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
    ref: "CooperativeMember",
    required: true,
  },

  // Loan status flow
  status: {
    type: String,
    enum: [
      "pending",
      "approved",
      "processing",
      "disbursed",
      "ongoing",
      "completed",
      "cancelled",
    ],
    default: "pending",
  },

  // Payment status
  loanPaid: {
    type: String,
    enum: ["paid", "not_paid"],
    default: "not_paid",
    required: true,
  },

  // Latest officer who approved/disbursed (quick access)
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  disbursedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  // Last role involved in update
  role: {
    type: String,
    enum: ["loan_officer", "disburse_officer", "admin"],
  },

  // Timestamps for key steps
  approved_at: Date,
  disbursed_at: Date,
  ongoing_at: Date,
  due_at: Date,

}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
});

// Validate member is verified before saving loan
LoanSchema.pre("save", async function (next) {
  if (this.isModified("member")) {
    try {
      const member = await mongoose.model("CooperativeMember").findOne({
        _id: this.member,
        isVerified: true,
      });

      if (!member) {
        throw new Error(`Member ${this.member} does not exist or is not verified`);
      }

      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model("Loan", LoanSchema);




// const mongoose = require("mongoose");

// const LoanSchema = new mongoose.Schema({
//   loanAmount: {
//     type: String,
//     required: true,
//   },
//   monthlySavings: {
//     type: Number,
//     required: true,
//   },
//   repaymentAmount: {
//     type: String,
//     required: true,
//   },
//   repayment: {
//     type: Number,
//     required: true,
//     min: 1,  // Minimum 1 month duration
//     max: 36   // Maximum 3 years duration
//   },
//   about: {
//     type: String,
//     required: true,
//   },
//   paySlipUrl: {
//     type: String,
//     required: true,
//   },
//   member: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "CooperativeMember",
//     required: true,
//   },
//   status: {
//     type: String,
//     enum: ["pending", "approved", "processing", "disbursed", "ongoing", "completed", "cancelled"],
//     default: "pending",
//   },
//  LoanPaid:{
//   type:String,
//   required:true,
//   enum:["paid", "not_paid"],
//   default: "not_paid"
//  },
//   approvedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//   },
//   disbursedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//   },
//   role: {
//     type: String,
//     enum: ["loan_officer", "disburse_officer", "admin"],
//   },
//   approved_at: Date,
//   disbursed_at: Date,
//   ongoing_at: Date,
//   due_at: Date,
// },
//  {
//   // Only standard timestamps here
//   timestamps: {
//     createdAt: "created_at",
//     updatedAt: "updated_at"
//   }
// });

// // Pre-save hook for member validation
// LoanSchema.pre("save", async function(next) {
//   if (this.isModified("member")) {
//     try {
//       const member = await mongoose.model("CooperativeMember")
//         .findOne({
//           _id: this.member,
//           isVerified: true
//         });

//       if (!member) {
//         throw new Error(
//           `Member ${this.member} either doesn't exist or isn't verified`
//         );
//       }
//       next();
//     } catch (error) {
//       next(error);
//     }
//   } else {
//     next();
//   }
// });

// module.exports = mongoose.model("Loan", LoanSchema);
