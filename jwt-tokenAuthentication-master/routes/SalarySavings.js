// routes/salarySavings.js

const express = require('express');
const router = express.Router();
const CooperativeMember = require('../models/CoopMembers');
const User = require('../models/User');
const SavingsTrack = require('../models/SavingsTrack');
const authMiddleware = require('../middleware/authMiddleware');
const UserSavingsTotal = require('../models/UsersTotalSavings')
/**
 * @route   GET /SalarySavings/SavingsBySalary
 * @desc    Retrieve all verified users saving with salary (enum: 'salary')
 * @access  Admin only
 */
router.get('/SavingsBySalary', authMiddleware('admin'), async (req, res) => {
  try {
    // Step 1: Find all verified cooperative members saving via 'salary'
    const salarySavers = await CooperativeMember.find({
      isVerified: true,
      SavingsType: 'salary', 
    })
      .populate('userId', 'FirstName LastName email isVerified role')
      .select('appId memberId userId monthlySavings bankName accountNumber staffType phoneNumber verifiedAt')
;

    if (!salarySavers.length) {
      return res.status(404).json({ message: 'No verified salary savers found.' });
    }

    // Step 2: Attach optional savings tracking info
    const results = await Promise.all(
      salarySavers.map(async (member) => {
        const savingsTrack = await SavingsTrack.findOne({ user: member.userId._id });
        return {
          user: member.userId,
          monthlySavings: member.monthlySavings,
          bankName: member.bankName,
          accountNumber: member.accountNumber,
          memberID : member.memberId,
          appId: member.appId,
          staffType: member.staffType,
          phoneNumber: member.phoneNumber,
          verifiedAt: member.verifiedAt,
          savingsTrack: savingsTrack || null,
        };
      })
    );
  
    res.status(200).json({
      message: 'Verified salary savers retrieved successfully.',
      data: results,
    });

  } catch (error) {
    console.error('Error fetching salary savers:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update payment status with validation
router.patch('/:userId', authMiddleware('admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { month, year, amountPaid } = req.body;

    if (!month || !year || amountPaid === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let savingsTrack = await SavingsTrack.findOne({ user: userId });

    if (!savingsTrack) {
      savingsTrack = new SavingsTrack({ user: userId, payments: [] });
    }

    let delta = amountPaid;
    const existingPaymentIndex = savingsTrack.payments.findIndex(
      p => p.month === month && p.year === year
    );

    if (existingPaymentIndex > -1) {
      const existingPayment = savingsTrack.payments[existingPaymentIndex];
      delta = amountPaid - (existingPayment.amountPaid || 0);

      Object.assign(savingsTrack.payments[existingPaymentIndex], {
        amountPaid,
        paidPerMonth: amountPaid > 0,
        datePaid: amountPaid > 0 ? new Date() : null
      });
    } else {
      savingsTrack.payments.push({
        month,
        year,
        amountPaid,
        paidPerMonth: amountPaid > 0,
        datePaid: amountPaid > 0 ? new Date() : null
      });
    }

    const updateUserSavings = await UserSavingsTotal.findOneAndUpdate(
      { user: userId },
      {
        $inc: {
          totalSaved: delta,
          withdrawableBalance: delta
        },
        $set: {
          lastUpdated: new Date()
        }
      },
      { upsert: true, new: true }
    );

    const updatedTrack = await savingsTrack.save();

    return res.status(200).json({
      message: 'Payment status updated successfully',
      savingsTrack: updatedTrack,
      userSavings: updateUserSavings
    });

  } catch (error) {
    console.error('Payment update error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// router.patch('/:userId', authMiddleware('admin'), async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { month, year, amountPaid } = req.body;
    
//     // Validate input
//     if (!month || !year || amountPaid === undefined) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }
    
//     // Find or create savings track
//     let savingsTrack = await SavingsTrack.findOne({ user: userId });
    
//     if (!savingsTrack) {
//       savingsTrack = new SavingsTrack({ user: userId, payments: [] });
//     }
    
//     // Find existing payment for month/year
//     const paymentIndex = savingsTrack.payments.findIndex(
//       p => p.month === month && p.year === year
//     );
    
//     // Update or add payment
//     if (paymentIndex > -1) {
//       savingsTrack.payments[paymentIndex] = {
//         month,
//         year,
//         amountPaid,
//         paidPerMonth: amountPaid > 0,
//         datePaid: amountPaid > 0 ? new Date() : null
//       };
//     } else {
//       savingsTrack.payments.push({
//         month,
//         year,
//         amountPaid,
//         paidPerMonth: amountPaid > 0,
//         datePaid: amountPaid > 0 ? new Date() : null
//       });
//     }

//     const updateUserSavings = await UserSavingsTotal.findOneAndUpdate(
//       {user: userId},
//       {
//       $inc: {
//         totalSaved: amountPaid,
//         withdrawableBalance:amountPaid
//       },
//       $set: {
//         lastUpdated: new Date()
//       }
//     },
//     { upsert: true, new: true }

//     )
//     console.log(updateUserSavings)
    
//     // Save and return updated document
//     const updated = await savingsTrack.save();
//     res.status(200).json({
//       message: 'Payment status updated',
//       savingsTrack: updated
//     });
    
//   } catch (error) {
//     console.error('Payment update error:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

module.exports = router;
