require("dotenv").config();
const express = require('express');
const router = express.Router();
const cors = require('cors');
const authMiddleware = require("../middleware/authMiddleware");
const app = express();
app.use(cors({
    origin: "http://localhost:5173",  // Your frontend's address
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"], // Allow PATCH
    credentials: true, // Allow cookies
    allowedHeaders: ['Content-Type', 'Authorization']
}))

router.get("/bankList", authMiddleware("user"), async (req, res) => {
    try{
        const response  = await fetch("https://api.paystack.co/bank",{
            method:'GET',
            headers:{
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        })
        if(!response.ok){
            const errorData = await response.json().catch(()=> ({}))
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Bank list fetched successfully:", data);

        res.status(200).json({data : data.data});

    }catch(err){
        console.error("Error fetching bank list:" + err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

// "https://api.paystack.co/bank/resolve?account_number=0022728151&bank_code=063"
// In your backend route
router.get("/VerifyBank_Account", authMiddleware("user"), async (req, res) => {
  try {
    const { account_number, bank_code } = req.query;
    
    const response = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const { data } = await response.json();
    res.status(200).json({ name: data.account_name }); // Return account name directly

  } catch (err) {
    console.error("Error verifying account:", err.message);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});
module.exports = router;