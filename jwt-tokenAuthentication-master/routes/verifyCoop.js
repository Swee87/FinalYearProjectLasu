// routes/loanRoutes.js

const express = require('express');
const multer = require('multer');
const { uploadToCloudinary } = require('./VerifyCloudinary');
const CooperativeMember = require('../models/CoopMembers');
const cors = require('cors');
const app = express();
const authMiddleware = require("../middleware/authMiddleware");
app.use(cors({
  origin: "http://localhost:5173",  // Your frontend's address
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"], // Allow PATCH
  credentials: true, // Allow cookies
}));

const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");

const verifyCoopLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: "Too many verification attempts. Please try again later.",
});

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// THIS IS THE ROUTE FOR SUBMITTING MEMBERSHIP DETAILS FOR VERIFICATION

router.post(
  "/verify-coop",
  authMiddleware("user"),
  verifyCoopLimiter,
  upload.single("payMentProof"),
  [
    body("phoneNumber").isMobilePhone().withMessage("Invalid phone number"),
    body("staffType").notEmpty().withMessage("Staff type is required"),
    body("bankName").notEmpty().withMessage("Bank name is required"),
    body("accountNumber").isLength({ min: 10, max: 10 }).withMessage("Account number must be 10 digits"),
    body("monthlySavings").isNumeric().withMessage("Monthly savings must be a number"),
    body("SavingsType").notEmpty().withMessage("Savings type is required"),
  ],

  async (req, res) => {
    //  Validate input fields
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { phoneNumber, staffType, bankName, accountNumber, monthlySavings, SavingsType } = req.body;

    try {
      // Prevent duplicate entries
      const existingMember = await CooperativeMember.findOne({ phoneNumber });
      if (existingMember) {
        return res.status(409).json({ error: "Phone number already registered" });
      }

      //  Upload to Cloudinary securely
      const payMentProof = await uploadToCloudinary(req.file.buffer);

      //  Create new cooperative member
      const newCooperativeMember = new CooperativeMember({
        phoneNumber,
        SavingsType,
        staffType,
        bankName,
        accountNumber,
        payMentProof,
        userId: req.user._id,
        monthlySavings,
      });

      await newCooperativeMember.save();
      await newCooperativeMember.populate("userId", "FirstName LastName email");

      res.status(201).json({
        message: "Verification submitted successfully!",
        data: {
          phoneNumber,
          staffType,
          bankName,
          accountNumber,
          payMentProof,
          user: newCooperativeMember.userId,
        },
      });
    } catch (error) {
      console.error("Error submitting verification:", error);
      if (error.code === 11000) {
        return res.status(409).json({ error: "Phone number already exists" });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);


// router.post(
//   "/verify-coop",
//   authMiddleware("user"), // Only users (not admins) can submit loans
//   upload.single("payMentProof"),
//   async (req, res) => {
//     const { phoneNumber, staffType, bankName, accountNumber,  monthlySavings, SavingsType } = req.body;

//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     try {
//       // Upload to Cloudinary
//       const payMentProof = await uploadToCloudinary(req.file.buffer);

      
//       const newCooperativeMember = new CooperativeMember({
//         phoneNumber,
//         SavingsType,
//         staffType,
//         bankName,
//         accountNumber,
//         payMentProof,
//         userId: req.user._id,
//         monthlySavings
        
//       });

//       await newCooperativeMember.save();
//     //   await newCooperativeMember.populate("userId");
//     await newCooperativeMember.populate("userId", "FirstName LastName email"); // <-- Populating specific fields
//         console.log("New Cooperative Member:", newCooperativeMember);

//       // Return success response
//       res.status(201).json({
//         message: "Loan request submitted successfully!",
//         data: {
//           phoneNumber: newCooperativeMember.phoneNumber,
//             staffType: newCooperativeMember.staffType,
//             bankName: newCooperativeMember.bankName,
//             accountNumber: newCooperativeMember.accountNumber,
//             payMentProof: newCooperativeMember.payMentProof,
//             //userId: newCooperativeMember.userId,
//             user: newCooperativeMember.userId,
//         },
//       });
//     } catch (error) {
//       console.error("Error submitting loan:", error);
//       res.status(500).json({ error: "Internal Server Error" });
//     }
//   }
// );


//GET IF THE USER IS VERIFIED SO AS TO REMOVE VERIFY BUTTON ON THE FRONTEND AND ENABLE LOAN BUTTON

router.get('/getVerified', authMiddleware('user'), async (req, res) => {
  try {
    const member = await CooperativeMember.findOne({
      isVerified: true,
      userId: req.user._id,
    })
      .populate({
        path: 'userId',
        select: 'email firstName lastName',
      })
      .lean();

    if (!member) {
      console.warn(`No verified member found for user: ${req.user._id}`);
      return res.status(404).json({ success: false, message: 'No verified member found' });
    }

    console.log(member)
   
    res.status(200).json({
      success: true,
      data: {
        ...member,
        verifiedAt: member.verifiedAt, 
      },
    });
  } catch (error) {
    console.error('Error fetching verified member:', error.message || error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});



// router.get('/getVerified', authMiddleware('user'), async (req, res) => {
//   try {
//     const member = await CooperativeMember.findOne({
//       isVerified: true,
//       userId: req.user._id,
//     })
//       .populate({
//         path: 'userId',
//         select: 'email firstName lastName',
//       })
//       .lean();

//     if (!member) {
//       console.warn(`No verified member found for user: ${req.user._id}`);
//       return res.status(404).json({ success: false, message: 'No verified member found' });
//     }

//     console.log(`Found verified member: ${member._id} for user: ${req.user._id}`);
//     res.status(200).json({ success: true, data: member });
//   } catch (error) {
//     console.error('Error fetching verified member:', error.message || error);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// });




// GET all pending cooperative members
///ENDPOINT FOR GETTING ALL UNVERIFIED MEMBERS
// This route is for admins to get all unverified cooperative members
router.get("/coop-members", authMiddleware("admin"), async (req, res) => {
    console.log("[DEBUG] GET /coop-members received request");
    try {
      const members = await CooperativeMember.find({ isVerified: false })
        .populate("userId", "FirstName LastName email")
        .lean();
  
      console.log(`Found ${members.length} unverified members`);
      
      res.status(200).json({
        success: true,
        data: members.map(m => ({
            ...m,
         id: m._id,
         email: m.userId?.email,
        firstName: m.userId?.firstName,
    lastName: m.userId?.lastName,
    payMentProof: m.payMentProof,
    isVerified: m.isVerified,
    SavingsType : m.SavingsType,
    monthlySavings: m. monthlySavings
        }))
      });
    } catch (error) {
      console.error("Route error:", error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  });



// ROUTE FOR APPROVING A COOPERATIVE MEMBER
  router.patch("/coop-members/:id", authMiddleware("admin"), async (req, res) => {
    const { id } = req.params;
    try {
      const member = await CooperativeMember.findById(id);
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }
  
      member.isVerified = true;
      await member.save();
  
      res.status(200).json({
        message: "Member approved successfully",
        data: member,
      });
    } catch (error) {
      console.error("Error approving member:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });



module.exports = router;