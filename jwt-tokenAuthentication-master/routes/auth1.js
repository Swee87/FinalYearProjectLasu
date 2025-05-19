
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
        body('LastName'),
        body('FirstName'),
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
            const FirstName = req.body.FirstName.trim().charAt(0).toUpperCase() + req.body.FirstName.trim().slice(1).toLowerCase();
            const LastName = req.body.LastName.trim().charAt(0).toUpperCase() + req.body.LastName.trim().slice(1).toLowerCase();
            const password = req.body.password.trim();
            const existingUser = await User.findOne({ email });
            if (existingUser) return res.status(400).json({ message: 'User already exists' });

            const newUser = new User({ email, password, FirstName, LastName });
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

router.get("/currentProfile", authenticateToken(), async (req, res) => {
  try {
    // ✅ req.user was set in authMiddleware
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

////////EVERYTHING HERE IS FOR ADMIN-ONLY ROUTES
// Admin-only protected route



// POST /register-administer
router.post(
  "/register-administer",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),
    body('LastName'), 
    body('FirstName'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const FirstName = req.body.FirstName.trim().charAt(0).toUpperCase() + req.body.FirstName.trim().slice(1).toLowerCase();
    const LastName = req.body.LastName.trim().charAt(0).toUpperCase() + req.body.LastName.trim().slice(1).toLowerCase();
    try {
      console.log("Step 1: Request received for email:", email);

      // Step 1: Check if user already exists
      const existingUser = await User.findOne({
        email: email.trim().toLowerCase(),
        role: { $in: ["admin", "user"] },
      });

      if (existingUser) {
        return res.status(400).json({
          message: `This Account already exists as ${existingUser.role}`,
        });
      }
      console.log("Step 2: No existing user found");

      // Step 2: Create new admin user
      const newUser = new User({
        email: email.trim().toLowerCase(),
        password, // Will be hashed by Mongoose pre-save hook
        FirstName, LastName,
        role: "admin",
      });

      // Generate OTP for email verification
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      newUser.resetToken = otp;
      newUser.resetTokenExpires = Date.now() + 3600000; // 1 hour

      await newUser.save();
      console.log("Step 3: New user saved", newUser._id);

      // Step 3: Send OTP via email with timeout
      const sendEmailWithTimeout = async () => {
        const sendPromise = sendEmail(
          newUser.email,
          "Verify your email",
          `Your OTP is: ${otp}`
        );

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Email timeout")), 10000)
        );

        return Promise.race([sendPromise, timeoutPromise]);
      };

      try {
        await sendEmailWithTimeout();
        console.log("Step 4: Email sent successfully");
      } catch (emailErr) {
        console.error("Failed to send email:", emailErr.message);
        // Optionally, delete the user if email fails
        // await User.findByIdAndDelete(newUser._id);
        return res.status(500).json({
          message: "Registration successful but failed to send email",
          userId: newUser._id,
        });
      }

      // Step 4: Respond to client
      res.status(201).json({
        status: "success",
        message: "Admin registration successful",
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
      console.error("Registration error:", {
        message: error.message,
        stack: error.stack,
      });

      res.status(500).json({
        message:
          process.env.NODE_ENV === "development"
            ? `Server error: ${error.message}`
            : "Server error during registration",
      });
    }
  }
);
// router.post(
//   'admin-login',
//   loginLimiter,
//   authenticateToken('admin'),
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
      
//       // If no password exists (Google-only account)
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
//       // if (!user.isVerified) {
//       //   return res.status(400).json({
//       //     status: 'error',
//       //     message: 'Email not verified',
//       //     data: null,
//       //   });
//       // }

//       // testing purpose
//       if (!user.isVerified && !req.query.allowUnverifiedForTesting) {
//         return res.status(403).json({
//           status: 'error',
//           message: 'Email not verified',
//           testHint: 'TEST: Add ?allowUnverifiedForTesting=true to bypass' // Testing helper
//         });
//       }

      

//       // Generate JWT token
//       const token = jwt.sign(
//         { userId: user._id, role: user.role },
//         process.env.JWT_SECRET,
//         { expiresIn: '1m' }
//       );


//       res.cookie('admintoken', token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
//         maxAge: 60000, // 1 minute in milliseconds
//         path: '/',
//     });
//       // Return success response
//       // res.status(200).json({
//       //   status: 'success',
//       //   message: 'Login successful',
//       //   data: {
//       //     token,
//       //     user: {
//       //       _id: user._id,
//       //       email: user.email,
//       //       role: user.role,
//       //       isVerified: user.isVerified,
//       //     },
//       //   },
//       // });

//       // FOR TESTING PURPOSE
//       res.status(200).json({
//         status: 'success',
//         message: 'Login successful (TEST MODE)',
//         data: {
//           user: {
//             _id: user._id,
//             email: user.email,
//             role: user.role,
//             isVerified: user.isVerified,
//           },
//           token: token, // Explicitly include for testing
//           tokenExpiresIn: '1m', // Clear indication
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



router.post(
  "/admin-login",
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
        status: "error",
        message: "Invalid login credentials",
        data: { errors: errors.array() },
      });    
    }

    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return res.status(400).json({
          status: "error",
          message: "Invalid credentials",
        });
      }

      // Ensure user has a password (not Google-only account)
      if (user.googleId && !user.password) {
        return res.status(403).json({
          status: "error",
          message: "This account uses Google Sign-In",
          authMethod: "google"
        });
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          status: "error",
          message: "Invalid credentials",
        });
      }

      // Bypass email verification in dev mode
      if (!user.isVerified && !req.query.allowUnverifiedForTesting) {
        return res.status(403).json({
          status: "error",
          message: "Email not verified",
          testHint: "Add ?allowUnverifiedForTesting=true to bypass"
        });
      }

      // Generate JWT with userId and role
      const token = jwt.sign(
        { 
          userId: user._id,
          role: user.role // ✅ Include role in token
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" } // ✅ Changed from 1m to 1h
      );

      // Set secure cookie
      const isProduction = process.env.NODE_ENV === "production";
      res.cookie("admintoken", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 60 * 60 * 1000, // ✅ 1 hour
        path: "/",
      });

      // Return success response
      res.status(200).json({
        status: "success",
        message: "Login successful",
        data: {
          user: {
            _id: user._id,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified
          },
          testInfo: {
            validationBypass: !!req.query.allowUnverifiedForTesting,
            serverTime: new Date().toISOString()
          }
        }
      });

    } catch (error) {
      console.error("Error during admin login:", error.message);
      res.status(500).json({
        status: "error",
        message: "Server error during login",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  }
);



module.exports = router;






