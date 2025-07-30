const express = require('express');
const Loan = require('../models/Loan');
const LoanTrack = require('../models/LoanTrack');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const { query, validationResult } = require("express-validator");
const SavingsTrack = require('../models/SavingsTrack')
const { Parser } = require("json2csv");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const { PassThrough } = require("stream");
const LoanAction = require('../models/LoanAction')
const cors = require('cors');
const CooperativeMember = require('../models/CoopMembers');
const User = require('../models/User')
const { createLoanTrack } = require('./createLoanTrack'); // Import the function to create loan track
const app = express();
const authMiddleware = require("../middleware/authMiddleware");
app.use(cors({
  origin: "http://localhost:5173",  // Your frontend's address
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"], // Allow PATCH
  credentials: true, // Allow cookies
}));
const router = express.Router();

// Rate limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:15, // 5 attempts
  message: 'Too many login attempts. Please try again after 15 minutes.',
});

/**
 * @route GET /api/loans/appliedLoans
 * @desc Get all pending loans from verified cooperative members
 * @access Admin only
 * @route GET /api/loans/appliedLoans
 * @desc Get all pending loans from verified cooperative members
 * @access Admin only
*/
const WORKFLOW = ["pending", "approved", "processing", "disbursed", "ongoing", "completed", "cancelled"];
router.get("/appliedLoans", authMiddleware(["admin",'loan_officer']), loginLimiter,async (req, res) => {
  try {
    const { status } = req.query;
    const userID = req.user._id; // Get the user ID from the authenticated request

    let query = {};
    if (status) {
      if (!WORKFLOW.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Valid statuses: ${WORKFLOW.join(", ")}`,
        });
      }
      query.status = status;
    }
    // Fetch loans based on query
    const pendingLoans = await Loan.find(query)
  .populate({
    path: "member",
    model: "CooperativeMember",
    select:
      "memberId isVerified userId phoneNumber bankName accountNumber staffType payMentProof appId",
    populate: {
      path: "userId",
      model: "User",
      select: "FirstName LastName email",
    },
  })
  .populate({
    path: "approvedBy",
    model: "User",
    select: "FirstName LastName",
  })
  .populate({
    path: "disbursedBy",
    model: "User",
    select: "FirstName LastName",
  });


    // Filter verified members
    const validLoans = pendingLoans.filter(
      (loan) => loan.member?.isVerified && loan.member?.userId
    );

    // Format output
    const formattedLoans = validLoans.map((loan) => ({
      loanRole: loan.role,
      loanId: loan._id,
      loanAmount: loan.loanAmount,
      monthlySavings: loan.monthlySavings,
      repaymentAmount: loan.repaymentAmount,
      loanRepaymentDuration: loan.repayment,  
      repayment: loan.repayment,
      about: loan.about,
      paySlipUrl: loan.paySlipUrl,
      createdAt: loan.created_at,
      updatedAt: loan.updated_at,
      approvedAt: loan.approved_at,
      disbursedAt: loan.disbursed_at,
      dueAt: loan.due_at, 
      status: loan.status,
      loanPaid: loan.LoanPaid,
      member: {
        firstName: loan.member.userId.FirstName,
        lastName: loan.member.userId.LastName,
        email: loan.member.userId.email,
        memberId: loan.member.memberId,
        userId: loan.member.userId._id,
        phoneNumber: loan.member.phoneNumber,
        bankName: loan.member.bankName,
        accountNumber: loan.member.accountNumber,
        staffType: loan.member.staffType,
        payMentProof: loan.member.payMentProof,
        isVerified: loan.member.isVerified,
        appId: loan.member.appId,
      },
      approvedBy: loan.approvedBy ? {
        firstName: loan.approvedBy.FirstName,
        lastName: loan.approvedBy.LastName,
      } : null,
      disbursedBy: loan.disbursedBy ? {
        firstName: loan.disbursedBy.FirstName,
        lastName: loan.disbursedBy.LastName,
      } : null,
    }));

    return res.status(200).json({
      success: true,
      count: formattedLoans.length,
      data: formattedLoans,
      userId: userID, // Include user ID in the response
      message: "Pending loans retrieved successfully.",
    });
  } catch (error) {
    console.error("Error fetching applied loans:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while retrieving pending loans.",
      error: error.message,
    });
  }
});

// Update loan date fields based on new status
async function updateLoanDates(loan, newStatus) {
  console.log(`Updating dates for loan ${loan._id} to status ${newStatus}`);
  if (newStatus === "approved") {
    loan.approved_at = new Date();
    loan.markModified("approved_at");
  } else if (newStatus === "disbursed") {
    loan.disbursed_at = new Date();
    loan.markModified("disbursed_at");
    try {
      await createLoanTrack(loan);
    } catch (err) {
      console.error(`LoanTrack creation failed for loan ${loan._id}:`, err);
    }
    const dueDate = new Date(loan.disbursed_at);
    dueDate.setMonth(dueDate.getMonth() + loan.repayment);
    // Fix for months with fewer days
    if (dueDate.getDate() !== loan.disbursed_at.getDate()) {
      dueDate.setDate(0);
    }
    loan.due_at = dueDate;
    loan.markModified("due_at");
  } else if (newStatus === "ongoing") {
    loan.ongoing_at = new Date();
    loan.markModified("ongoing_at");
  }
}
// Check that status move is valid in workflow
function isValidTransition(currentStatus, nextStatus) {
  const currentIndex = WORKFLOW.indexOf(currentStatus);
  const newIndex = WORKFLOW.indexOf(nextStatus);
  return newIndex === currentIndex + 1;
}
// Define allowed actions by role
const roleStatusPermissions = {
  loan_officer: "approved",
  disburse_officer: "disbursed",
  admin: "all", // admin can perform all actions
};

async function logLoanAction({ loanId, user, role, newStatus }) {
  await LoanAction.create({
    loan: loanId,
    user: user._id,
    role: role,
    status: newStatus,
    timestamp: new Date(),
  });
}
// PATCH /loanAction
router.patch(
  "/loanAction",
  authMiddleware(["loan_officer", "disburse_officer", "admin"]),
  loginLimiter,
  async (req, res) => {
    const { loanIds, newStatus } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Input validation
    if (!Array.isArray(loanIds) || loanIds.length === 0 || !newStatus) {
      return res.status(400).json({
        success: false,
        message: "Invalid input: loanIds and newStatus are required.",
      });
    }
    if (!WORKFLOW.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid target status.",
      });
    }
    // Role-based permission check
    const allowedStatus = roleStatusPermissions[userRole];
    if (allowedStatus !== "all" && allowedStatus !== newStatus) {
      return res.status(403).json({
        success: false,
        message: `Role '${userRole}' is not authorized to set status to '${newStatus}'.`,
      });
    }

    try {
      const adminUser = await User.findById(userId).select("FirstName LastName");
      const updatedLoans = [];
      const errors = [];

  for (const id of loanIds) {
  const loan = await Loan.findById(id);

  if (!loan) {
    errors.push({ id, error: "Loan not found" });
    continue;
  }

  if (!isValidTransition(loan.status, newStatus)) {
    const nextStep = WORKFLOW[WORKFLOW.indexOf(loan.status) + 1];
    errors.push({
      id,
      error: `Invalid transition from '${loan.status}' to '${newStatus}'`,
      allowedNext: nextStep,
    });
    continue;
  }

  loan.status = newStatus;

  if (newStatus === "approved") {
    loan.approvedBy = userId;
    loan.role =  userRole;
    loan.markModified("approvedBy");
  }

  if (newStatus === "disbursed") {
    loan.disbursedBy = userId;
    loan.role =  userRole;
    loan.markModified("disbursedBy");
  }

  await updateLoanDates(loan, newStatus);
  const savedLoan = await loan.save();
  // Add history log here
  await logLoanAction({
    loanId: loan._id,
    user: req.user,
    role: userRole,
    newStatus,
  });
  updatedLoans.push(savedLoan);
}
      res.json({
        success: true,
        message: `${updatedLoans.length} loan(s) updated successfully.`,
        updated: updatedLoans,
        role: userRole,
        userId,
        userName: `${adminUser.FirstName} ${adminUser.LastName}`,
        errors,
      });
    } catch (error) {
      console.error("Loan status update error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while updating loans.",
        error: error.message,
      });
    }
  }
);
router.get(
  "/loan/:id/history",
  authMiddleware(["admin", "loan_officer", "disburse_officer"]),
  [
    query("role").optional().isIn(["admin", "loan_officer", "disburse_officer"]),
    query("status").optional().isIn(["approved", "disbursed", "cancelled", "updated", "commented", 'completed']),
    query("sort").optional().isIn(["asc", "desc"]),
    query("export").optional().isIn(["pdf", "excel"]),
    query("from").optional().isISO8601(),
    query("to").optional().isISO8601(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { role, status, sort = "desc", export: exportType, from, to, page = 1, limit = 10 } = req.query;
    const loanId = req.params.id;
    const filters = { loan: loanId };

    if (role) filters.role = role;
    if (status) filters.status = status;
    if (from || to) filters.timestamp = {};
    if (from) filters.timestamp.$gte = new Date(from);
    if (to) filters.timestamp.$lte = new Date(to);

    try {
  const total = await LoanAction.countDocuments(filters);
  const history = await LoanAction.find(filters)
  .sort({ timestamp: sort === "asc" ? 1 : -1 })
  .skip((page - 1) * limit)
  .limit(parseInt(limit))
  .populate("user", "FirstName LastName email") // Who performed the action
  .populate({
    path: "loan",
    model: "Loan",
    select: "loanAmount repaymentAmount repayment status approvedBy disbursedBy member",
    populate: [
      {
        path: "approvedBy",
        model: "User",
        select: "FirstName LastName email",
      },
      {
        path: "disbursedBy",
        model: "User",
        select: "FirstName LastName email",
      },
      {
        path: "member",
        model: "CooperativeMember",
        select: "memberId phoneNumber accountNumber bankName staffType isVerified appId",
        populate: {
          path: "userId",
          model: "User",
          select: "FirstName LastName email",
        },
      },
    ],
  })
  .lean();

      if (exportType === "pdf") {
        const doc = new PDFDocument();
        const stream = new PassThrough();
        res.setHeader("Content-disposition", "attachment; filename=loan-history.pdf");
        res.setHeader("Content-type", "application/pdf");
        doc.pipe(stream);
        doc.fontSize(14).text("Loan History", { align: "center" }).moveDown();
        history.forEach((h) => {
          doc
            .fontSize(10)
            .text(`User: ${h.user?.FirstName || ""} ${h.user?.LastName || ""}`)
            .text(`Role: ${h.role}`)
            .text(`Action: ${h.status}`)
            .text(`Comment: ${h.comment || "N/A"}`)
            .text(`Timestamp: ${new Date(h.timestamp).toLocaleString()}`)
            .moveDown();
        });
        doc.end();
        stream.pipe(res);
        return;
      }

      if (exportType === "excel") {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Loan History");
        sheet.columns = [
          { header: "Name", key: "name" },
          { header: "Role", key: "role" },
          { header: "Status", key: "status" },
          { header: "Comment", key: "comment" },
          { header: "Timestamp", key: "timestamp" },
        ];

        history.forEach((h) => {
          sheet.addRow({
            name: `${h.user?.FirstName || ""} ${h.user?.LastName || ""}`,
            role: h.role,
            status: h.status,
            comment: h.comment || "",
            timestamp: new Date(h.timestamp).toLocaleString(),
          });
        });

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=loan-history.xlsx");
        await workbook.xlsx.write(res);
        res.end();
        return;
      }

      res.status(200).json({
        success: true,
        count: total,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        data: history,
      });
    } catch (err) {
      console.error("Loan action history error:", err);
      res.status(500).json({
        success: false,
        message: "Server error while fetching loan action history",
        error: err.message,
      });
    }
  }
);


////OLD CODE
// async function updateLoanDates(loan, newStatus) {
//   console.log(`Updating dates for loan ${loan._id} to status ${newStatus}`);
  
//   if (newStatus === "approved") {
//     loan.approved_at = new Date();
//     loan.markModified('approved_at');
//     console.log(`Set approved_at to ${loan.approved_at}`);
//   } else if (newStatus === "disbursed") {
//     loan.disbursed_at = new Date();
//     loan.markModified('disbursed_at');
//     try {
//       await createLoanTrack(loan);
//       console.log(`LoanTrack created for loan ${loan._id}`);
//     } catch (err) {
//       console.error(`Failed to create LoanTrack for loan ${loan._id}:`, err);
//       // Optionally, handle the error, e.g., by throwing it or setting a flag
//     }
//     console.log(`Set disbursed_at to ${loan.disbursed_at}`);
    
//     const dueDate = new Date(loan.disbursed_at);
//     dueDate.setMonth(dueDate.getMonth() + loan.repayment);
//     if (dueDate.getDate() !== loan.disbursed_at.getDate()) {
//       dueDate.setDate(0);
//     }
//     loan.due_at = dueDate;
//     loan.markModified('due_at');
//     console.log(`Set due_at to ${loan.due_at} for ${loan.repayment} months`);
//   } else if (newStatus === "ongoing") {
//     loan.ongoing_at = new Date();
//     loan.markModified('ongoing_at');
//     console.log(`Set ongoing_at to ${loan.ongoing_at}`);
//   }
// }


// function isValidTransition(currentStatus, nextStatus) {
//   const currentIndex = WORKFLOW.indexOf(currentStatus);
//   const newIndex = WORKFLOW.indexOf(nextStatus);
//   return newIndex === currentIndex + 1;
// }

// router.patch("/loanAction", authMiddleware("admin"), async (req, res) => {
//   const { loanIds, newStatus } = req.body;
//   const userId = req.user._id; // Get the user ID from the authenticated request

//   if (!Array.isArray(loanIds) || loanIds.length === 0) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid input: No loan IDs provided.",
//     });
//   }

//   if (!WORKFLOW.includes(newStatus)) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid target status.",
//     });
//   }

//   try {
//     let updatedLoans = [];
//     let errors = [];

//     for (let id of loanIds) {
//       const loan = await Loan.findById(id);
//       console.log("Loan found:", id, loan);

//       if (!loan) {
//         errors.push({ id, error: "Loan not found" });
//         continue;
//       }

//       if (!isValidTransition(loan.status, newStatus)) {
//         errors.push({
//           id,
//           error: `Invalid transition from "${loan.status}" to "${newStatus}"`,
//           allowedNext: [WORKFLOW[WORKFLOW.indexOf(loan.status) + 1]],
//         });
//         continue;
//       }
//       // Update status and timestamps before saving
//       loan.status = newStatus;
//       // Update date fields based on new status
//       updateLoanDates(loan, newStatus);

//       const updatedLoan = await loan.save();
//       updatedLoans.push(updatedLoan);
//     }

//     return res.json({
//       success: true,
//       message: `${updatedLoans.length} loans updated successfully.`,
//       updated: updatedLoans,
//       userId: userId,
//       errors,
//     });

//   } catch (error) {
//     console.error("Error updating loan statuses:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error while updating loans.",
//       error: error.message,
//     });
//   }
// });

// this section is for determining if a user is eligible for a loan
router.get("/eligibleForLoan", authMiddleware("user"),  async (req, res) => {
  try {
    const userID = req.user._id;
    // 1. Check member verification
    const member = await CooperativeMember.findOne({ userId: userID });
    console.log(member)
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }
    if (!member.isVerified) {
      return res.status(403).json({
        success: false,
        message: "You are not eligible for a loan. Please verify your account first.",
         eligibility: false,
      });
    }

    // 2. Check savings
    const savingsTrack = await SavingsTrack.findOne({ user: userID });
    console.log(savingsTrack)
    if (!savingsTrack || !Array.isArray(savingsTrack.payments)) {
      return res.status(403).json({
        success: false,
        message: "You are not eligible for a loan. No savings record found.",
         eligibility: false,
      });
    }

    const paidMonths = savingsTrack.payments.filter(p => p.paidPerMonth === true);
    console.log('paidMonths',paidMonths)

    if (paidMonths.length < 6) {
      return res.status(403).json({
        success: false,
        message: "You are not eligible for a loan. At least 6 months of savings is required.",
         eligibility: false,
      });
    }

    // 3. Check if most recent savings is within last 6 months
    const recentSavings = paidMonths
      .filter(p => p.datePaid)
      .sort((a, b) => new Date(b.datePaid) - new Date(a.datePaid));
      console.log('recentSavings',recentSavings)

    if (recentSavings.length === 0) {
      return res.status(403).json({
        success: false,
        message: "You are not eligible for a loan. No recent savings found.",
         eligibility: false,
      });
    }

    const lastPaidDate = new Date(recentSavings[0].datePaid);
    console.log('lastPaidDate',lastPaidDate)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    if (lastPaidDate < sixMonthsAgo) {
      return res.status(403).json({
        success: false,
        message: "You are not eligible for a loan. Your last savings was over 6 months ago.",
         eligibility: false,
      });
    }

    // 4. Check loan repayment
    const loan = await Loan.findOne({ member: member._id });

    if (loan && loan.loanPaid === "not_paid") {
      return res.status(403).json({
        success: false,
        message: "You are not eligible for a loan. Please repay your previous loan first.",
         eligibility: false,
      });
    }
      console.log("User is eligible for loan", { userID });

    //  Passed all checks
    return res.status(200).json({
      success: true,
      message: "You are eligible for a loan.",
      eligibility: true,
    });
    

  } catch (error) {
    console.error("Error checking loan eligibility:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while checking loan eligibility.",
    });
  }
});

// router.get("/eligibleForLoan", authMiddleware("user"),loginLimiter, async (req,res)=>{
//   try{
//     const userID = req.user._id
//     const member = await CooperativeMember.findOne({userId: userID})
//     if(!member){
//       return res.status(404).json({
//         success: false,
//         message: "Member not found.",
//       })
//     }
//     if(!member.isVerified){
//       res.status(403).json({
//         success: false,
//         message: "You are not eligible for a loan. Please verify your account first.",
//       })
//     }
//     const loanEligibility = await Loan.findOne({ member: member._id})  
//     if(loanEligibility && loanEligibility.loanPaid === 'paid' ){
//       return res.status(200).json({
//         success:true,
//         message: "You are eligible for a loan.",
//         eligibility : true,
//       })
//     }
//     if(loanEligibility && loanEligibility.loanPaid === 'not_paid'){
//       return res.status(200).json({
//         success:true,
//         message: "You are not eligible for a loan. Please pay your previous loan first.",
//         eligibility : false,
//       })
//     }

//   }catch(error){
//     console.error("Error checking loan eligibility:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error while checking loan eligibility.",
//       error: error.message,
//     });
//   }
// })

///THIS SECTION FOR GETTING ALL LOANS FOR A USER

router.get("/getAllUserLoans", authMiddleware("user"),loginLimiter, async (req, res) => {
function convertCurrencyString(currencyStr) {
    // Check if currencyStr is valid and convert to string
    if (currencyStr == null || currencyStr === undefined) {
        throw new Error("Invalid input: currencyStr is null or undefined");
    }
    const str = String(currencyStr); // 
    const cleanedStr = str.replace(/[^0-9.-]+/g, '');
    const value = parseFloat(cleanedStr);
    return value
} 
  try {
    const userID = req.user._id;
    const member = await CooperativeMember.findOne({ userId: userID });
    // Get all loans tied to the user
    const loans = await Loan.find({ member: member })
      .populate("member", "memberId")
      .lean();

    if (!loans || loans.length === 0) {
      return res.status(200).json({
        success: true,
        loans: [],
        message: "No loans found for this user.",
      });
    }
    // Fetch corresponding LoanTrack data for each loan
    const trackedLoans = await Promise.all(
      loans.map(async (loan) => {
        const track = await LoanTrack.findOne({ loan: loan._id }).lean();
        const payments = track?.payments || [];
        const totalPaid = payments
          .filter((p) => p.paidPerMonth)
          .reduce((sum, p) => sum + convertCurrencyString(p.amountPaid), 0);
        return {
          loanId: loan._id,
          loanAmount: loan.loanAmount,
          repayment: loan.repayment,
          repaymentAmount: loan.repaymentAmount,
          LoanPaid: loan.LoanPaid,
          status: loan.status,
          createdAt: loan.created_at,
          totalPaid: totalPaid.toFixed(2),
          monthlyBreakdown: payments.map((p) => ({
            month: p.month,
            year: p.year,
            amountPaid: p.amountPaid,
            paidPerMonth: p.paidPerMonth,
          })),
        };
      })
    );

    return res.status(200).json({
      success: true,
      loans: trackedLoans,
    });
  } catch (error) {
    console.error("Error fetching user loans:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching user loans.",
      error: error.message,
    });
  }
});


module.exports = router;