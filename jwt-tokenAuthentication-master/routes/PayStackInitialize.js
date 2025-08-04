    const https = require('https');
    const mongoose = require('mongoose');
    const express = require('express');
    const router = express.Router();
    require('dotenv').config();
    const Transaction = require('../models/PayStackTransaction');


   mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Mongo error:', err));

    // Initialize Payment
 router.post('/initialize-payment', function(req, res){

 const { fullName, email, phoneNumber, amount } = req.body;

    
  const params = JSON.stringify({
        "fullName": fullName,
        "email": email,
        "phoneNumber": phoneNumber,
        "amount": amount * 100, // Amount in kobo
  })
  
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/transaction/initialize',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    }

    
    const reqPayStack = https.request(options, resPayStack => {
      let data = ''
    
      resPayStack.on('data', (chunk) => {
        data += chunk
      });
    
      resPayStack.on('end', () => {
        const parsedData = JSON.parse(data);
        console.log("Backend Paystack Response:", parsedData); // Confirm it's correct
        res.json(parsedData); // <- Send JSON, not string
       })
    }).on('error', error => {
      console.error(error)
    })
    
    reqPayStack.write(params)
    reqPayStack.end()
});

module.exports = router;