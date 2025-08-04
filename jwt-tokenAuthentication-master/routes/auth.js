const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken'); // Add RefreshToken model
const jwt = require('jsonwebtoken');
const cors = require('cors');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const client = new OAuth2Client(process.env.CLIENT_ID);

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
};

const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.COOKIE_ENCRYPTION_KEY, 'hex');

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

function decrypt(encrypted) {
  try {
    const [ivHex, encryptedText] = encrypted.split(':');
    if (!ivHex || !encryptedText) throw new Error('Invalid encrypted data format');
    const iv = Buffer.from(ivHex, 'hex');
    if (iv.length !== 16) throw new Error('Invalid IV length');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error in auth:', error.message);
    throw new Error('Failed to decrypt token');
  }
}

function generateJWT(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role || 'user',
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // Align with /login (short-lived token)
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

    const accessToken = generateJWT(user);
    console.log('Generated JWT:', accessToken);

    // Generate and store refresh token
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    const refreshTokenExpires = new Date();
    refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7);

    const newRefreshToken = new RefreshToken({
      userId: user._id,
      token: hashedToken,
      expiresAt: refreshTokenExpires,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });
    await newRefreshToken.save();

    // Encrypt tokens
    const encryptedAccessToken = encrypt(accessToken);
    const encryptedRefreshToken = encrypt(refreshToken);

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', encryptedAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'None' : 'Lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
    });

    res.cookie('refreshToken', encryptedRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'None' : 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
      token: accessToken, // Kept for compatibility with existing frontend
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
    const encryptedToken = req.cookies.accessToken;
    if (!encryptedToken) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    let token;
    try {
      token = decrypt(encryptedToken);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format',
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
      res.clearCookie('refreshToken', {
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
        name: user.name || `${user.FirstName} ${user.LastName}`.trim(),
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

router.post('/refreshToken', cors(corsOptions), async (req, res) => {
  try {
    const encryptedRefreshToken = req.cookies.refreshToken;
    if (!encryptedRefreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required',
      });
    }

    let refreshToken;
    try {
      refreshToken = decrypt(encryptedRefreshToken);
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: 'Invalid refresh token format',
      });
    }

    const possibleTokens = await RefreshToken.find({
      revoked: false,
      expiresAt: { $gt: new Date() },
    });

    let tokenDoc = null;
    for (const doc of possibleTokens) {
      const isMatch = await bcrypt.compare(refreshToken, doc.token);
      if (isMatch) {
        tokenDoc = doc;
        break;
      }
    }

    if (!tokenDoc) {
      return res.status(403).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    const user = await User.findById(tokenDoc.userId);
    console.log('User found for refresh token:', user);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const newAccessToken = generateJWT(user);
    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    const hashedNewToken = await bcrypt.hash(newRefreshToken, 10);
    const refreshTokenExpires = new Date();
    refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7);

    const newTokenDoc = new RefreshToken({
      userId: user._id,
      token: hashedNewToken,
      expiresAt: refreshTokenExpires,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    tokenDoc.revoked = true;
    tokenDoc.revokedAt = new Date();
    tokenDoc.replacedByTokenId = newTokenDoc._id;

    await Promise.all([tokenDoc.save(), newTokenDoc.save()]);

    const encryptedNewAccessToken = encrypt(newAccessToken);
    const encryptedNewRefreshToken = encrypt(newRefreshToken);
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('accessToken', encryptedNewAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'None' : 'Lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
    });

    res.cookie('refreshToken', encryptedNewRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'None' : 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: `${user.FirstName} ${user.LastName}`.trim(),
        picture: user.picture,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred',
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
  res.clearCookie('refreshToken', {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
















// const express = require('express');
// const router = express.Router();
// const { OAuth2Client } = require('google-auth-library');
// const User = require('../models/User');
// const jwt = require('jsonwebtoken');
// const cors = require('cors');
// require('dotenv').config();

// const client = new OAuth2Client(process.env.CLIENT_ID);

// const corsOptions = {
//   origin: 'http://localhost:5173',
//   credentials: true,
//   allowedHeaders: ['Content-Type', 'Authorization','Cache-Control'],
// };

// function generateJWT(user) {
//   return jwt.sign(
//     {
//       id: user._id,
//       email: user.email,
//       role: user.role || 'user',
//     },
//     process.env.JWT_SECRET,
//     { expiresIn: '1d' } // 1 day expiration
//   );
// }

// router.post('/home', cors(corsOptions), async (req, res) => {
//   try {
//     const { token } = req.body;
//     console.log('Received token:', token);
//     if (!token) {
//       return res.status(400).json({
//         success: false,
//         message: 'Google token is required',
//       });
//     }

//     const ticket = await client.verifyIdToken({
//       idToken: token,
//       audience: process.env.CLIENT_ID,
//     });
//     console.log('Google token verified:', ticket);
//     const payload = ticket.getPayload();

//     if (!payload?.sub || !payload?.email) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid Google token payload',
//       });
//     }

//     const existingUser = await User.findOne({ email: payload.email });
//     if (existingUser && !existingUser.googleId) {
//       return res.status(409).json({
//         success: false,
//         message: 'Account exists, login with your email and password',
//       });
//     }

//     let user = await User.findOneAndUpdate(
//       { googleId: payload.sub },
//       {
//         $setOnInsert: {
//           googleId: payload.sub,
//           email: payload.email,
//           isVerified: true,
//           FirstName: payload.given_name || '',
//           picture: payload.picture || '',
//           LastName: payload.family_name || '',
//         },
//       },
//       {
//         upsert: true,
//         new: true,
//       }
//     );

//     const jwtToken = generateJWT(user);
//     console.log('Generated JWT:', jwtToken);

//     const isProduction = process.env.NODE_ENV === 'production';
//     res.cookie('accessToken', jwtToken, {
//       httpOnly: true,
//       secure: isProduction,
//       sameSite: isProduction ? 'None' : 'Lax',
//       maxAge: 1000 * 60 * 60 * 24, // 1 day
//       path: '/',
//     });

//     res.status(200).json({
//       success: true,
//       user: {
//         id: user._id,
//         email: user.email,
//         name: `${user.FirstName} ${user.LastName}`.trim(),
//         picture: user.picture,
//       },
//       token: jwtToken,
//     });
//   } catch (error) {
//     console.error('Google auth error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Authentication failed',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined,
//     });
//   }
// });

// router.get('/current', cors(corsOptions), async (req, res) => {
//   console.log('Current user request received');
//   console.log('Cookies:', req.cookies);
//   try {
//     const token = req.cookies.accessToken;
//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: 'Not authenticated',
//       });
//     }

//     let decoded;
//     try {
//       decoded = jwt.verify(token, process.env.JWT_SECRET);
//     } catch (error) {
//       res.clearCookie('accessToken', {
//         path: '/',
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
//       });

//       if (error.name === 'TokenExpiredError') {
//         return res.status(401).json({
//           success: false,
//           message: 'Session expired',
//           expiredAt: error.expiredAt,
//         });
//       }
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid token',
//       });
//     }

//     const user = await User.findById(decoded.id).select('_id email name picture role');
//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: 'User not found',
//       });
//     }

//     res.json({
//       success: true,
//       user: {
//         id: user._id,
//         email: user.email,
//         name: user.name,
//         picture: user.picture,
//         role: user.role,
//       },
//     });
//   } catch (error) {
//     console.error('Auth check error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Authentication error',
//     });
//   }
// });

// router.post('/logout', cors(corsOptions), (req, res) => {
//   res.clearCookie('accessToken', {
//     path: '/',
//     httpOnly: true,
//     secure: process.env.NODE_ENV === 'production',
//     sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
//   });
//   res.json({ success: true, message: 'Logged out successfully' });
// });

// module.exports = router;





