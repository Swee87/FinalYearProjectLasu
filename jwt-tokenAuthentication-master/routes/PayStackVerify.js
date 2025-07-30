const Transaction = require('../models/PayStackTransaction');
const https = require('https');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
require('dotenv').config();


mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('Mongo error:', err));

router.get("/verify-payment/:reference", (req, res) => {
  const reference = req.params.reference;

  const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: `/transaction/verify/${reference}`,
    method: "GET",
    headers: {
      Authorization: `Bearer YOUR_SECRET_KEY`,
    },
  };

  const paystackReq = https.request(options, (paystackRes) => {
    let data = "";

    paystackRes.on("data", (chunk) => {
      data += chunk;
    });

    paystackRes.on("end", () => {
      const parsedData = JSON.parse(data);

      // Save to DB here if status is success
      if (parsedData.data.status === "success") {
        // Save transaction details to DB (e.g., email, amount, reference)
         Transaction.create({
              fullName: data.fullName,
              email: data.email,
              phoneNumber: data.phoneNumber,
              amount: data.amount / 100,
              reference: data.reference,
              status: data.status
            });
        
      }

      res.send(parsedData);
    });
  });

  paystackReq.on("error", (error) => {
    console.error(error);
    res.status(500).send({ status: false, message: "Verification failed" });
  });

  paystackReq.end();
});

module.exports = router;