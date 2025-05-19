//EVERYTHING HERE IS BASED ON THE GOOGLE AUTHENTICATION FOR ONE-OFF MEMBER WHO MAY BUY PRODUCTS
const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const client = new OAuth2Client(process.env.CLIENT_ID); // Changed to CLIENT_ID for consistency


const cors = require('cors');

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control']
};


function generateJWT(user) {
  return jwt.sign(
      {
          id: user._id,
          email: user.email,
          role: user.role || 'user'
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' } // Force 1 minute expiration
  );
}

// Google OAuth endpoint
router.post('/home', async (req, res) => {
    try {
        const { token } = req.body;
        console.log('Received token:', token); // Log the incoming token for debugging
        if (!token) {
            return res.status(400).json({ 
                success: false,
                message: 'Google token is required' 
            });
        }

        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.CLIENT_ID,
        });
          console.log('Google token verified:', ticket); // Log the verification result
        const payload = ticket.getPayload();
        
        if (!payload?.sub || !payload?.email) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Google token payload'
            });
        }

        // Find or create user
        let user = await User.findOneAndUpdate(
            { googleId: payload.sub },
            { $setOnInsert: { 
                googleId: payload.sub,
                email: payload.email,
                isVerified: true,
                FirstName: payload.given_name || '',
                picture: payload.picture || '',
                LastName: payload.family_name || '',
            }},
            { 
                upsert: true,
                new: true 
            }
        );

        // Generate JWT
        const jwtToken = generateJWT(user);
        console.log("Generated JWT:", jwtToken); // Log the generated JWT
       
        const isProduction = process.env.NODE_ENV === 'production';

res.cookie('authtoken', jwtToken, {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'None' : 'Lax',
  maxAge: 1000 * 60 * 60 * 24,
  path: '/'
});


        // res.cookie('authtoken', jwtToken, {
        //     httpOnly: true,
        //     secure: false, // FORCE DISABLE IN DEVELOPMENT
        //     sameSite: 'Lax', // REQUIRED FOR CROSS-ORIGIN
        //     maxAge: 1000 * 60 * 60 * 24,
        //     path: '/'
        //   });
    // Remove domain for localhost (it breaks cookies in some browsers)
     

        
        // Return response
        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                picture: user.picture
            },
            token: jwtToken // Optional for clients that need it
        });

    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Current user endpoint
router.get('/current', cors(corsOptions), async (req, res) => {
    console.log('Current user request received'); // Log the request
    console.log('Cookies:', req.cookies); // Log the cookies for debugging
  try {
      const token = req.cookies.authtoken;
      
      if (!token) {
          return res.status(401).json({ 
              success: false,
              message: 'Not authenticated' 
          });
      }

      // Verify token and handle expiration explicitly
      let decoded;
      try {
          decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (error) {
          // Clear the invalid/expired token cookie
          res.clearCookie('authtoken', {
              path: '/',
              httpOnly: true,
              secure: false,
              sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
          });
          
          if (error.name === 'TokenExpiredError') {
              return res.status(401).json({
                  success: false,
                  message: 'Session expired',
                  expiredAt: error.expiredAt
              });
          }
          return res.status(401).json({
              success: false,
              message: 'Invalid token'
          });
      }

      const user = await User.findById(decoded.id)
          .select('_id email name picture role');
      
      if (!user) {
          return res.status(401).json({
              success: false,
              message: 'User not found'
          });
      }

      res.json({
          success: true,
          user: {
              id: user._id,
              email: user.email,
              name: user.name,
              picture: user.picture,
              role: user.role
          }
      });

  } catch (error) {
      console.error('Auth check error:', error);
      res.status(500).json({
          success: false,
          message: 'Authentication error'
      });
  }
});


router.post('/refreshToken', cors(corsOptions),async (req, res) => {
  try {
      const oldToken = req.cookies.authtoken;
      console.log('Received old token:', oldToken); // Log the incoming token for debugging
      if (!oldToken) {
          return res.status(401).json({ 
              success: false,
              message: 'No token provided' 
          });
      }

      // Verify token while ignoring expiration
      const decoded = jwt.verify(oldToken, process.env.JWT_SECRET, { ignoreExpiration: true });
      
      // Check if user still exists
      const user = await User.findById(decoded.id);
      if (!user) {
          return res.status(401).json({
              success: false,
              message: 'User no longer exists'
          });
      }

      // Generate new token
      const newToken = generateJWT(user);
      
      // Set new cookie
    //   res.cookie('authtoken', newToken, {
    //       httpOnly: true,
    //       secure: process.env.NODE_ENV === 'production',
    //       sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    //       maxAge: 60000, // 1 minute
    //       path: '/'
    //   });
     res.cookie('authtoken', newToken, {
      httpOnly: true,
      secure: false, // FORCE DISABLE SECURE
      sameSite: 'lax',
      maxAge: 60000,
      path: '/',
      domain: 'localhost' // EXPLICIT DOMAIN
    });

      res.json({ 
          success: true,
          user: {
              id: user._id,
              email: user.email,
              name: user.name
          }
      });

  } catch (error) {
      console.error('Refresh error:', error);
      res.clearCookie('authtoken');
      res.status(401).json({
          success: false,
          message: 'Invalid token'
      });
  }
});

  // Add this to your auth.js router
router.post('/logout', (req, res) => {
  res.clearCookie('authtoken', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.json({ success: true, message: 'Logged out successfully' });
});
module.exports = router;





