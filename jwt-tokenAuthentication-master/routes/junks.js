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

// router.get("/appliedLoans", authMiddleware("admin"), async (req, res) => {
//   try {
//       const status = req.query.status || "pending";
//     // 1. Get status from query parameter with default to "pending
//     if (!WORKFLOW.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: `Invalid status. Valid statuses: ${WORKFLOW.join(", ")}`
//       });
//     }

//     const pendingLoans = await Loan.find({ status: status })
//       .populate({
//         path: "member",
//         model: "CooperativeMember",
//         select: "memberId isVerified userId phoneNumber bankName accountNumber  staffType payMentProof appId",
//         populate: {
//           path: "userId",
//           model: "User",
//           select: "FirstName LastName email"
//         }
//       });

//     // Explicit verification check
//     const validLoans = pendingLoans.filter(loan => 
//       loan.member?.isVerified && loan.member?.userId
//     );

//     // Format response with correct member ID
//     const formattedLoans = validLoans.map(loan => ({
//       loanId: loan._id,
//       loanAmount: loan.loanAmount,
//       monthlySavings: loan.monthlySavings,
//       repayment: loan.repayment,
//       about: loan.about,
//       paySlipUrl: loan.paySlipUrl,
//       createdAt: loan.created_at,
//       updatedAt: loan.updated_at,
//       status: loan.status,
//       member: {
//         firstName: loan.member.userId.FirstName,
//         lastName: loan.member.userId.LastName,
//         email: loan.member.userId.email,
//         memberId: loan.member.memberId, // Use custom member ID
//         userId: loan.member.userId._id,
//         phoneNumber: loan.member.phoneNumber,
//         bankName: loan.member.bankName,
//         accountNumber: loan.member.accountNumber,
//         staffType: loan.member.staffType,
//         payMentProof: loan.member.payMentProof,
//         isVerified: loan.member.isVerified,
//         appId: loan.member.appId // Use the member's ObjectId as appId

//       },
//     }));

//     if (formattedLoans.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No qualifying pending loans found.",
//         debug: {
//           totalPendingLoans: pendingLoans.length,
//           populatedMembers: pendingLoans.filter(l => l.member).length
//         }
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       count: formattedLoans.length,
//       data: formattedLoans
//     });
//   } catch (error) {
//     console.error("Error fetching applied loans:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error while retrieving pending loans.",
//       error: error.message
//     });
//   }
// });



// Workflow array 

// Helper function
// function isValidTransition(currentStatus, nextStatus) {
//   const currentIndex = WORKFLOW.indexOf(currentStatus);
//   const newIndex = WORKFLOW.indexOf(nextStatus);
//   return newIndex === currentIndex + 1;
// }
// // for Approving a loan
// router.patch("/loanAction", authMiddleware("admin"), async (req, res) => {
//   const { loanIds, newStatus } = req.body;

//   if (!Array.isArray(loanIds) || loanIds.length === 0) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid input: No loan IDs provided.",
//     });
//   }

//   if (!WORKFLOW.includes(newStatus)) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid target status.",
//     });
//   }

//   try {
//     let updatedLoans = [];
//     let errors = [];

//     for (let id of loanIds) {
//       const loan = await Loan.findById(id);

//       if (!loan) {
//         errors.push({ id, error: "Loan not found" });
//         continue;
//       }

//       if (!isValidTransition(loan.status, newStatus)) {
//         errors.push({
//           id,
//           error: `Invalid transition from "${loan.status}" to "${newStatus}"`,
//           allowedNext: [WORKFLOW[WORKFLOW.indexOf(loan.status) + 1]],
//         });
//         continue;
//       }
       
//       if(loan.status === "approved"){
//         loan.approvedAt = new Date();
//       }

//       function updateLoanDates(loan){
//         if(loan.status === "approved"){
//           loan.approvedAt = new Date();
//         }

//         // repayment means the repaymentDuration
//         if(loan.status === "disbursed"){
//           loan.disbursedAt = new Date();
//           const dueDate = new Date(loan.disbursedAt);
//           dueDate.setMonth(dueDate.getMonth() + loan.repayment);
//           loan.dueAt = dueDate;
//         }
//       }
      
//       const loanDateOnSpecificPurpose = await Loan.findById(loanIds)
//       if(!loanDateOnSpecificPurpose){
//         errors.push({ id, error: "Loan not found" });
//         continue;
//       }
//       updateLoanDates(loanDateOnSpecificPurpose);
    
//       //Update status
//       const updatedLoan = await Loan.findByIdAndUpdate(
//         id,
//         {
//           status: newStatus,
//           updatedAt: new Date(),
//         },
//         { new: true }
//       );

//       updatedLoans.push(updatedLoan);
//     }

//     return res.json({
//       success: true,
//       message: `${updatedLoans.length} loans updated successfully.`,
//       updated: updatedLoans,
//       errors,
//     });

//   } catch (error) {
//     console.error("Error updating loan statuses:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error while updating loans.",
//       error: error.message,
//     });
//   }
// });


 //router.post(
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
// ));




