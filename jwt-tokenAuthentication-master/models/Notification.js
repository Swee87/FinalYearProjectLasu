const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  UserName:{
    type: String,
  },
  type: String, 
  message: String,
  link: String, 
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
