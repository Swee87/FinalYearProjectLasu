
// EVERYTHING HERE IS FOR ONE-OFF MEMBERS WHO DON'T HAVE GOOGLE AUTH BUT ONLY EMAIL AND PASSWORD
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/mailer');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');
const authenticateToken = require('../middleware/authMiddleware');
const cors = require('cors');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid'); // Import the UUID library

const router = express.Router();
const app = express();
app.use(cors({
        origin: "http://localhost:5173", 
        credentials: true, 
    }));
// Rate limiter for login route
const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // Max 5 requests per minute
    message: 'Too many login attempts. Please try again later.',
});

// Global rate limiter (optional)
const globalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // Max 100 requests per minute
    message: 'Too many requests. Please try again later.',
});

// Apply global rate limiter to all routes
router.use(globalLimiter);

// Registration for a new user
router.post(
    '/register',
    [
        body('email').isEmail().withMessage('Invalid email'),
        body('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // const { email, password } = req.body;
        

        try {
            const email = req.body.email.trim().toLowerCase();
            const password = req.body.password.trim();
            const existingUser = await User.findOne({ email });
            if (existingUser) return res.status(400).json({ message: 'User already exists' });

            const newUser = new User({ email, password });
            // await newUser.save();

            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            newUser.resetToken = otp;
            newUser.resetTokenExpires = Date.now() + 3600000; // Expire after 1 hour
            await newUser.save();

            await sendEmail(email, 'Verify your email', `Your OTP is: ${otp}`);
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

            // res.status(201).json({ message: 'User registered successfully. Check your email for OTP.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error', error });
        }
    }
);

// Login user
router.post(
  '/login',
  loginLimiter,
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password')
      .exists()
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Not a valid credential',
        data: { errors: errors.array() },
      });
    }

    try {
      const email = req.body.email.trim().toLowerCase();
      const password = req.body.password.trim();

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({
          status: 'error',
          message: 'You do not have an account',
          data: null,
        });
      }

      // Check auth method first - BEFORE password comparison
      if (user.googleId) {
        return res.status(403).json({
          status: 'error',
          message: ' Kindly Sign-In with Google',
          authMethod: 'google',
        });
      }
      
      // If no password exists (Google-only account)
      if (!user.password) {
        return res.status(403).json({
          status: 'error',
          message: 'Please use Google Sign-In',
          authMethod: 'google'
        });
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Password match:', isMatch);
      if (!isMatch) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid credentials',
          data: null,
        });
      }

      if (user.googleId && !user.password) {
        return res.status(403).json({
          status: 'error',
          message: 'This account uses Google Sign-In',
          authMethod: 'google'
        });
      }

      // Check email verification
      // if (!user.isVerified) {
      //   return res.status(400).json({
      //     status: 'error',
      //     message: 'Email not verified',
      //     data: null,
      //   });
      // }

      // testing purpose
      if (!user.isVerified && !req.query.allowUnverifiedForTesting) {
        return res.status(403).json({
          status: 'error',
          message: 'Email not verified',
          testHint: 'TEST: Add ?allowUnverifiedForTesting=true to bypass' // Testing helper
        });
      }

      

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1m' }
      );


      res.cookie('authtoken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 60000, // 1 minute in milliseconds
        path: '/',
    });
      // Return success response
      // res.status(200).json({
      //   status: 'success',
      //   message: 'Login successful',
      //   data: {
      //     token,
      //     user: {
      //       _id: user._id,
      //       email: user.email,
      //       role: user.role,
      //       isVerified: user.isVerified,
      //     },
      //   },
      // });

      // FOR TESTING PURPOSE
      res.status(200).json({
        status: 'success',
        message: 'Login successful (TEST MODE)',
        data: {
          user: {
            _id: user._id,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
          },
          token: token, // Explicitly include for testing
          tokenExpiresIn: '1m', // Clear indication
          testInfo: {
            cookieSet: true,
            validationBypass: !!req.query.allowUnverifiedForTesting,
            serverTime: new Date().toISOString()
          }
        }
      });
    } catch (error) {


      if (error.message.includes('googleId')) {
        return res.status(403).json({
          status: 'error',
          message: 'Authentication method mismatch',
          authMethod: 'google'
        });
      }
      console.error('Error during login:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error',
      });
    }
  }
);
// Logout user
router.post('/logout', async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) throw err;
            res.clearCookie('connect.sid'); // Clear session cookie
            res.json({ message: 'Logged out successfully' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not log out', error });
    }
});

// Request password reset
// router.post(
//   '/forgot-password',
//   [body('email').isEmail().withMessage('Invalid email')],
//   async (req, res) => {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//           return res.status(400).json({ errors: errors.array() });
//       }

      
//       try {
//         const email = req.body.email.trim().toLowerCase();
//           const user = await User.findOne({ email });
//           if (!user) {
//               console.log(`Password reset requested for non-existent email: ${email}`);
//               return res.json({ message: 'If an account exists with that email, a password reset link has been sent.' });
//           }

//           // Generate and hash the reset token
//           const resetToken = crypto.randomBytes(32).toString('hex');
//           const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

//           // Save the hashed token and expiration time
//           user.resetToken = hashedToken;
//           user.resetTokenExpires = Date.now() + 3600000; // 1 hour
//           await user.save();
//           //https://www.upwork.com/ab/account-security/login?redir=%2Fnx%2Fsignup%2Fverify-email%2Ftoken%2FQqF1lpEKzM%3Ffrkscc%3Dj5vpG2AlyETa

//           // Send the reset link via email
//           const resetLink = `http://localhost:5173/update-password?token=${resetToken}`;
//           await sendEmail(email, 'Password Reset Request', `Click the link to reset your password: ${resetLink}`);

//           res.status(200).json({ message: 'Password reset link sent to your email' , status:"success" });
//       } catch (error) {
//           console.error('Error processing forgot password request:', error);
//           res.status(500).json({  status: 'error',
//             message: 'Server error' });
//       }
//   }
// );

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

// token verification



// router.post(
//   '/forgot-password',
//   [body('email').isEmail().withMessage('Invalid email')],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     try {
//       const email = req.body.email.trim().toLowerCase();
//       const user = await User.findOne({ email });
      
//       if (!user) {
//         console.log('Password reset request processed (user not found).');
//         return res.json({ 
//           message: 'If an account exists with that email, a password reset link has been sent.' 
//         });
//       }

//       // Generate token and salt
//       const resetToken = crypto.randomBytes(64).toString('hex');
//       const salt = crypto.randomBytes(16);
//       const hashedToken = crypto.pbkdf2Sync(resetToken, salt, 100000, 64, 'sha512').toString('hex');
//       const resetTokenId = uuidv4();

//       // Save to user
//       user.resetToken = hashedToken;
//       user.resetTokenSalt = salt.toString('hex');
//       user.resetTokenExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
//       user.resetTokenId = resetTokenId;
//       await user.save();

//       // Create reset link (using UUID only)
//       // const resetLink = `${process.env.FRONTEND_URL}/c/${resetTokenId}`;
//       // In your forgot-password route
//     const resetLink = `${process.env.FRONTEND_URL}/auth1/c/${resetTokenId}`;
//     //const resetLink = `${process.env.BACKEND_URL}/auth1/c/${resetTokenId}`
//     const securityToken = resetToken
// // Example: http://localhost:3000/auth/c/e11dd4cb-53a5-4cfc-af04-2388e705b1f5
      
// await sendEmail(
//   email,
//   'Password Reset Request',
//   `Click this link to reset your password: ${resetLink}\n\n` +
//   `Your security token: ${securityToken}\n\n` +
//   `This token will expire in 15 minutes.`
// );

//       res.json({ 
//         message: 'Password reset link sent to your email', 
//         status: 'success' 
//       });
//     } catch (error) {
//       console.error('Forgot password error:', error);
//       res.status(500).json({ 
//         status: 'error', 
//         message: 'Server error processing your request' 
//       });
//     }
//   }
// );

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
// Request password reset 2
// router.post(
//   '/forgot-password',
//   [body('email').isEmail().withMessage('Invalid email')],
//   async (req, res) => {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//           return res.status(400).json({ errors: errors.array() });
//       }

//       try {
//           const email = req.body.email.trim().toLowerCase();

//           const user = await User.findOne({ email });
//           if (!user) {
//               console.log('Password reset request processed.');
//               return res.json({ message: 'If an account exists with that email, a password reset link has been sent.' });
//           }

//           // Generate a long token and a unique salt
//           const resetToken = crypto.randomBytes(64).toString('hex');
//           const salt = crypto.randomBytes(16);

//           // Hash the token using PBKDF2 with 100,000 iterations
//           const hashedToken = crypto.pbkdf2Sync(resetToken, salt, 100000, 64, 'sha512').toString('hex');

//           // Save the hashed token and salt
//           user.resetToken = hashedToken;
//           user.resetTokenSalt = salt.toString('hex');
//           user.resetTokenExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
//           await user.save();

//           // Send the reset link via email
//           const resetLink = `http://localhost:5173/update-password?token=${resetToken}`;
//           await sendEmail(email, 'Password Reset Request', `Click the link to reset your password: ${resetLink}`);

//           res.status(200).json({ message: 'Password reset link sent to your email', status: 'success' });
//       } catch (error) {
//           console.error('Error processing forgot password request:', error.message);
//           res.status(500).json({ status: 'error', message: 'Server error' });
//       }
//   }
// );

// Reset password2
// router.post(
//   '/update-password',
//   [
//     body('token').exists().withMessage('Token is required'),
//     body('password')
//       .isLength({ min: 8 })
//       .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/)
//       .withMessage('Password must include at least one uppercase letter, one lowercase letter, and one number'),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { token, password } = req.body;

//     try {
//       // Find the user with the valid token
//       const user = await User.findOne({
//         resetTokenSalt: { $exists: true },
//         resetTokenExpires: { $gt: Date.now() },
//       });

//       if (!user) {
//         return res.status(400).json({ message: 'Invalid or expired token' });
//       }

//       // Hash the incoming token using the stored salt
//       const hashedToken = crypto.pbkdf2Sync(
//         token,
//         Buffer.from(user.resetTokenSalt, 'hex'),
//         100000,
//         64,
//         'sha512'
//       ).toString('hex');

//       // Compare the hashed token with the stored resetToken
//       if (hashedToken !== user.resetToken) {
//         return res.status(400).json({ message: 'Invalid or expired token' });
//       }

//       // Hash the new password
//       const hashedPassword = await bcrypt.hash(password, 10);

//       // Update the user's password and invalidate the token
//       user.password = hashedPassword;
//       user.resetToken = undefined;
//       user.resetTokenSalt = undefined;
//       user.resetTokenExpires = undefined;

//       // Mark the password field as modified to prevent double hashing
//       user.isModified = function (field) {
//         return field !== 'password';
//     };
//       await user.save();

//       res.status(200).json({ message: 'Password reset successfully', status: 'success' });
//     } catch (error) {
//       console.error('Error resetting password:', error);
//       res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
//     }
//   }
// );






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

//update2
// router.post(
//   '/update-password',
//   [
//     body('token').exists().withMessage('Token is required'),
//     body('password')
//       .isLength({ min: 8 })
//       .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/)
//       .withMessage('Password must include at least one uppercase letter, one lowercase letter, and one number'),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { token, password } = req.body;

//     try {
//       // Find the user with the valid token
//       const user = await User.findOne({
//         resetTokenSalt: { $exists: true },
//         resetTokenExpires: { $gt: Date.now() },
//       });

//       if (!user) {
//         return res.status(400).json({ message: 'Invalid or expired token' });
//       }

//       // Hash the incoming token using the stored salt
//       const hashedToken = crypto.pbkdf2Sync(
//         token,
//         Buffer.from(user.resetTokenSalt, 'hex'),
//         100000,
//         64,
//         'sha512'
//       ).toString('hex');

//       // Compare the hashed token with the stored resetToken
//       if (hashedToken !== user.resetToken) {
//         return res.status(400).json({ message: 'Invalid or expired token' });
//       }

//       // Hash the new password
//       const hashedPassword = await bcrypt.hash(password, 10);

//       // Update the user's password and invalidate the token
//       user.password = hashedPassword;
//       user.resetToken = undefined;
//       user.resetTokenSalt = undefined;
//       user.resetTokenExpires = undefined;
//       user.resetTokenId = undefined; // Clear the UUID
//       user.isModified = function (field) {
//                 return field !== 'password';
//             };
//       await user.save();

//       res.status(200).json({ message: 'Password reset successfully', status: 'success' });
//     } catch (error) {
//       console.error('Error resetting password:', error);
//       res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
//     }
//   }
// );

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
// Protected route: Fetch user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Profile fetched successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
});

// Admin-only protected route
router.get('/admin-dashboard', authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        const role = req.role;

        if (role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden. Admin access required.' });
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Admin dashboard fetched successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;







// const express = require('express');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const crypto = require('crypto');
// const User = require('../models/User');
// const sendEmail = require('../utils/mailer');
// require('dotenv').config();
// const authenticateToken = require('../middleware/authMiddleware');

// const router = express.Router();

// // Registration for a new user
// router.post('/register', async (req, res) => {
//         console.log('Request Body:', req.body); // Log the request body

//         const { email, password } = req.body;


//         if (!email || !password) {
//                 return res.status(400).json({ message: 'Email and password are required' });
//         }

//         try {
//                 const existingUser = await User.findOne({ email });
//                 if (existingUser) return res.status(400).json({ message: 'User already exists' });

//                 const hashedPassword = await bcrypt.hash(password, 10);
//                 const newUser = new User({ email, password: hashedPassword });
//                 await newUser.save();

//                 const otp = Math.floor(100000 + Math.random() * 900000).toString();
//                 newUser.resetToken = otp;
//                 newUser.resetTokenExpires = Date.now() + 3600000; // Expire after 1 hour
//                 await newUser.save();

//                 await sendEmail(email, 'Verify your email', `Your OTP is: ${otp}`);

//                 res.status(201).json({ message: 'User registered successfully. Check your email for OTP.' });
//         } catch (error) {
//                 console.error(error);
//                 res.status(500).json({ message: 'Server error', error });
//         }
// });


// // Login user
// router.post('/login', async (req, res) => {
//         const { email, password } = req.body;

//         try {
//                 const user = await User.findOne({ email });
//                 if (!user) return res.status(400).json({ message: 'Invalid credentials' });

//                 const isMatch = await bcrypt.compare(password, user.password);
//                 if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

//                 if (!user.isVerified) return res.status(400).json({ message: 'Email not verified' });

//                 // Create session
//                 req.session.userId = user._id;

//                 // Generate JWT
//                 const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

//                 res.json({ message: 'Login successful', token });
//         } catch (error) {
//                 console.error(error);
//                 res.status(500).json({ message: 'Server error', error });
//         }
// });

// // Logout user
// router.post('/logout', async (req, res) => {
//         try {
//                 req.session.destroy(err => {
//                         if (err) throw err;
//                         res.clearCookie('connect.sid'); // Clear session cookie
//                         res.json({ message: 'Logged out successfully' });
//                 });
//         } catch (error) {
//                 console.error(error);
//                 res.status(500).json({ message: 'Could not log out', error });
//         }
// });

// // Request password reset
// router.post('/forgot-password', async (req, res) => {
//         const { email } = req.body;

//         try {
//                 const user = await User.findOne({ email });
//                 if (!user) return res.status(400).json({ message: 'No account with that email' });

//                 const resetToken = crypto.randomBytes(20).toString('hex');
//                 user.resetToken = resetToken;
//                 user.resetTokenExpires = Date.now() + 3600000; // 1 hour
//                 await user.save();

//                 const resetLink = `http://yourfrontend.com/reset-password?token=${resetToken}`;
//                 await sendEmail(email, 'Password Reset Request', `Click the link to reset your password: ${resetLink}`);

//                 res.json({ message: 'Password reset link sent to your email' });
//         } catch (error) {
//                 console.error(error);
//                 res.status(500).json({ message: 'Server error', error });
//         }
// });

// // Reset password
// router.post('/reset-password', async (req, res) => {
//         const { token, newPassword } = req.body;

//         try {
//                 const user = await User.findOne({
//                         resetToken: token,
//                         resetTokenExpires: { $gt: Date.now() },
//                 });

//                 if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

//                 const hashedPassword = await bcrypt.hash(newPassword, 10);
//                 user.password = hashedPassword;
//                 user.resetToken = undefined;
//                 user.resetTokenExpires = undefined;
//                 await user.save();

//                 res.json({ message: 'Password reset successfully' });
//         } catch (error) {
//                 console.error(error);
//                 res.status(500).json({ message: 'Server error', error });
//         }
// });

// // Verify OTP
// router.post('/verify-otp', async (req, res) => {
//         const { email, otp } = req.body;

//         if (!email || !otp) {
//                 return res.status(400).json({ message: 'Email and OTP are required' });
//         }

//         try {
//                 // Find the user by email
//                 const user = await User.findOne({ email });
//                 if (!user) return res.status(400).json({ message: 'User not found' });

//                 // Check if the OTP matches and hasn't expired
//                 if (user.resetToken !== otp || user.resetTokenExpires < Date.now()) {
//                         return res.status(400).json({ message: 'Invalid or expired OTP' });
//                 }

//                 // Mark the user as verified
//                 user.isVerified = true;
//                 user.resetToken = undefined; // Clear the OTP after verification
//                 user.resetTokenExpires = undefined;
//                 await user.save();

//                 res.json({ message: 'Email verified successfully' });
//         } catch (error) {
//                 console.error(error);
//                 res.status(500).json({ message: 'Server error', error });
//         }
// });
// // Import the middleware

// // Example of a protected route: Fetch user profile
// router.get('/profile', authenticateToken, async (req, res) => {
//     try {
//         const userId = req.userId; // The user ID extracted from the token

//         // Fetch the user from the database
//         const user = await User.findById(userId).select('-password'); // Exclude the password field
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         res.json({ message: 'Profile fetched successfully', user });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error', error });
//     }
// });

// module.exports = router;