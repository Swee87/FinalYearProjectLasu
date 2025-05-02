// File: models/CoopMembers.js
// This file defines the schema for the CooperativeMember model using Mongoose.
// models/StaffProfile.js (for LASU staff records)
const mongoose = require('mongoose');

// models/User.js (for registered users)
const CooperativeMemberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  profileNumber: {
    type: String,
    unique: true
  },
  firstName: String,
  lastName: String,
  staffType: String,
  isVerified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('CooperativeMember', CooperativeMemberSchema);