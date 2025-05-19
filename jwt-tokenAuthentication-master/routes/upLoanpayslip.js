// routes/loanRoutes.js

const express = require('express');
const multer = require('multer');
const { uploadToCloudinary } = require('./cloudinary');
const Loan = require('../models/Loan');
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
  "/submit-loan",
  authMiddleware("user"), // Only users (not admins) can submit loans
  upload.single("paySlip"),
  async (req, res) => {
    const { loanAmount, monthlySavings, repayment, about } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      // Upload to Cloudinary
      const paySlipUrl = await uploadToCloudinary(req.file.buffer);

      // Create new loan
      const newLoan = new Loan({
        loanAmount,
        monthlySavings,
        repayment,
        about,
        paySlipUrl,
        member: req.user._id, // ✅ From User model
      });

      await newLoan.save();

      // Return success response
      res.status(201).json({
        message: "Loan request submitted successfully!",
        data: {
          loanAmount: newLoan.loanAmount,
          monthlySavings: newLoan.monthlySavings,
          repayment: newLoan.repayment,
          about: newLoan.about,
          paySlipUrl: newLoan.paySlipUrl,
          member: newLoan.member,
        },
      });
    } catch (error) {
      console.error("Error submitting loan:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

module.exports = router;