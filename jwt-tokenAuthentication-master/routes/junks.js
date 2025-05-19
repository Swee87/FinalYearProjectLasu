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


