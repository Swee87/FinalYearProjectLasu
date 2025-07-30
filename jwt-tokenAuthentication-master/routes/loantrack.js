const express = require('express');
const Loan = require('../models/Loan');
const LoanTrack = require('../models/LoanTrack');
const cors = require('cors');
const CooperativeMember = require('../models/CoopMembers');
const app = express();
const authMiddleware = require("../middleware/authMiddleware");
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));
const router = express.Router();

router.get('/trackedLoans', authMiddleware('admin'), async (req, res) => {
  try {
    const trackedLoans = await Loan.find({ LoanPaid: 'not_paid' }).populate({
      path: 'member',
      model: 'CooperativeMember',
      select: 'memberId isVerified userId phoneNumber bankName accountNumber staffType payMentProof appId',
      populate: {
        path: 'userId',
        model: 'User',
        select: 'FirstName LastName email',
      },
    }).lean();

    const tracked = trackedLoans.filter((loan) => {
      return loan.member && loan.member.isVerified && loan.member.userId;
    });

    // Get all corresponding LoanTrack documents
    const loanIds = tracked.map(loan => loan._id);
    const loanTracks = await LoanTrack.find({ loan: { $in: loanIds } }).lean();

    const formattedTrackedLoans = tracked.map((loan) => {
      const track = loanTracks.find(t => t.loan.toString() === loan._id.toString());

      return {
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
        payments: track?.payments || []  // Include payments
      };
    });
    console.log(JSON.stringify(formattedTrackedLoans, null, 2)); // Just before return res.status(200)...

    return res.status(200).json({
      success: true,
      message: 'Tracked Loans fetched successfully',
      data: formattedTrackedLoans,
    });
  } catch (err) {
    console.error('Error fetching tracked Loans:', err);
    return res.status(500).json({
      success: false,
      message: 'We could not fetch the tracked loans at this time.',
      error: err.message,
    });
  }
});


router.get('/loan-track/:loanId', authMiddleware('admin'), async (req, res) => {
  try {
    const loanTrack = await LoanTrack.findOne({ loan: req.params.loanId });
    
    if (!loanTrack) {
      return res.status(404).json({ 
        success: false, 
        message: 'Loan track not found' 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      data: {
        payments: loanTrack.payments,
        _id: loanTrack._id
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/update-payment', authMiddleware('admin'), async (req, res) => {
  try {
    const { loanId, month, year, repaymentAmount } = req.body;

    console.log('Received update request:', { loanId, month, year, repaymentAmount });

    const loanTrack = await LoanTrack.findOne({ loan: loanId });
    if (!loanTrack) {
      return res.status(404).json({
        success: false,
        message: 'LoanTrack not found',
      });
    }

    const paymentIndex = loanTrack.payments.findIndex(
      (p) => p.month === month && p.year === year
    );

    if (paymentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Matching payment not found',
      });
    }

    // Update the specific payment fields
    loanTrack.payments[paymentIndex].paidPerMonth = true;
    loanTrack.payments[paymentIndex].amountPaid = repaymentAmount;
    loanTrack.payments[paymentIndex].datePaid = new Date();

    // Save the entire document
    const updatedTrack = await loanTrack.save();

    // Check if all months are paid
    const allPaid = updatedTrack.payments.every((p) => p.paidPerMonth);
    if (allPaid) {
      await Loan.findByIdAndUpdate(loanId, { LoanPaid: 'paid' });
    }

    res.status(200).json({
      success: true,
      message: 'Payment updated successfully',
      loanTrack: updatedTrack,
    });
  } catch (err) {
    console.error('Error updating payment:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});
 /////ADMIN LEDGER ROUTES//////
 router.get('/admin-ledger', authMiddleware('admin'), async (req, res) => {
  try {
    const loanTracks = await LoanTrack.find()
      .populate({
        path: 'loan',
        populate: {
          path: 'member',
          model: 'CooperativeMember',
          select: 'memberId phoneNumber bankName accountNumber staffType isVerified appId'
        }
      })
      .populate({
        path: 'userDetails',
        model: 'User',
        select: 'FirstName LastName email'
      });

    console.log('Fetched loan tracks:', JSON.stringify(loanTracks, null, 2));

    if (!loanTracks || loanTracks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No loan tracks found',
      });
    }

    res.status(200).json({
      success: true,
      data: loanTracks,
    });
  } catch (err) {
    console.error('Error fetching admin ledger:', err);
    res.status(500).json({
      success: false,
      message: 'We could not fetch the admin ledger at this time.',
      error: err.message,
    });
  }
});

module.exports = router;