// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const findOrCreate = require("mongoose-findorcreate");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    sparse: true, // Allows for unique constraint on null values
  },
  FirstName: {
    type: String,
    required: true,
    trim: true,
  },
  picture: {
    type: String,
    default: "",
  },
  LastName: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId; // Only require password if not Google login
    },
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  resetToken: String,
  resetTokenSalt: String,
  resetTokenId: String,
  resetTokenExpires: Date,
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.plugin(findOrCreate);

module.exports = mongoose.model("User", userSchema);

// // WITH GOOGLE AUTH

// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const findOrCreate = require('mongoose-findorcreate');

// const userSchema = new mongoose.Schema({
//     email: {
//         type: String,
//         required: true,
//         unique: true,
//         sparse: true, // Allows for unique constraint on null values
//     },
//     password: {
//         type: String,
//         required: function () {
//             return !this.googleId; // Require password only if googleId is not present
//         },
//     },
//     googleId: {
//         type: String,
//         unique: true,
//         sparse: true,
//     },
//     isVerified: {
//         type: Boolean,
//         default: false,
//     },
//     resetToken: String,
//     resetTokenSalt: String,
//     resetTokenId: String,
//     resetTokenExpires: Date,
//     role: {
//         type: String,
//         enum: ['user', 'admin'],
//         default: 'user',
//     },
// });

// // Pre-save hook to hash the password before saving
// userSchema.pre('save', async function (next) {
//     if (!this.isModified('password')) return next();
//     this.password = await bcrypt.hash(this.password, 10);
//     next();
// });

// // Apply the `findOrCreate` plugin
// userSchema.plugin(findOrCreate);

// module.exports = mongoose.model('User', userSchema);
