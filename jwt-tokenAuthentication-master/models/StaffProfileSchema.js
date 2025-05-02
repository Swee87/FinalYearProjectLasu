const mongoose = require('mongoose');

const StaffProfileSchema = new mongoose.Schema({
  profileNumber: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  staffType: {
    type: String,
    enum: ['academic', 'non-academic'],
    required: true
  },
  department: String,
  faculty: String,
  dateCreated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('StaffProfile', StaffProfileSchema);

// models/User.js (for registered users)
