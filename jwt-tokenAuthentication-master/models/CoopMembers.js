// models/CooperativeMember.js

// models/CoopMembers.js
const mongoose = require("mongoose");
const generateUniqueAppId = require("../utils/generateAppId");
const generateUniqueMemberId = require("../utils/generateMemberId");

const CooperativeMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  memberId: {
    type: String,
    unique: true,
    required: true
  },
 accountNumber: { //Also should be string
    type: String,
    required: false,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v); // Nigerian bank account numbers are usually 10 digits
      },
      message: props => `${props.value} is not a valid account number`
    }
  },
  bankName: {
    type: String,
    required: false,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z\s]+$/.test(v); // Only letters and spaces
      },
      message: props => `${props.value} is not a valid bank name`
    }
  },
  phoneNumber: {
    type: String,
    required: true, 
    trim: true,
    validate: {
      validator: function(v) {
        // Nigerian phone number pattern
        return /^(\+234|0)[7-9][01]\d{8}$/.test(v);
      },
      message: props => `${props.value} is not a valid Nigerian phone number!`
    }
  },
  appId: {
    type: String,
    unique: true,
    required: true
  },
  staffType: { 
    type: String, 
    required: true 
  },
  payMentProof: {
    type: String,
    required: true,
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true });

CooperativeMemberSchema.pre("validate", async function (next) {
  if (!this.isNew) return next();

  const phoneNumber = this.phoneNumber;
  if (!phoneNumber) {
    const error = new Error("Phone number is required");
    console.error("Validation failed:", error.message);
    return next(error);
  }

  // Nigerian phone number regex
  const phoneRegex = /^(\+234|0)[7-9][01]\d{8}$/;

  if (!phoneRegex.test(phoneNumber)) {
    const error = new Error(`Invalid Nigerian phone number: ${phoneNumber}`);
    console.error("Validation failed:", error.message);
    return next(error);
  }

  // Only proceed if valid
  try {
    if (!this.memberId) this.memberId = await generateUniqueMemberId();
    if (!this.appId) this.appId = await generateUniqueAppId();
    next();
  } catch (err) {
    console.error("Error generating IDs:", err.message);
    next(err);
  }
});

// CooperativeMemberSchema.pre("save", async function (next) {
//   if (!this.isNew) return next();

//   try {
//     this.memberId = await generateUniqueMemberId();
//     this.appId = await generateUniqueAppId();
//     next();
//   } catch (err) {
//     next(err);
//   }
// });

module.exports = mongoose.model("CooperativeMember", CooperativeMemberSchema);
///SECOND ATTEMPT
// const mongoose = require("mongoose");

// const CooperativeMemberSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       unique: true,
//     },
//     firstName: {
//       type: String,
//       required: true,
//     },
//     lastName: {
//       type: String,
//       required: true,
//     },
//     staffType: {
//       type: String,
//       required: true,
//     },
//     profileNumber: {
//       type: String,
//       unique: true,
//     },
//     isVerified: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("CooperativeMember", CooperativeMemberSchema);







// // File: models/CoopMembers.js
// // This file defines the schema for the CooperativeMember model using Mongoose.
// // models/StaffProfile.js (for LASU staff records)
// const mongoose = require('mongoose');

// // models/User.js (for registered users)
// const CooperativeMemberSchema = new mongoose.Schema({
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true,
//     trim: true
//   },
//   password: {
//     type: String,
//     required: true
//   },
//   profileNumber: {
//     type: String,
//     unique: true
//   },
//   firstName: String,
//   lastName: String,
//   staffType: String,
//   isVerified: {
//     type: Boolean,
//     default: false
//   }
// }, { timestamps: true });

// module.exports = mongoose.model('CooperativeMember', CooperativeMemberSchema);