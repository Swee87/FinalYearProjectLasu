  
const express = require('express');
const authMiddleware = require("../middleware/authMiddleware");
const Transaction = require('../models/PayStackTransaction');
const SavingsTrack = require('../models/SavingsTrack');
const UserSavings = require('../models/UsersTotalSavings');
require('dotenv').config();
const cors = require('cors');
const app = express();
const router = express.Router();

app.use(cors({
  origin: 'http://localhost:5173',
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control']
}));

app.use(express.json());

// SSE clients array
const clients = [];

// Notify all admin clients
function notifyAdmins(transaction) {
  clients.forEach((res) => {
    res.write(`data: ${JSON.stringify(transaction)}\n\n`);
  });
}

///////USERS/////////////
router.post('/initialize-payment', authMiddleware('user'), async (req, res) => {
  const { email, amount } = req.body;
  if (!email || !amount || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: "Invalid amount or email" });
  }
  try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      },
      body: JSON.stringify({ amount: amount * 100, email, callback_url: 'http://localhost:5173/paystack-callback' })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Paystack error: ' + errorText);
    }

    const data = await response.json();
    const { authorization_url, access_code, reference } = data.data;

    return res.status(200).json({
      message: data.message,
      data: {
        authorization_url,
        access_code,
        reference
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not complete transaction', details: err.message });
  }
});

router.get('/verify-payment/:reference', authMiddleware('user'), async (req, res) => {
  const { reference } = req.params;
  const userId = req.user._id;

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Paystack error: ' + errorText);
    }

    const { data, message } = await response.json();

    const existing = await Transaction.findOne({ reference });
    if (existing) {
      return res.status(200).json({ message: 'Transaction already exists', transaction: existing });
    }

    const transaction = new Transaction({
      user: userId,
      paystackId: data.id,
      reference: data.reference,
      status: data.status,
      gatewayResponse: data.gateway_response,
      channel: data.channel,
      currency: data.currency,
      ipAddress: data.ip_address,
      amount: data.amount,
      requestedAmount: data.requested_amount,
      fees: data.fees,
      paidAt: data.paid_at,
      createdAtPaystack: data.created_at,
      transactionDate: data.transaction_date,
      authorization: data.authorization,
      customer: data.customer,
      metadata: data.metadata
    });

    try {
      await transaction.save();
    } catch (err) {
      if (err.code === 11000) {
        return res.status(200).json({ message: 'Duplicate transaction skipped' });
      }
      throw err;
    }

    notifyAdmins(transaction);

    // Save to SavingsTrack if successful
    if (data.status === 'success') {
      const now = new Date();
      const monthName = now.toLocaleString('default', { month: 'long' });
      const year = now.getFullYear();

      const existingTrack = await SavingsTrack.findOne({
        user: userId,
        'payments.month': monthName,
        'payments.year': year
      });

      if (!existingTrack) {
        await SavingsTrack.findOneAndUpdate(
          { user: userId },
          {
            $push: {
              payments: {
                month: monthName,
                year,
                amountPaid: data.amount / 100,
                datePaid: now,
                paidPerMonth: true
              }
            }
          },
          { upsert: true, new: true }
        );
      }

      // Update total savings
      try {
        const updated = await UserSavings.findOneAndUpdate(
          { user: userId },
          {
            $inc: {
              totalSaved: data.amount / 100,
              withdrawableBalance: data.amount / 100
            },
            $set: {
              lastUpdated: new Date()
            }
          },
          { upsert: true, new: true }
        );

        console.log("Updated UserSavings:", updated);
      } catch (err) {
        console.error("Failed to update UserSavings:", err.message);
      }
    }
    return res.status(200).json({ message: 'Transaction verified and savings updated', data: transaction });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Verification failed', details: err.message });
  }
});

/////THIS IS FOR ADMIN /////
router.get('/admin/transactions', authMiddleware('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Transaction.countDocuments();

    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

router.get('/admin/subscribe', authMiddleware('admin'), (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  clients.push(res);

  req.on('close', () => {
    const index = clients.indexOf(res);
    if (index !== -1) clients.splice(index, 1);
  });
});

module.exports = router;


