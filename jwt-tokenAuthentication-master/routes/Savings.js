// --- routes/savingsRoutes.js ---
const express = require('express');
const router = express.Router();
const SavingsTrack = require('../models/SavingsTrack');
const authMiddleware = require('../middleware/authMiddleware');
 const UserSavings = require('../models/UsersTotalSavings');
const CoopMembers = require('../models/CoopMembers'); 
const User = require('../models/User');

const app = express();
    require('dotenv').config();
    const cors = require('cors');
    app.use(cors({
           origin: 'http://localhost:5173',
            methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
          allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control']
        }));
    
    app.use(express.json());

// GET savings track for a user
router.get('/user-savings', authMiddleware('user'), async (req, res) => {
  try {
    const userId = req.user._id;
    const savings = await SavingsTrack.findOne({ user: userId });

    if (!savings) {
      return res.status(200).json({ message: 'No savings record found', data: [] });
    }

    res.status(200).json({ message: 'Savings record fetched', data: savings });
    console.log('Savings record fetched successfully:', savings);
  } catch (error) {
    console.error('Error fetching savings:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

router.get('/totalSavingsWithdrawable', authMiddleware('user'), async (req, res) => {
  const userId = req.user._id;

  try {
    const userSavings = await UserSavings.findOne({ user: userId });
    if (!userSavings) {
      return res.status(404).json({ message: 'User savings not found' });
    }

   console.log("UserSavings data:", userSavings);
    res.status(200).json({ data: userSavings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user savings', details: err.message });
  }
});
// ADMIN: Get all savings records (paginated)
router.get('/admin-savings', authMiddleware('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const savings = await SavingsTrack.find()
      .populate('user', 'FirstName LastName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const coopMembers = await CoopMembers.find().lean();
    const total = await SavingsTrack.countDocuments();

    res.status(200).json({
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalSavings: total
      },
      data: {
        savings,
        coopMembers
      }
    });
  } catch (error) {
    console.error('Error fetching admin savings:', error);
    res.status(500).json({
      error: 'Server error',
      details: error.message
    });
  }
});



module.exports = router;
