// routes/loanRoutes.js

const express = require('express');
const multer = require('multer');
const { uploadToCloudinary } = require('./cloudinary');
const Loan = require('../models/Loan');
const CooperativeMember = require('../models/CoopMembers');
const Notification = require('../models/Notification.js')
const User = require ('../models/User.js')
const cors = require('cors');
const app = express();
const authMiddleware = require("../middleware/authMiddleware");
app.use(cors({
        origin: "http://localhost:5173",
        credentials: true, 
    }));


const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// THIS IS THE ROUTE FOR SUBMITTING LOAN DETAILS FOR VERIFICATION

router.post(
  "/submit-loan",
  authMiddleware("user"),
  upload.single("paySlip"),
  async (req, res) => {
    const { loanAmount, monthlySavings, repayment, about, repaymentAmount } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      // 1. Find the CooperativeMember linked to this user
      const coopMember = await CooperativeMember.findOne({ 
        userId: req.user._id,
        isVerified: true 
      });

      const UserName = await User.findOne({ _id: coopMember.userId })
      console.log(UserName)
      console.log(coopMember)

      if (!coopMember) {
        return res.status(403).json({
          error: "You must be a verified cooperative member to apply for a loan",
        });
      }

      // 2. Upload to Cloudinary
      const paySlipUrl = await uploadToCloudinary(req.file.buffer);

      // 3. Create loan with CooperativeMember reference
      const newLoan = new Loan({
        loanAmount,
        monthlySavings,
        repayment,
        about,
        paySlipUrl,
        repaymentAmount,
        member: coopMember._id, 
      });

      await newLoan.save();

      const newNotification = new Notification({
        UserName:`${UserName.FirstName} ${UserName.LastName}`,
        type:'Loan-application',
        message:"Just applied for a loan,checking pending loan"
      })
        await newNotification.save()

        const io = req.app.get("io");
        io.emit("New-loan-submitted",{
          message:newNotification.message,
          type:newNotification.type,
          UserName : newNotification.UserName
        })
      // io.emit("new-loan-submitted", {
      //   loanId: newLoan._id,
      //   loanAmount: newLoan.loanAmount,
      //   repaymentAmount: newLoan.repaymentAmount,
      //   monthlySavings: newLoan.monthlySavings,
      //   about: newLoan.about,
      //   status: newLoan.status,
      //   createdAt: newLoan.created_at,
      //   memberId: coopMember.memberId,
      //   UserName: `${UserName.FirstName} ${UserName.LastName}`
      // });

      res.status(201).json({
        message: "Loan request submitted successfully!",
        data: {
          loanId: newLoan._id,
          status: newLoan.status,
          memberId: coopMember.memberId,
          createdAt: newLoan.created_at,
           loanAmount: newLoan.loanAmount,
          monthlySavings: newLoan.monthlySavings,
          repayment: newLoan.repayment,
          about: newLoan.about,
          paySlipUrl: newLoan.paySlipUrl,
          member: newLoan.member,
          repaymentAmount: newLoan.repaymentAmount,
        }
      });
    } catch (error) {
      console.error("Error submitting loan:", error);
      res.status(500).json({ 
        error: error.message || "Internal Server Error" 
      });
    }
  }
);

module.exports = router;