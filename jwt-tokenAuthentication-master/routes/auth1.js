require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const sendEmail = require('../utils/mailer');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
 const authenticateToken = require('../middleware/authMiddleware');
const cookieParser = require('cookie-parser');
const sanitizeHtml = require('sanitize-html');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const app = express();
// CORS configuration
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization','Cache-Control'],
};

app.use(cors({
       origin: 'http://localhost:5173',
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control']
    }));
app.use(cookieParser(process.env.COOKIE_SECRET));
// Rate limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts. Please try again after 15 minutes.',
});

const globalLimiter = rateLimit({ 
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests. Please try again later.',
});

// Apply global rate limiter
router.use(globalLimiter);

// Cookie encryption/decryption functions
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
  const [ivHex, encryptedText] = encrypted.split(':');
  if (!ivHex || !encryptedText) throw new Error('Invalid encrypted data');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// User registration
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('FirstName').notEmpty().withMessage('First name is required'),
    body('LastName').notEmpty().withMessage('Last name is required'),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/[0-9]/).withMessage('Password must contain at least one number')
      .matches(/[!@#$%^&*]/).withMessage('Password must contain at least one special character'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array())
      return res.status(400).json({ status: 'error', message: 'Validation failed', data: { errors: errors.array() } });
    }

    try {
      const email = req.body.email.trim().toLowerCase();
      const FirstName = sanitizeHtml(req.body.FirstName.trim().charAt(0).toUpperCase() + req.body.FirstName.trim().slice(1).toLowerCase());
      const LastName = sanitizeHtml(req.body.LastName.trim().charAt(0).toUpperCase() + req.body.LastName.trim().slice(1).toLowerCase());
      const password = req.body.password.trim();

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ status: 'error', message: 'Email already registered' });
      }

      const newUser = new User({ email, password, FirstName, LastName });
      const otp = crypto.randomInt(100000, 1000000).toString();
      newUser.resetToken = otp;
      newUser.resetTokenExpires = Date.now() + 3600000;
      await newUser.save();

      try {
        await sendEmail(email, 'Verify your email', `Your OTP is: ${otp}`);
      } catch (emailErr) {
        console.error('Failed to send email:', emailErr.message);
        await User.findByIdAndDelete(newUser._id);
        return res.status(500).json({ status: 'error', message: 'Failed to send verification email' });
      }

      res.status(200).json({
        status: 'success',
        message: 'Registration successful',
        data: {
          user: {
            _id: newUser._id,
            email: newUser.email,
            role: newUser.role,
            isVerified: newUser.isVerified,
          },
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ status: 'error', message: 'An unexpected error occurred' });
    }
  }
);

// User login
router.post(
  '/login',
  loginLimiter,
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password')
      .exists().withMessage('Password is required')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'error', message: 'Invalid credentials', data: { errors: errors.array() } });
    }

    try {
      const email = req.body.email.trim().toLowerCase();
      const password = req.body.password.trim();
      const user = await User.findOne({ email }).select('+password');
      console.log(user.FirstName)

      if (!user) {
        return res.status(400).json({ status: 'error', message: 'Account does not exist' });
      }

      if (user.googleId && !user.password) {
        return res.status(403).json({ status: 'error', message: 'Please use Google Sign-In', authMethod: 'google' });
      }

      if (user.lockUntil && user.lockUntil > Date.now()) {
        return res.status(403).json({ status: 'error', message: 'Account locked. Try again later.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Password match:', isMatch);
      if (!isMatch) {
        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
        if (user.failedLoginAttempts >= 5) {
          user.lockUntil = Date.now() + 15 * 60 * 1000;
        }
        await user.save();
        return res.status(400).json({ status: 'error', message: 'Invalid email or password' });
      }

      user.failedLoginAttempts = 0;
      user.lockUntil = null;
      await user.save();

      if (!user.isVerified && process.env.NODE_ENV !== 'test') {
        return res.status(403).json({ status: 'error', message: 'Email not verified' });
      }

      const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
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

      const encryptedAccessToken = encrypt(accessToken);
      const encryptedRefreshToken = encrypt(refreshToken);
        const isProduction = process.env.NODE_ENV === "production";
      res.cookie('accessToken', encryptedAccessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "None" : "Lax",
        maxAge: 15 * 60 * 1000,
        path: '/',
      });
      res.clearCookie('adminAccessToken', { path: '/' });
      res.clearCookie('adminRefreshToken', { path: '/'})
      res.clearCookie('role', { path: '/' });


      res.cookie('refreshToken', encryptedRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: isProduction ? "None" : "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });

          res.cookie('role', user.role, {
      httpOnly: true, 
    secure: isProduction,
     sameSite: isProduction ? 'None' : 'Lax',
     maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
    signed: true
    });

      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
          user: {
            name: user.FirstName,
            _id: user._id,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
          },
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ status: 'error', message: 'An unexpected error occurred' });
    }
  }
);

// User refresh token
router.post('/refreshToken', cors(corsOptions), authenticateToken('user'),async (req, res) => {
  try {
    const encryptedRefreshToken = req.cookies.refreshToken;
    if (!encryptedRefreshToken) {
      return res.status(401).json({ status: 'error', message: 'Refresh token required' });
    }

    let refreshToken;
    try {
      refreshToken = decrypt(encryptedRefreshToken);
      console.log(refreshToken)
    } catch (error) {
      return res.status(403).json({ status: 'error', message: 'Invalid refresh token' });
    }

    const possibleTokens = await RefreshToken.find({
  isAdminToken: false,
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
  return res.status(403).json({ status: 'error', message: 'Invalid refresh token' });
}

    // const tokenDoc = await RefreshToken.findOne({
    //   isAdminToken: false,
    //   revoked: false,
    //   expiresAt: { $gt: new Date() },
    // });
    // if (!tokenDoc || !(await bcrypt.compare(refreshToken, tokenDoc.token))) {
    //   return res.status(403).json({ status: 'error', message: 'Invalid refresh token' });
    // }

    const user = await User.findById(tokenDoc.userId);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const newAccessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
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
 const isProduction = process.env.NODE_ENV === "production";
    res.cookie('accessToken', encryptedNewAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 15 * 60 * 1000,
      path: '/',
    });

    res.cookie('refreshToken', encryptedNewRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.json({
      status: 'success',
      message: 'Access token refreshed',
      data: {
        user: {
          name: user.FirstName,
          _id: user._id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ status: 'error', message: 'An unexpected error occurred' });
  }
});

// Admin registration

router.post(
  '/register-administer',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('FirstName').notEmpty().withMessage('First name is required'),
    body('LastName').notEmpty().withMessage('Last name is required'),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/[0-9]/).withMessage('Password must contain at least one number')
      .matches(/[!@#$%^&*]/).withMessage('Password must contain at least one special character'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'error', message: 'Validation failed', data: { errors: errors.array() } });
    }

    try {
      const email = req.body.email.trim().toLowerCase();
      const FirstName = sanitizeHtml(req.body.FirstName.trim().charAt(0).toUpperCase() + req.body.FirstName.trim().slice(1).toLowerCase());
      const LastName = sanitizeHtml(req.body.LastName.trim().charAt(0).toUpperCase() + req.body.LastName.trim().slice(1).toLowerCase());
      const password = req.body.password.trim();

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ status: 'error', message: `Email already registered as ${existingUser.role}` });
      }
      const saltRounds = 10;

      // Hash the password
      //const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUser = new User({
        email,
        password,
        FirstName,
        LastName,
        role: 'admin',
      });

      // Generate 6-digit numeric OTP
      const otp = crypto.randomInt(100000, 1000000).toString();
      newUser.resetToken = otp;
      newUser.resetTokenExpires = Date.now() + 3600000;
      await newUser.save();

      try {
        await sendEmail(email, 'Verify your email', `Your OTP is: ${otp}`);
      } catch (emailErr) {
        console.error('Failed to send email:', emailErr.message);
        await User.findByIdAndDelete(newUser._id);
        return res.status(500).json({ status: 'error', message: 'Failed to send verification email' });
      }

      res.status(201).json({
        status: 'success',
        message: 'Admin registration successful',
        data: {
          user: {
            _id: newUser._id,
            email: newUser.email,
            role: newUser.role,
            isVerified: newUser.isVerified,
          },
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ status: 'error', message: 'An unexpected error occurred' });
    }
  }
);
// Admin login
router.post(
  '/admin-login',
  loginLimiter,
 
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password')
      .exists().withMessage('Password is required')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'error', message: 'Invalid credentials', data: { errors: errors.array() } });
    }

    try {
      const email = req.body.email.trim().toLowerCase();
      const password = req.body.password.trim();
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        return res.status(400).json({ status: 'error', message: 'Account do not exist' });
      }

      if (user.googleId && !user.password) {
        return res.status(403).json({ status: 'error', message: 'Please use Google Sign-In as a User', authMethod: 'google' });
      }

      if (user.role !== 'admin') {
        return res.status(403).json({ status: 'error', message: 'Insufficient privileges' });
      }

      if (user.lockUntil && user.lockUntil > Date.now()) {
        return res.status(403).json({ status: 'error', message: 'Account locked. Try again later.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
        if (user.failedLoginAttempts >= 5) {
          user.lockUntil = Date.now() + 15 * 60 * 1000;
        }
        await user.save();
        return res.status(400).json({ status: 'error', message: 'Invalid email or password' });
      }

      user.failedLoginAttempts = 0;
      user.lockUntil = null;
      await user.save();

      if (!user.isVerified && process.env.NODE_ENV !== 'test') {
        return res.status(403).json({ status: 'error', message: 'Email not verified' });
      }

      const adminAccessToken = jwt.sign(
        { id: user._id, role: user.role, isAdminSession: true },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );
      const adminRefreshToken = crypto.randomBytes(64).toString('hex');
      const hashedToken = await bcrypt.hash(adminRefreshToken, 10);
      const refreshTokenExpires = new Date();
      refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7);

      const newRefreshToken = new RefreshToken({
        userId: user._id,
        token: hashedToken,
        expiresAt: refreshTokenExpires,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        isAdminToken: true,
      });
      await newRefreshToken.save();

      const encryptedAdminAccessToken = encrypt(adminAccessToken);
      console.log(encryptedAdminAccessToken)
      const encryptedAdminRefreshToken = encrypt(adminRefreshToken);
    const isProduction = process.env.NODE_ENV === "production";
      res.cookie('adminAccessToken', encryptedAdminAccessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "None" : "Lax",
        maxAge: 15 * 60 * 1000,
        path: '/',
      });

        res.clearCookie('accessToken', {path:'/'})
      res.clearCookie('refreshToken', {path:'/'})
      res.clearCookie('role', { path: '/' });

      res.cookie('adminRefreshToken', encryptedAdminRefreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "None" : "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });

       res.cookie('role', user.role, {
      httpOnly: true, 
    secure: isProduction,
     sameSite: isProduction ? 'None' : 'Lax',
     maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
    signed: true
    });

      res.status(200).json({
        status: 'success',
        message: 'Admin login successful',
        data: {
          user: {
            _id: user._id,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
          },
        },
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ status: 'error', message: 'An unexpected error occurred' });
    }
  }
);

// Admin refresh token
router.post('/adminRefreshToken', cors(corsOptions),authenticateToken('admin'),async (req, res) => {
  try {
    const encryptedAdminRefreshToken = req.cookies.adminRefreshToken;
    if (!encryptedAdminRefreshToken) {
      return res.status(401).json({ status: 'error', message: 'Admin refresh token required' });
    }

    let adminRefreshToken;
    try {
      adminRefreshToken = decrypt(encryptedAdminRefreshToken);
      console.log(adminRefreshToken)
    } catch (error) {
      return res.status(403).json({ status: 'error', message: 'Invalid admin refresh token' });
    }

    
    const possibleTokens = await RefreshToken.find({
  isAdminToken: true,
  revoked: false,
  expiresAt: { $gt: new Date() },
});

let tokenDoc = null;
for (const doc of possibleTokens) {
  const isMatch = await bcrypt.compare(adminRefreshToken, doc.token);
  if (isMatch) {
    tokenDoc = doc;
    break;
  }
}

    // const tokenDoc = await RefreshToken.findOne({
    //   isAdminToken: true,
    //   revoked: false,
    //   expiresAt: { $gt: new Date() },
    // });
    if (!tokenDoc ) {
      return res.status(403).json({ status: 'error', message: 'Invalid admin refresh token' });
    }

    const user = await User.findById(tokenDoc.userId);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Insufficient privileges' });
    }

    const newAdminAccessToken = jwt.sign(
      { id: user._id, role: user.role, isAdminSession: true },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    const newAdminRefreshToken = crypto.randomBytes(64).toString('hex');
    const newHashedToken = await bcrypt.hash(newAdminRefreshToken, 10);
    const refreshTokenExpires = new Date();
    refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7);

    const newTokenDoc = new RefreshToken({
      userId: user._id,
      token: newHashedToken,
      expiresAt: refreshTokenExpires,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      isAdminToken: true,
    });

    tokenDoc.revoked = true;
    tokenDoc.revokedAt = new Date();
    tokenDoc.replacedByTokenId = newTokenDoc._id;

    await Promise.all([tokenDoc.save(), newTokenDoc.save()]);

    const encryptedNewAdminAccessToken = encrypt(newAdminAccessToken);
    const encryptedNewAdminRefreshToken = encrypt(newAdminRefreshToken);
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie('adminAccessToken', encryptedNewAdminAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 15 * 60 * 1000,
      path: '/',
    });

    res.cookie('adminRefreshToken', encryptedNewAdminRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.json({
      status: 'success',
      message: 'Admin tokens refreshed successfully',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    console.error('Admin token refresh error:', error);
    res.status(500).json({ status: 'error', message: 'An unexpected error occurred' });
  }
});

router.get('/checkRole', authenticateToken(), (req, res) => {
  res.header('Access-Control-Allow-Credentials', 'true');

  // req.user is populated by authMiddleware after decryption and JWT verification
  const userRole = req.user.role;

  if (!userRole) {
    return res.status(401).json({ message: 'Unauthorized - No role found' });
  }

  res.json({ role: userRole });
});


router.get("/currentProfile", authenticateToken('user'), async (req, res) => {
  try {
   
    const user = req.user;

    res.status(200).json({
      status: "success",
      message: "User fetched successfully",
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName || null,
          lastName: user.lastName || null,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          staffType: user.staffType || null,
          profileNumber: user.profileNumber || null,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch user",
    });
  }
});

// forgot-password
router.post('/forgot-password', 
  [body('email').isEmail().withMessage('Invalid email')],
  async (req, res) => {
    try {
      const email = req.body.email.trim().toLowerCase();
      const user = await User.findOne({ email });
      
      if (!user) {
        return res.json({ 
          message: 'If an account exists, a reset link has been sent.' 
        });
      }

      // Generate new token
      const resetToken = crypto.randomBytes(64).toString('hex');
      const salt = crypto.randomBytes(16);
      const resetTokenId = uuidv4();

      user.resetToken = crypto.pbkdf2Sync(resetToken, salt, 100000, 64, 'sha512').toString('hex');
      user.resetTokenSalt = salt.toString('hex');
      user.resetTokenExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
      user.resetTokenId = resetTokenId;
      
      await user.save();

      const resetLink = `${process.env.BACKEND_URL}/auth1/c/${resetTokenId}`;
      
      await sendEmail(
        email,
        'Password Reset',
        `Click to reset: ${resetLink}\nToken: ${resetToken}\nExpires in 15 minutes.`
      );

      res.json({ message: 'Reset link sent', status: 'success' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ status: 'error', message: 'Server error' });
    }
  }
);



// 3. Token Verification Route (GET /c/:id)


router.get('/c/:id', async (req, res) => {
  try {
    console.log('Received token ID:', req.params.id);
    console.log('Current time:', new Date());
    
    const user = await User.findOne({
      resetTokenId: req.params.id,
      resetTokenExpires: { $gt: Date.now() }
    });

    console.log('Found user:', user ? user.email : 'none');
    console.log('Token expires:', user ? new Date(user.resetTokenExpires) : 'none');

    if (!user) { 
      return res.status(400).json({ 
        message: 'Invalid or expired password reset link' 
      });
    }

    const redirectUrl = `${process.env.FRONTEND_URL}/update-password?tokenId=${req.params.id}`;
    console.log('Redirecting to:', redirectUrl);
    res.redirect(redirectUrl);
    
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ 
      message: 'An error occurred while verifying your link' 
    });
  }
});

// update password3
router.post(
  '/update-password',
  [
    body('tokenId').exists().withMessage('Token ID is required'),
    body('token').exists().withMessage('Token is required'),
    body('password')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/)
      .withMessage('Password must include at least one uppercase letter, one lowercase letter, and one number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tokenId, token, password } = req.body;

    try {
      // Find the user by the resetTokenId (UUID) and check expiration
      const user = await User.findOne({
        resetTokenId: tokenId,
        resetTokenExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ 
          message: 'Invalid or expired password reset link',
          status: 'error'
        });
      }

      // Verify the provided token against the stored hash
      const saltBuffer = Buffer.from(user.resetTokenSalt, 'hex');
      const hashedToken = crypto.pbkdf2Sync(
        token,
        saltBuffer,
        100000,
        64,
        'sha512'
      ).toString('hex');

      if (hashedToken !== user.resetToken) {
        return res.status(400).json({ 
          message: 'Invalid security token',
          status: 'error'
        });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Update user and clear reset fields
      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetTokenSalt = undefined;
      user.resetTokenExpires = undefined;
      user.resetTokenId = undefined;
      user.isModified = function (field) {
                return field !== 'password';
            };
      await user.save();
      
      // Optional: Invalidate all existing sessions
      // await Session.deleteMany({ userId: user._id });

      res.status(200).json({ 
        message: 'Password updated successfully', 
        status: 'success'
      });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ 
        message: 'An error occurred while resetting your password',
        status: 'error'
      });
    }
  }
);



// Verify OTP
router.post(
    '/verify-otp',
    [
      body('email').isEmail().withMessage('Invalid email'),
      body('otp')
        .exists()
        .isNumeric()
        .isLength({ min: 6, max: 6 })
        .withMessage('OTP must be a 6-digit number'),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { email, otp } = req.body;
  
      try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
          console.log('User not found for email:', email);
          return res.status(400).json({ message: 'User not found' });
        }
  
        // Validate OTP
        if (user.resetToken !== otp) {
          return res.status(400).json({ message: 'Invalid OTP' });
        }
  
        if (user.resetTokenExpires < Date.now()) {
          return res.status(400).json({ message: 'OTP has expired' });
        }
  
        // Update user data
        user.isVerified = true;
        user.resetToken = undefined;
        user.resetTokenExpires = undefined;
  
        try {
          await user.save();
        } catch (dbError) {
          console.error('Error saving user data:', dbError);
          return res.status(500).json({ message: 'Failed to update user data', error: dbError.message });
        }
  
        // Return success response
        res.status(200).json({
          status: 'success',
          message: 'Verification successful',
          data: {
            user: {
              _id: user._id,
              email: user.email,
              role: user.role,
              isVerified: user.isVerified,
            },
          },
        });
      } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ message: 'Server error' });
      }
    }
  );

  ////ADMIN ONBOARDING AND OFFICERS SIGNING
// Staff onboarding (admin only)
router.post(
  '/onboard-user',
 authenticateToken('admin'),
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('FirstName').notEmpty().withMessage('First name is required'),
    body('LastName').notEmpty().withMessage('Last name is required'),
    body('role')
      .isIn(['loan_officer', 'disburse_officer'])
      .withMessage('Invalid staff role'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ status: 'error', message: 'Validation failed', errors: errors.array() });
    }

    try {
      const { email, FirstName, LastName, role } = req.body;
      const sanitizedEmail = email.trim().toLowerCase();

      const existingUser = await User.findOne({ email: sanitizedEmail });
      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: `Email already registered as ${existingUser.role}`,
        });
      }

      // Generate a strong random password
      const generatedPassword = crypto.randomBytes(6).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 10) +
        '!A1'; // Ensure special char + upper + digit
        console.log('Generated password:', generatedPassword);
      // const hashedPassword = await bcrypt.hash(generatedPassword, 12);

      const newUser = new User({
        email: sanitizedEmail,
        FirstName: sanitizeHtml(FirstName.trim()),
        LastName: sanitizeHtml(LastName.trim()),
        password: generatedPassword,
        role,
        isVerified: true,
      });

      await newUser.save();

      // Send email with login credentials
      const emailBody = `
        <p>Hello ${FirstName},</p>
        <p>You have been onboarded as a <strong>${role.replace('_', ' ')}</strong>.</p>
        <p>Your login credentials are:</p>
        <ul>
          <li><strong>Email:</strong> ${sanitizedEmail}</li>
          <li><strong>Password:</strong> ${generatedPassword}</li>
        </ul>
        <p><strong>Please change your password immediately after logging in.</strong></p>
        <p>Best regards,<br/>Admin Team</p>
      `;

      await sendEmail(sanitizedEmail, 'Your Staff Account Credentials', emailBody);

      res.status(201).json({
        status: 'success',
        message: `${role} onboarded successfully and login details sent.`,
        user: {
          _id: newUser._id,
          email: newUser.email,
          role: newUser.role,
          isVerified: newUser.isVerified,
        },
      });
    } catch (error) {
      console.error('Onboarding error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error while onboarding user',
      });
    }
  }
);
// Staff login
router.post(
  '/staff-login',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'error', errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

      if (!user || !['loan_officer', 'disburse_officer'].includes(user.role)) {
        return res.status(403).json({ status: 'error', message: 'Invalid staff credentials' });
      }

      if (!user.isVerified) {
        return res.status(403).json({ status: 'error', message: 'Account not verified' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ status: 'error', message: 'Invalid email or password' });
      }

      const accessToken = jwt.sign(
        { id: user._id, role: user.role, isAdminSession: false },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      const refreshToken = crypto.randomBytes(64).toString('hex');
      const hashedToken = await bcrypt.hash(refreshToken, 10);

      const refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await new RefreshToken({
        userId: user._id,
        token: hashedToken,
        expiresAt: refreshTokenExpires,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        isAdminToken: false
      }).save();

      res.cookie('accessToken', encrypt(accessToken), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        maxAge: 15 * 60 * 1000,
        path: '/'
      });

      res.cookie('refreshToken', encrypt(refreshToken), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
      });

      res.status(200).json({
        status: 'success',
        message: 'Staff login successful',
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        }
      });
    } catch (error) {
      console.error('Staff login error:', error);
      res.status(500).json({ status: 'error', message: 'Unexpected error occurred' });
    }
  }
);

// Staff refresh token
router.post('/staff-refresh-token', cors(corsOptions), async (req, res) => {
  try {
    const encryptedToken = req.cookies.refreshToken;
    if (!encryptedToken) {
      return res.status(401).json({ status: 'error', message: 'No refresh token' });
    }

    let plainToken;
    try {
      plainToken = decrypt(encryptedToken);
    } catch {
      return res.status(403).json({ status: 'error', message: 'Invalid token' });
    }

    const tokenDoc = await RefreshToken.findOne({
      isAdminToken: false,
      revoked: false,
      expiresAt: { $gt: new Date() }
    });

    if (!tokenDoc || !(await bcrypt.compare(plainToken, tokenDoc.token))) {
      return res.status(403).json({ status: 'error', message: 'Refresh token not valid' });
    }

    const user = await User.findById(tokenDoc.userId);
    if (!user || !['loan_officer', 'disburse_officer'].includes(user.role)) {
      return res.status(404).json({ status: 'error', message: 'User not found or unauthorized' });
    }

    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role, isAdminSession: false },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    const hashedNewToken = await bcrypt.hash(newRefreshToken, 10);
    const refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const newTokenDoc = new RefreshToken({
      userId: user._id,
      token: hashedNewToken,
      expiresAt: refreshTokenExpires,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      isAdminToken: false
    });

    tokenDoc.revoked = true;
    tokenDoc.revokedAt = new Date();
    tokenDoc.replacedByTokenId = newTokenDoc._id;

    await Promise.all([tokenDoc.save(), newTokenDoc.save()]);

    res.cookie('accessToken', encrypt(newAccessToken), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 15 * 60 * 1000,
      path: '/'
    });

    res.cookie('refreshToken', encrypt(newRefreshToken), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });

    res.status(200).json({
      status: 'success',
      message: 'Token refreshed successfully',
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ status: 'error', message: 'Unexpected error' });
  }
});
















// EVERYTHING HERE IS FOR ONE-OFF MEMBERS WHO DON'T HAVE GOOGLE AUTH BUT ONLY EMAIL AND PASSWORD
//ORIGINAL
// const express = require('express');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const crypto = require('crypto');
// const User = require('../models/User');
// const RefreshToken = require('../models/RefreshToken');
// const sendEmail = require('../utils/mailer');
// const rateLimit = require('express-rate-limit');
// const { body, validationResult } = require('express-validator');
// const sanitizeHtml = require('sanitize-html');
// const authenticateToken = require('../middleware/authMiddleware');
// const cors = require('cors');
// require('dotenv').config();
// const { v4: uuidv4 } = require('uuid'); // Import the UUID library

// const router = express.Router();
// const app = express();
// app.use(cors({
//        origin: 'http://localhost:5173',
//       credentials: true,
//       allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control']
//     }));

//     const corsOptions = {
//   origin: 'http://localhost:5173',
//   credentials: true,
//   allowedHeaders: ['Content-Type', 'Authorization']
// };
    
// // Rate limiter for login route
// const loginLimiter = rateLimit({
//     windowMs: 60 * 1000, // 1 minute
//     max: 100, // Max 5 requests per minute
//     message: 'Too many login attempts. Please try again later.',
// });

// // Global rate limiter (optional)
// const globalLimiter = rateLimit({
//     windowMs: 60 * 1000, // 1 minute
//     max: 100, // Max 100 requests per minute
//     message: 'Too many requests. Please try again later.',
// });

// // Apply global rate limiter to all routes
// router.use(globalLimiter);

// // Registration for a new user
// router.post(
//     '/register',
//     [
//         body('email').isEmail().withMessage('Invalid email'),
//         body('LastName'),
//         body('FirstName'),
//         body('password')
//             .isLength({ min: 8 })
//             .withMessage('Password must be at least 8 characters long'),
//     ],
//     async (req, res) => {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({ errors: errors.array() });
//         }

//         // const { email, password } = req.body;
        

//         try {
//             const email = req.body.email.trim().toLowerCase();
//             const FirstName = req.body.FirstName.trim().charAt(0).toUpperCase() + req.body.FirstName.trim().slice(1).toLowerCase();
//             const LastName = req.body.LastName.trim().charAt(0).toUpperCase() + req.body.LastName.trim().slice(1).toLowerCase();
//             const password = req.body.password.trim();
//             const existingUser = await User.findOne({ email });
//             if (existingUser) return res.status(400).json({ message: 'User already exists' });

//             const newUser = new User({ email, password, FirstName, LastName });
//             // await newUser.save();

//             const otp = Math.floor(100000 + Math.random() * 900000).toString();
//             newUser.resetToken = otp;
//             newUser.resetTokenExpires = Date.now() + 3600000; // Expire after 1 hour
//             await newUser.save();

//             await sendEmail(email, 'Verify your email', `Your OTP is: ${otp}`);
//             res.status(200).json({
//                 status: 'success',
//                 message: 'Registration successful',
//                 data: {
//                   user: {
//                     _id: newUser._id,
//                     email: newUser.email,
//                     role: newUser.role,
//                     isVerified: newUser.isVerified,
//                   },
//                 },
//               });

//             // res.status(201).json({ message: 'User registered successfully. Check your email for OTP.' });
//         } catch (error) {
//             console.error(error);
//             res.status(500).json({ message: 'Server error', error });
//         }
//     }
// );



// router.post(
//   '/login',
//   loginLimiter,
//   [
//     body('email').isEmail().withMessage('Invalid email'),
//     body('password')
//       .exists()
//       .isLength({ min: 8 })
//       .withMessage('Password must be at least 8 characters long'),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         status: 'error',
//         message: 'Not a valid credential',
//         data: { errors: errors.array() },
//       });
//     }

//     try {
//       const email = req.body.email.trim().toLowerCase();
//       const password = req.body.password.trim();

//       // Find user by email
//       const user = await User.findOne({ email });
//       if (!user) {
//         return res.status(400).json({
//           status: 'error',
//           message: 'You do not have an account',
//           data: null,
//         });
//       }

//       // Check auth method first - BEFORE password comparison
//       if (user.googleId) {
//         return res.status(403).json({
//           status: 'error',
//           message: ' Kindly Sign-In with Google',
//           authMethod: 'google',
//         });
//       }
      
//       // this is only for GoogleId when 
//       if (!user.password) {
//         return res.status(403).json({
//           status: 'error',
//           message: 'Please use Google Sign-In',
//           authMethod: 'google'
//         });
//       }

//       // Compare password
//       const isMatch = await bcrypt.compare(password, user.password);
//       console.log('Password match:', isMatch);
//       if (!isMatch) {
//         return res.status(400).json({
//           status: 'error',
//           message: 'Invalid credentials',
//           data: null,
//         });
//       }

//       if (user.googleId && !user.password) {
//         return res.status(403).json({
//           status: 'error',
//           message: 'This account uses Google Sign-In',
//           authMethod: 'google'
//         });
//       }

//       // Check email verification
//       if (!user.isVerified && !req.query.allowUnverifiedForTesting) {
//         return res.status(403).json({
//           status: 'error',
//           message: 'Email not verified',
//           testHint: 'TEST: Add ?allowUnverifiedForTesting=true to bypass'
//         });
//       }

//       // Generate access token (15 minutes expiration)
//       const accessToken = jwt.sign(
//         { id: user._id, role: user.role },
//         process.env.JWT_SECRET,
//         { expiresIn: '15m' }
//       );

//       // Generate secure random refresh token (128-bit)
//       const refreshToken = crypto.randomBytes(64).toString('hex');

//       // Hash the refresh token before storing
//       const hashedToken = await bcrypt.hash(refreshToken, 10);

//       // Calculate expiration (7 days)
//       const refreshTokenExpires = new Date();
//       refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7);

//       // Store refresh token in database
//       const newRefreshToken = new RefreshToken({
//         userId: user._id,
//         token: hashedToken,
//         expiresAt: refreshTokenExpires,
//         userAgent: req.headers['user-agent'],
//         ipAddress: req.ip || req.connection.remoteAddress
//       });

//       await newRefreshToken.save();

//       // Set HTTP-only cookies
//       res.cookie('accessToken', accessToken, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
//         maxAge: 15 * 60 * 1000, // 15 minutes
//         path: '/',
//       });

//       res.cookie('refreshToken', refreshToken, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
//         maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//         path: '/',
//       });
      
//       res.status(200).json({
//         status: 'success',
//         message: 'Login successful (TEST MODE)',
//         data: {
//           token: accessToken, // i am using this to test if the token is sent to the frontend
//           user: {
//             _id: user._id,
//             email: user.email,
//             role: user.role,
//             isVerified: user.isVerified,
//           },
//           // For testing purposes only:
//           accessTokenExpires: '15m',
//           refreshTokenExpires: '7d',
//           testInfo: {
//             cookieSet: true,
//             validationBypass: !!req.query.allowUnverifiedForTesting,
//             serverTime: new Date().toISOString()
//           }
//         }
//       });
//     } catch (error) {
//       if (error.message.includes('googleId')) {
//         return res.status(403).json({
//           status: 'error',
//           message: 'Authentication method mismatch',
//           authMethod: 'google'
//         });
//       }
//       console.error('Error during login:', error);
//       res.status(500).json({
//         status: 'error',
//         message: 'Server error',
//       });
//     }
//   }
// );
// router.post('/refreshToken', cors(corsOptions), async (req, res) => {
//   try {
//     const refreshToken = req.cookies.refreshToken;
    
//     if (!refreshToken) {
//       return res.status(401).json({ 
//         status: 'error',
//         message: 'Refresh token required' 
//       });
//     }

//     // Find token in database
//     const tokens = await RefreshToken.find({ userId: { $exists: true } });
//     let tokenDoc = null;
    
//     // Find matching token using bcrypt.compare
//     for (const token of tokens) {
//       const isMatch = await bcrypt.compare(refreshToken, token.token);
//       if (isMatch) {
//         tokenDoc = token;
//         break;
//       }
//     }

//     if (!tokenDoc) {
//       return res.status(403).json({ 
//         status: 'error',
//         message: 'Invalid refresh token' 
//       });
//     }

//     // Check if token is revoked or expired
//     if (tokenDoc.revoked) {
//       return res.status(403).json({ 
//         status: 'error',
//         message: 'Refresh token revoked' 
//       });
//     }

//     if (tokenDoc.expiresAt < new Date()) {
//       return res.status(403).json({ 
//         status: 'error',
//         message: 'Refresh token expired' 
//       });
//     }

//     // Get user from database
//     const user = await User.findById(tokenDoc.userId);
//     if (!user) {
//       return res.status(404).json({ 
//         status: 'error',
//         message: 'User not found' 
//       });
//     }

//     // Generate new access token
//     const newAccessToken = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: '15m' }
//     );

//     // Set new access token cookie
//     res.cookie('accessToken', newAccessToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
//       maxAge: 15 * 60 * 1000,
//       path: '/',
//     });

//     return res.json({ 
//       status: 'success',
//       message: 'Access token refreshed' 
//     });
//   } catch (error) {
//     console.error('Token refresh error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Server error during token refresh'
//     });
//   }
// });





////////EVERYTHING HERE IS FOR ADMIN-ONLY ROUTES
// Admin-only protected route

//ORIGINAL


// POST /register-administer
// router.post(
//   "/register-administer",
//   [
//     body("email").isEmail().withMessage("Invalid email"),
//     body("password")
//       .isLength({ min: 8 })
//       .withMessage("Password must be at least 8 characters long"),
//     body('LastName'), 
//     body('FirstName'),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { email, password } = req.body;
//     const FirstName = req.body.FirstName.trim().charAt(0).toUpperCase() + req.body.FirstName.trim().slice(1).toLowerCase();
//     const LastName = req.body.LastName.trim().charAt(0).toUpperCase() + req.body.LastName.trim().slice(1).toLowerCase();
//     try {
//       console.log("Step 1: Request received for email:", email);

//       // Step 1: Check if user already exists
//       const existingUser = await User.findOne({
//         email: email.trim().toLowerCase(),
//         role: { $in: ["admin", "user"] },
//       });

//       if (existingUser) {
//         return res.status(400).json({
//           message: `This Account already exists as ${existingUser.role}`,
//         });
//       }
//       console.log("Step 2: No existing user found");

//       // Step 2: Create new admin user
//       const newUser = new User({
//         email: email.trim().toLowerCase(),
//         password, // Will be hashed by Mongoose pre-save hook
//         FirstName, LastName,
//         role: "admin",
//       });

//       // Generate OTP for email verification
//       const otp = Math.floor(100000 + Math.random() * 900000).toString();
//       newUser.resetToken = otp;
//       newUser.resetTokenExpires = Date.now() + 3600000; // 1 hour

//       await newUser.save();
//       console.log("Step 3: New user saved", newUser._id);

//       // Step 3: Send OTP via email with timeout
//       const sendEmailWithTimeout = async () => {
//         const sendPromise = sendEmail(
//           newUser.email,
//           "Verify your email",
//           `Your OTP is: ${otp}`
//         );

//         const timeoutPromise = new Promise((_, reject) =>
//           setTimeout(() => reject(new Error("Email timeout")), 10000)
//         );

//         return Promise.race([sendPromise, timeoutPromise]);
//       };

//       try {
//         await sendEmailWithTimeout();
//         console.log("Step 4: Email sent successfully");
//       } catch (emailErr) {
//         console.error("Failed to send email:", emailErr.message);
//         // Optionally, delete the user if email fails
//         // await User.findByIdAndDelete(newUser._id);
//         return res.status(500).json({
//           message: "Registration successful but failed to send email",
//           userId: newUser._id,
//         });
//       }

//       // Step 4: Respond to client
//       res.status(201).json({
//         status: "success",
//         message: "Admin registration successful",
//         data: {
//           user: {
//             _id: newUser._id,
//             email: newUser.email,
//             role: newUser.role,
//             isVerified: newUser.isVerified,
//           },
//         },
//       });

//     } catch (error) {
//       console.error("Registration error:", {
//         message: error.message,
//         stack: error.stack,
//       });

//       res.status(500).json({
//         message:
//           process.env.NODE_ENV === "development"
//             ? `Server error: ${error.message}`
//             : "Server error during registration",
//       });
//     }
//   }
// );



// router.post(
//   "/admin-login",
//   loginLimiter,
//   [
//     body('email').isEmail().withMessage('Invalid email'),
//     body('password')
//       .exists()
//       .isLength({ min: 8 })
//       .withMessage('Password must be at least 8 characters long'),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         status: "error",
//         message: "Invalid login credentials",
//         data: { errors: errors.array() },
//       });    
//     }

//     try {
//       const { email, password } = req.body;

//       const user = await User.findOne({ email }).select("+password");

//       if (!user) {
//         return res.status(400).json({
//           status: "error",
//           message: "No account exist",
//         });
//       }

//       // Ensure user has a password (not Google-only account)
//       if (user.googleId && !user.password) {
//         return res.status(403).json({
//           status: "error",
//           message: "This account uses Google Sign-In",
//           authMethod: "google"
//         });
//       }

//       // Compare password
//       const isMatch = await bcrypt.compare(password, user.password);
//       if (!isMatch) {
//         return res.status(400).json({
//           status: "error",
//           message: "Invalid credentials",
//         });
//       }

//       // Bypass email verification in dev mode
//       if (!user.isVerified && !req.query.allowUnverifiedForTesting) {
//         return res.status(403).json({
//           status: "error",
//           message: "Email not verified",
//           testHint: "Add ?allowUnverifiedForTesting=true to bypass"
//         });
//       }

//       // Generate admin access token (15 minutes expiration)
//       const adminAccessToken = jwt.sign(
//         { 
//           id: user._id,
//           role: user.role,
//           isAdminSession: true // Flag to distinguish admin sessions
//         },
//         process.env.JWT_SECRET, 
//         { expiresIn: "15m" }
//       );

//       // Generate secure random refresh token (128-bit)
//       const adminRefreshToken = crypto.randomBytes(64).toString('hex');

//       // Hash the refresh token before storing
//       const hashedToken = await bcrypt.hash(adminRefreshToken, 10);

//       // Calculate expiration (7 days)
//       const refreshTokenExpires = new Date();
//       refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7);

//       // Store refresh token in database with admin flag
//       const newRefreshToken = new RefreshToken({
//         userId: user._id,
//         token: hashedToken,
//         expiresAt: refreshTokenExpires,
//         userAgent: req.headers['user-agent'],
//         ipAddress: req.ip || req.connection.remoteAddress,
//         isAdminToken: true // Mark as admin token
//       });

//       await newRefreshToken.save();

//       // Set HTTP-only admin cookies
//       const isProduction = process.env.NODE_ENV === "production";
      
//       res.cookie("adminAccessToken", adminAccessToken, {
//         httpOnly: true,
//         secure: isProduction,
//         sameSite: isProduction ? "None" : "Lax",
//         maxAge: 15 * 60 * 1000, // 15 minutes
//         path: "/",
//       });

//       res.cookie("adminRefreshToken", adminRefreshToken, {
//         httpOnly: true,
//         secure: isProduction,
//         sameSite: isProduction ? "None" : "Lax",
//         maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//         path: "/",
//       });

//       // Return success response
//       res.status(200).json({
//         status: "success",
//         message: "Admin login successful",
//         data: {
//           token: adminAccessToken, // Include access token in response
//           user: {
//             _id: user._id,
//             email: user.email,
//             role: user.role,
//             isVerified: user.isVerified
//           },
//           tokenInfo: {
//             accessTokenExpires: '15m',
//             refreshTokenExpires: '7d'
//           },
//           testInfo: {
//             validationBypass: !!req.query.allowUnverifiedForTesting,
//             serverTime: new Date().toISOString()
//           }
//         }
//       });

//     } catch (error) {
//       console.error("Error during admin login:", error.message);
//       res.status(500).json({
//         status: "error",
//         message: "Server error during login",
//         error: process.env.NODE_ENV === "development" ? error.message : undefined
//       });
//     }
//   }
// );


// router.post('/adminRefreshToken', async (req, res) => {
//   try {
//     // Get refresh token from cookie
//     const adminRefreshToken = req.cookies.adminRefreshToken;
    
//     if (!adminRefreshToken) {
//       return res.status(401).json({ 
//         status: 'error',
//         message: 'Admin refresh token required' 
//       });
//     }

//     // Find all admin tokens for potential rotation
//     const tokens = await RefreshToken.find({ 
//       isAdminToken: true,
//       revoked: false,
//       expiresAt: { $gt: new Date() } // Only non-expired tokens
//     });

//     let tokenDoc = null;
//     let tokenIndex = -1;
    
//     // Find matching token using bcrypt.compare
//     for (let i = 0; i < tokens.length; i++) {
//       const token = tokens[i];
//       const isMatch = await bcrypt.compare(adminRefreshToken, token.token);
//       if (isMatch) {
//         tokenDoc = token;
//         tokenIndex = i;
//         break;
//       }
//     }

//     if (!tokenDoc) {
//       return res.status(403).json({ 
//         status: 'error',
//         message: 'Invalid admin refresh token' 
//       });
//     }

//     // Get user from database
//     const user = await User.findById(tokenDoc.userId);
//     if (!user) {
//       return res.status(404).json({ 
//         status: 'error',
//         message: 'User not found' 
//       });
//     }

//     // Ensure user has admin privileges
//     if (user.role !== 'admin') {
//       return res.status(403).json({ 
//         status: 'error',
//         message: 'Insufficient privileges' 
//       });
//     }

//     // Generate new access token
//     const newAdminAccessToken = jwt.sign(
//       { 
//         id: user._id, 
//         role: user.role,
//         isAdminSession: true 
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: '15m' }
//     );

//     // Generate new refresh token (rotation)
//     const newAdminRefreshToken = crypto.randomBytes(64).toString('hex');
//     const newHashedToken = await bcrypt.hash(newAdminRefreshToken, 10);

//     // Calculate new expiration (7 days)
//     const refreshTokenExpires = new Date();
//     refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7);

//     // Create new token document
//     const newTokenDoc = new RefreshToken({
//       userId: user._id,
//       token: newHashedToken,
//       expiresAt: refreshTokenExpires,
//       userAgent: req.headers['user-agent'],
//       ipAddress: req.ip || req.connection.remoteAddress,
//       isAdminToken: true
//     });

//     // Revoke old token and save new token
//     tokenDoc.revoked = true;
//     tokenDoc.revokedAt = new Date();
//     tokenDoc.replacedByTokenId = newTokenDoc._id;

//     await Promise.all([
//       tokenDoc.save(),
//       newTokenDoc.save()
//     ]);

//     // Set HTTP-only admin cookies
//     const isProduction = process.env.NODE_ENV === "production";
    
//     res.cookie("adminAccessToken", newAdminAccessToken, {
//       httpOnly: true,
//       secure: isProduction,
//       sameSite: isProduction ? "None" : "Lax",
//       maxAge: 15 * 60 * 1000, // 15 minutes
//       path: "/",
//     });

//     res.cookie("adminRefreshToken", newAdminRefreshToken, {
//       httpOnly: true,
//       secure: isProduction,
//       sameSite: isProduction ? "None" : "Lax",
//       maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//       path: "/",
//     });

//     return res.json({ 
//       status: 'success',
//       message: 'Admin tokens refreshed successfully',
//       data: {
//         token: newAdminAccessToken, // Include access token in response
//         tokenInfo: {
//           accessTokenExpires: '15m',
//           refreshTokenExpires: '7d'
//         }
//       }
//     });
//   } catch (error) {
//     console.error('Admin token refresh error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Server error during token refresh',
//       error: process.env.NODE_ENV === "development" ? error.message : undefined
//     });
//   }
// });

module.exports = router;






