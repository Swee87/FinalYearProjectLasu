// models/RefreshToken.js
const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  revoked: {
    type: Boolean,
    default: false,
  },
  revokedAt: {
    type: Date,
    default: null,
  },
  replacedByTokenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RefreshToken",
    default: null,
  },
  userAgent: String,
  ipAddress: String,
  isAdminToken: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
// Automatically remove expired tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Index for faster lookup of active tokens
refreshTokenSchema.index({ userId: 1, revoked: 1, isAdminToken: 1 });

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);


// // models/RefreshToken.js
// const mongoose = require("mongoose");

// const refreshTokenSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   token: {
//     type: String,
//     required: true,
//     unique: true, // Important for revocation and lookups
//   },
//   expiresAt: {
//     type: Date,
//     required: true,
//   },
//   revoked: {
//     type: Boolean,
//     default: false,
//   },
//   userAgent: String, // Optional: track browser/device info
//   ipAddress: String, // Optional: track IP address
// });

// // Automatically remove expired tokens
// refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// module.exports = mongoose.model("RefreshToken", refreshTokenSchema);