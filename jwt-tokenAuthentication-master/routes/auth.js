const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const client = new OAuth2Client(process.env.CLIENT_ID);

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization','Cache-Control'],
};

function generateJWT(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role || 'user',
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' } // 1 day expiration
  );
}

router.post('/home', cors(corsOptions), async (req, res) => {
  try {
    const { token } = req.body;
    console.log('Received token:', token);
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Google token is required',
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,
    });
    console.log('Google token verified:', ticket);
    const payload = ticket.getPayload();

    if (!payload?.sub || !payload?.email) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Google token payload',
      });
    }

    const existingUser = await User.findOne({ email: payload.email });
    if (existingUser && !existingUser.googleId) {
      return res.status(409).json({
        success: false,
        message: 'Account exists, login with your email and password',
      });
    }

    let user = await User.findOneAndUpdate(
      { googleId: payload.sub },
      {
        $setOnInsert: {
          googleId: payload.sub,
          email: payload.email,
          isVerified: true,
          FirstName: payload.given_name || '',
          picture: payload.picture || '',
          LastName: payload.family_name || '',
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    const jwtToken = generateJWT(user);
    console.log('Generated JWT:', jwtToken);

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', jwtToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'None' : 'Lax',
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      path: '/',
    });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: `${user.FirstName} ${user.LastName}`.trim(),
        picture: user.picture,
      },
      token: jwtToken,
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

router.get('/current', cors(corsOptions), async (req, res) => {
  console.log('Current user request received');
  console.log('Cookies:', req.cookies);
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      res.clearCookie('accessToken', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      });

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Session expired',
          expiredAt: error.expiredAt,
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    const user = await User.findById(decoded.id).select('_id email name picture role');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
});

router.post('/logout', cors(corsOptions), (req, res) => {
  res.clearCookie('accessToken', {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;





