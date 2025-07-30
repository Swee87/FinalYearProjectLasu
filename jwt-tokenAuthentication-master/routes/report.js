// const express = require('express');
// const router = express.Router();
// const cors = require('cors');
// const helmet = require('helmet');

// const authMiddleware = require('../middleware/authMiddleware');
// const UserSavings = require('../models/UsersTotalSavings');
// const CooperativeMember = require('../models/CoopMembers');
// const SavingsTrack = require('../models/SavingsTrack');
// const User = require('../models/User');
// const Loan = require('../models/Loan');
// const LoanTrack = require('../models/LoanTrack');
// // const app = express();
// // app.use(cors({
// //   origin: "http://localhost:5173",  // Your frontend's address
// //   methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"], // Allow PATCH
// //   credentials: true, // Allow cookies
// // }));
// // @route   GET /api/users/report
// // @desc    Fetch comprehensive financial report for a user
// // @access  Private

// router.get('/ping', (req, res) => {
//   res.json({ msg: "Ping success from /report" });
// });


// router.get('/userReport', authMiddleware('user'), async (req, res) => {
//   const userId = req.user._id;
//   console.log('User ID:', userId);

//   try {
//     const [
//       userReportDetails,
//       cooperativeMembers,
//       savingsTracks
//     ] = await Promise.all([
//       UserSavings.findOne({ user: userId }).populate({ path: 'user', select: 'FirstName LastName email ' }).lean(),
//       CooperativeMember.find({ userId }).lean(),
//       SavingsTrack.find({ user: userId }).lean()
//     ]);

//     const memberIds = cooperativeMembers.map(member => member._id);

//     const [loans, loanTracks] = await Promise.all([
//       Loan.find({ member: { $in: memberIds } })
//         .populate('member', 'memberId monthlySavings SavingsType phoneNumber appId staffType')
//         .lean(),
//       LoanTrack.find({ userDetails: userId })
//         .populate('loan', 'loanAmount monthlySavings repaymentAmount repayment about')
//         .lean()
//     ]);

   
//     const defaultUserReport = {
//       user: {
//         FirstName: req.user.firstName || 'N/A',
//         LastName: req.user.lastName || 'N/A',
//         email: req.user.email || 'N/A'
//       },
//       totalSaved: 0,
//       withdrawableBalance: 0,
//       lastUpdated: new Date()
//     };

//     return res.status(200).json({
//       success: true,
//       data: {
//         userReport: userReportDetails || defaultUserReport,
//         cooperativeMembers: cooperativeMembers || [],
//         savingsTracks: savingsTracks || [],
//         loans: loans || [],
//         loanTracks: loanTracks || []
//       }
//     });

//   } catch (error) {
//     console.error('Error fetching user report:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Server Error',
//       error: error.message
//     });
//   }
// });


// module.exports = router;
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const UserSavings = require('../models/UsersTotalSavings');
const CooperativeMember = require('../models/CoopMembers');
const SavingsTrack = require('../models/SavingsTrack');
const Loan = require('../models/Loan');
const LoanTrack = require('../models/LoanTrack');
const User = require ('../models/User')

router.get('/ping', (req, res) => {
  res.json({ msg: "Ping success from /report" });
});

// router.get('/userReport', authMiddleware('user'), async (req, res) => {
//   const userId = req.user._id;
//   console.log('User ID:', userId);

//   try {
//     // Get cooperative membership
//     const cooperativeMembers = await CooperativeMember.find({ userId }).lean();

//     // Get savings tracks
//     const savingsTracks = await SavingsTrack.find({ user: userId }).lean();

//     // Get user's total savings
//     let userReportDetails = await UserSavings.findOne({ user: userId }).populate({
//       path: 'user',
//       select: 'FirstName LastName'
//     }).lean();

//       console.log(userReportDetails)
//     // If no savings record, create a default object using auth data
//     if (!userReportDetails) {
//       userReportDetails = {
//         user: {
//           FirstName:userReportDetails.FirstName || 'N/A',
//           LastName: userReportDetails.LastName || 'N/A',
//           email: req.user.email || 'N/A'
//         },
//         totalSaved: 0,
//         withdrawableBalance: 0,
//         lastUpdated: new Date()
//       };
//     } else {
//       // If savings record exists, add FirstName, LastName, and email manually
//       userReportDetails.user = {
//         FirstName: userReportDetails.FirstName || 'N/A',
//         LastName: userReportDetails.LastName || 'N/A',
//         email: req.user.email || 'N/A'
//       };
//     }

//     // Get member IDs to fetch loans
//     const memberIds = cooperativeMembers.map(member => member._id);

//     // Get loans and their tracking
//     const loans = await Loan.find({ member: { $in: memberIds } })
//       .populate('member', 'memberId monthlySavings SavingsType phoneNumber appId staffType')
//       .lean();

//     const loanTracks = await LoanTrack.find({ userDetails: userId })
//       .populate('loan', 'loanAmount monthlySavings repaymentAmount repayment about')
//       .lean();

//     return res.status(200).json({
//       success: true,
//       data: {
//         userReport: userReportDetails,
//         cooperativeMembers,
//         savingsTracks,
//         loans,
//         loanTracks
//       }
//     });

//   } catch (error) {
//     console.error('Error fetching user report:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Server Error',
//       error: error.message
//     });
//   }
// });


router.get('/userReport', authMiddleware('user'), async (req, res) => {
  const userId = req.user._id;
  console.log('User ID:', userId);

  try {
    // Validate req.user
    if (!req.user || !req.user._id || !req.user.email) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Invalid user data',
      });
    }

    // Fetch data concurrently
    const [cooperativeMembers, savingsTracks, userReportDetails, user] = await Promise.all([
      CooperativeMember.find({ userId }).lean(),
      SavingsTrack.find({ user: userId }).lean(),
      UserSavings.findOne({ user: userId })
        .populate({
          path: 'user',
          select: 'FirstName LastName',
        })
        .lean(),
      User.findById(userId).select('FirstName LastName email').lean(), // Fetch user for FirstName/LastName
    ]);

    // Construct userReportDetails
    let formattedUserReportDetails;
    if (!userReportDetails) {
      formattedUserReportDetails = {
        user: {
          FirstName: user?.FirstName || 'N/A',
          LastName: user?.LastName || 'N/A',
          email: req.user.email || 'N/A',
        },
        totalSaved: 0,
        withdrawableBalance: 0,
        lastUpdated: new Date(),
      };
    } else {
      formattedUserReportDetails = {
        ...userReportDetails,
        user: {
          FirstName: userReportDetails.user?.FirstName || user?.FirstName || 'N/A',
          LastName: userReportDetails.user?.LastName || user?.LastName || 'N/A',
          email: req.user.email || 'N/A',
        },
      };
    }

    // Get member IDs to fetch loans
    const memberIds = cooperativeMembers.map((member) => member._id);

    // Fetch loans and loan tracks concurrently
    const [loans, loanTracks] = await Promise.all([
      Loan.find({ member: { $in: memberIds } })
        .populate('member', 'memberId monthlySavings SavingsType phoneNumber appId staffType')
        .lean(),
      LoanTrack.find({ userDetails: userId })
        .populate('loan', 'loanAmount monthlySavings repaymentAmount repayment about')
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        userReport: formattedUserReportDetails,
        cooperativeMembers,
        savingsTracks,
        loans,
        loanTracks,
      },
    });
  } catch (error) {
    console.error('Error fetching user report:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
});

module.exports = router;

