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
  resetTokenSalt: String, // Note: Unused in provided routes, consider removing
  resetTokenId: String, // Note: Unused in provided routes, consider removing
  resetTokenExpires: Date,
  role: {
    type: String,
    enum: ["user", "admin", 'loan_officer','disburse_officer'],
    default: "user"
  },
  failedLoginAttempts: { // Added for account lockout
    type: Number,
    default: 0,
  },
  lockUntil: { // Added for account lockout
    type: Number,
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  if (this.password) { // Ensure password is not hashed if undefined (Google login)
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Create indexes for performance
userSchema.index( { unique: true });
userSchema.index( { unique: true, sparse: true });

userSchema.plugin(findOrCreate);

module.exports = mongoose.model("User", userSchema);

