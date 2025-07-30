    const express = require('express');
    const paystack = require('paystack-api')('sk_test_e0519a8c817f057e4400116d2740c76ff65917c7');
    const app = express();
    const router = express.Router();
    
    app.use(express.json());
    
    router.post('/initialize-payment', async (req, res) => {
      try {
        const { fullName, amount, email, phoneNumber } = req.body;
        const transaction = await paystack.transaction.initialize({
          amount: amount * 100, // Amount in kobo
          fullName: fullName,
          email: email,
          phoneNumber: phoneNumber,
        });
        res.json(transaction.data.authorization_url);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to initialize payment' });
      }
    });

    module.exports = router;


