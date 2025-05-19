// routes/loanRoutes.js

const express = require('express');
const multer = require('multer');
const { uploadToCloudinary } = require('./VerifyCloudinary');
const CooperativeMember = require('../models/CoopMembers');
const cors = require('cors');
const app = express();
const authMiddleware = require("../middleware/authMiddleware");
app.use(cors({
        origin: "http://localhost:5173", 
        credentials: true, 
    }));


const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Submit Loan Route
router.post(
  "/verify-coop",
  authMiddleware("user"), // Only users (not admins) can submit loans
  upload.single("payMentProof"),
  async (req, res) => {
    const { phoneNumber, staffType, bankName, accountNumber } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      // Upload to Cloudinary
      const payMentProof = await uploadToCloudinary(req.file.buffer);

      // Create new loan
      const newCooperativeMember = new CooperativeMember({
        phoneNumber,
        staffType,
        bankName,
        accountNumber,
        payMentProof,
        userId: req.user._id
      });

      await newCooperativeMember.save();
      await newCooperativeMember.populate("userId");

      // Return success response
      res.status(201).json({
        message: "Loan request submitted successfully!",
        data: {
          phoneNumber: newCooperativeMember.phoneNumber,
            staffType: newCooperativeMember.staffType,
            bankName: newCooperativeMember.bankName,
            accountNumber: newCooperativeMember.accountNumber,
            payMentProof: newCooperativeMember.payMentProof,
            userId: newCooperativeMember.userId,
        },
      });
    } catch (error) {
      console.error("Error submitting loan:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// GET all pending cooperative members
router.get(
  "/coop-members",
  authMiddleware("admin"), // Only admins can access this route
  async (req, res) => {
    try {
      const members = await CooperativeMember.find({ isVerified: false })
        .populate("userId", "FirstName LastName email") // Get name & email
        .exec();

      res.status(200).json({
        success: true,
        data: members,
      });
    } catch (error) {
      console.error("Error fetching coop members:", error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }
);



module.exports = router;