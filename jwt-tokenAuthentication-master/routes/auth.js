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
// Enhanced JWT generation
// function generateJWT(user) {
//     return jwt.sign(
//         {
//             id: user._id, // Using _id which is standard in Mongoose
//             email: user.email,
//             role: user.role || 'user' // Default role
//         },
//         process.env.JWT_SECRET,
//         { expiresIn: process.env.JWT_EXPIRES_IN || '1m' }
//     );
// }

function generateJWT(user) {
  return jwt.sign(
      {
          id: user._id,
          email: user.email,
          role: user.role || 'user'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1m' } // Force 1 minute expiration
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
                name: payload.name || '',
                picture: payload.picture || ''
            }},
            { 
                upsert: true,
                new: true 
            }
        );

        // Generate JWT
        const jwtToken = generateJWT(user);
        console.log("Generated JWT:", jwtToken); // Log the generated JWT
        // Set secure cookie
        // In your Google OAuth endpoint (/home)
        // res.cookie('authtoken', jwtToken, {
        //   httpOnly: true,
        //   secure: process.env.NODE_ENV === 'production',
        //   sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Changed for development
        //   // maxAge: 86400000,
        //   maxAge: 1000 * 60 , // 1 day
        //   path: '/',
        // });

        res.cookie('authtoken', jwtToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          maxAge: 60000, // 1 minute in milliseconds
          path: '/',
      });
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
              secure: process.env.NODE_ENV === 'production',
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
      res.cookie('authtoken', newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          maxAge: 60000, // 1 minute
          path: '/'
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





// const express = require('express');
// const router = express.Router();
// const { OAuth2Client } = require('google-auth-library');
// const User = require('../models/User'); // Import your User model
// const jwt = require('jsonwebtoken');
// require('dotenv').config();
// const cors = require('cors');

// const client = new OAuth2Client(process.env.Client_ID);

// // const app = express();
// // app.use(express.json());
// // // app.use(express.urlencoded({ extended: true }));
// // app.use(cors({
// //         origin: "http://localhost:5173", 
// //         credentials: true, 
// //     }));

// // Helper function to generate JWT
// function generateJWT(user) {
//     return jwt.sign(
//         { id: user.id, email: user.email, role: user.role },
//         process.env.JWT_SECRET,
//         { expiresIn: '1d' }
//     );
// }

// // router.post('/home', async (req, res) => {
// //     console.log('Request body:', req.body); // Log the incoming request body

// //     const { token } = req.body;

// //     if (!token) {
// //         return res.status(400).json({ message: 'Token is required' });
// //     }

// //     try {
// //         // Verify the Google token
// //         const ticket = await client.verifyIdToken({
// //             idToken: token,
// //             audience: process.env.Client_ID,
// //         });

// //         const payload = ticket.getPayload();

// //         if (!payload || !payload.sub || !payload.email) {
// //             return res.status(400).json({ message: 'Invalid Google token' });
// //         }

// //         // Check if the user exists in the database by Google ID or email
// //         let user = await User.findOne({ googleId: payload.sub });

// //         if (!user) {
// //             // If the user does not exist by Google ID, check by email
// //             user = await User.findOne({ email: payload.email });

// //             if (user) {
// //                 // Link the Google ID to the existing user
// //                 user.googleId = payload.sub;
// //                 await user.save();
// //             } else {
// //                 // If the user does not exist at all, create a new user (sign-up)
// //                 user = await User.create({
// //                     googleId: payload.sub,
// //                     email: payload.email,
// //                     isVerified: true,
// //                 });
// //             }
// //         }

// //         // Generate a JWT for the user
// //         const jwtToken = generateJWT(user);

// //         // Set the JWT as an HTTP-only cookie
// //         res.cookie('authToken', jwtToken, {
// //             httpOnly: true,
// //             secure: process.env.NODE_ENV === 'production',
// //             sameSite: 'lax',
// //             maxAge: 1000 * 60 * 60 * 24, // 1 day
// //         });

// //         // Return the user data (without the token)
// //         res.json({ user });
// //     } catch (error) {
// //         console.error('Error verifying Google token:', error);
// //         res.status(400).json({ message: 'Invalid Google token' });
// //     }
// // });
// router.post('/home', async (req, res) => {
//     try {
//         const { token } = req.body;

//         // Verify the Google token
//         const ticket = await client.verifyIdToken({
//             idToken: token,
//             audience: process.env.Client_ID,
//         });

//         const payload = ticket.getPayload();

//         if (!payload || !payload.sub || !payload.email) {
//             return res.status(400).json({ message: 'Invalid Google token' });
//         }

//         // Check if the user exists in the database
//         let user = await User.findOne({ googleId: payload.sub });

//         if (!user) {
//             user = await User.create({
//                 googleId: payload.sub,
//                 email: payload.email,
//                 isVerified: true,
//             });
//         }
         
//         console.log("User found or created:", user); // Log the user object
//         console.log(token); // Log the user ID


//         // Generate a JWT for the user
//         const jwtToken = generateJWT(user);
//         console.log("Generated JWT:", jwtToken); // Log the generated JWT

//         // Set the JWT as an HTTP-only cookie
//         // res.cookie('authToken', jwtToken, {
//         //     httpOnly: true,
//         //     //secure: process.env.NODE_ENV === 'production',
//         //     secure:false,
//         //     sameSite: 'lax',
//         //     maxAge: 1000 * 60 * 60 * 24, // 1 day
//         // });

//         res.cookie('authToken', jwtToken, {
//             httpOnly: true,
//             secure: false, // true in production
//             sameSite: 'none', // Must be 'none' for cross-origin in development
//             maxAge: 86400000, // 1 day
//             path: '/'
//           });
        

//         res.json({ user , token: jwtToken }); // Return the user and token
//     } catch (error) {
//         console.error('Error verifying Google token:', error);
//         res.status(400).json({ message: 'Invalid Google token' });
//     }
// });
// router.get('/current', async (req, res) => {
//     try {
//         // Check both cookie and Authorization header
//         let token = req.cookies.authToken || req.headers.authorization?.split(' ')[1];
        
//         if (!token) {
//             console.log("No auth token found");
//             return res.status(401).json({ message: 'Not authenticated' });
//         }

//         // Verify token
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         const user = await User.findById(decoded.id);
        
//         if (!user) {
//             return res.status(401).json({ message: 'User not found' });
//         }

//         res.json({ user });
//     } catch (error) {
//         console.error('Error fetching current user:', error);
        
//         // Clear invalid cookie if present
//         if (req.cookies.authToken) {
//             res.clearCookie('authToken');
//         }
        
//         res.status(401).json({ 
//             message: 'Invalid token',
//             error: error.message 
//         });
//     }
// });
// module.exports = router;

// // router.post('/home', async (req, res) => {
// //     const { token } = req.body;

// //     try {
// //         // Verify the Google token
// //         const ticket = await client.verifyIdToken({
// //             idToken: token,
// //             audience: process.env.Client_ID,
// //         });

// //         const payload = ticket.getPayload();

// //         if (!payload || !payload.sub || !payload.email) {
// //             return res.status(400).json({ message: 'Invalid Google token' });
// //         }

// //         // Check if the user exists in the database by Google ID or email
// //         let user = await User.findOne({ googleId: payload.sub });

// //         if (!user) {
// //             // If the user does not exist by Google ID, check by email
// //             user = await User.findOne({ email: payload.email });

// //             if (user) {
// //                 // Link the Google ID to the existing user
// //                 user.googleId = payload.sub;
// //                 await user.save();
// //             } else {
// //                 // If the user does not exist at all, create a new user (sign-up)
// //                 user = await User.create({
// //                     googleId: payload.sub,
// //                     email: payload.email,
// //                     isVerified: true,
// //                 });
// //             }
// //         }

// //         // Generate a JWT for the user (sign-in)
// //         const jwtToken = generateJWT(user);

// //         // Return the JWT and user data
// //         res.json({ token: jwtToken, user });
// //     } catch (error) {
// //         console.error('Error verifying Google token:', error);
// //         res.status(400).json({ message: 'Invalid Google token' });
// //     }
// // });


























// // const express = require('express');
// // const router = express.Router();
// // const passport = require('passport');
// // const jwt = require('jsonwebtoken');
// // require('dotenv').config();
// // const GoogleStrategy = require('passport-google-oauth20').Strategy;
// // const findOrCreate = require('mongoose-findorcreate');
// // const User = require('../models/User'); // Import the updated model

// // // Apply the `findOrCreate` plugin to the User schema
// // User.schema.plugin(findOrCreate);

// // // Passport initialization
// // passport.serializeUser((user, cb) => {
// //     process.nextTick(() => {
// //         cb(null, { id: user.id, email: user.email, role: user.role });
// //     });
// // });

// // passport.deserializeUser(async (user, cb) => {
// //     try {
// //         const userDoc = await User.findById(user.id);
// //         return cb(null, userDoc);
// //     } catch (error) {
// //         return cb(error);
// //     }
// // });

// // // Configure Google OAuth Strategy
// // passport.use(
// //     new GoogleStrategy(
// //         {
// //             clientID: process.env.Client_ID,
// //             clientSecret: process.env.Client_Secret,
// //             callbackURL: 'http://localhost:5000/auth/google/home',
// //         },
// //         async (accessToken, refreshToken, profile, cb) => {
// //             try {
// //                 const user = await User.findOrCreate(
// //                     { googleId: profile.id },
// //                     {
// //                         email: profile.emails[0].value,
// //                         isVerified: true,
// //                     }
// //                 );
// //                 return cb(null, user);
// //             } catch (error) {
// //                 return cb(error);
// //             }
// //         }
// //     )
// // );

// // // Helper function to generate JWT
// // function generateJWT(user) {
// //     return jwt.sign(
// //         { id: user.id, email: user.email, role: user.role },
// //         process.env.JWT_SECRET,
// //         { expiresIn: '1d' }
// //     );
// // }

// // // Routes
// // router.get(
// //     '/auth/google',
// //     passport.authenticate('google', { scope: ['profile', 'email'] })
// // );

// // router.get(
// //     '/auth/google/home',
// //     passport.authenticate('google', { failureRedirect: '/login' }),
// //     (req, res) => {
// //         const token = generateJWT(req.user);
// //         res.cookie('token', token, {
// //             httpOnly: true,
// //             secure: process.env.NODE_ENV === 'production',
// //             sameSite: 'lax',
// //             maxAge: 1000 * 60 * 60 * 24, // 1 day
// //         });
// //         res.redirect('http://localhost:5173/home'); // Redirect to the frontend home page
// //     }
// // );

// // module.exports = router;