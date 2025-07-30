const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const authMiddleware = require('../middleware/authMiddleware')

// Get all notifications for admin
// Get all notifications
router.get("/allNotification",authMiddleware('admin'), async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: "We could not fetch your notifications at the moment" });
  }
});

// Mark as read
router.put("/MarkasRead:id/read",authMiddleware('admin'), async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  res.sendStatus(200);
});

// Delete
router.delete("/deleteNotification:id", authMiddleware('admin'),async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  res.sendStatus(200);
});


module.exports = router;
