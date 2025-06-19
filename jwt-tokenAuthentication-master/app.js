// require('dotenv').config();
// const express = require('express');
// const { mongoose, connectDB } = require('./config/db');
// const session = require('express-session');
// const MongoStore = require('connect-mongo');
// const cookieParser = require('cookie-parser');
// const cors = require('cors');

// const sendEmail = require('./utils/mailer');

// const app = express();
// app.use(express.json());
// app.use(cookieParser());

// // ✅ Only one CORS middleware with correct settings
// app.use(cors({
//   origin: "http://localhost:5173",
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'X-Requested-With']
// }));

// // Connect to the database
// connectDB();

// // Session configuration
// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: false,
//   store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
//   cookie: {
//     httpOnly: true,
//     secure: false, // Set to true in production with HTTPS
//     maxAge: 1000 * 60,
//     sameSite: 'none', // Required for cross-origin
//     name: 'sessionId',
//   },
// }));

// // Routes
// const authRoutes = require('./routes/auth1');
// const OAuth2Routes = require('./routes/auth');
// app.use('/auth1', authRoutes);
// app.use('/auth', OAuth2Routes);

// // Health check
// app.get('/health', (req, res) => {
//   res.json({ status: 'OK' });
// });

// // Database connection check
// let isConnected = false;
// mongoose.connection.once('open', () => {
//   isConnected = true;
//   console.log('MongoDB connected successfully');
// });

// mongoose.connection.on('error', (err) => {
//   console.error('MongoDB connection error:', err);
// });

// app.use((req, res, next) => {
//   if (!isConnected) {
//     return res.status(503).json({ message: 'Database connection failed' });
//   }
//   next();
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// require('dotenv').config();
// const express = require('express');
// const { mongoose, connectDB } = require('./config/db');
// const cookieParser = require('cookie-parser');
// const cors = require('cors');
// require('dotenv').config();
// const express = require('express');
// const { mongoose, connectDB } = require('./config/db');
// const session = require('express-session');
// const MongoStore = require('connect-mongo');
// const cookieParser = require('cookie-parser');
// const cors = require('cors');
// const app = express();

// // Middleware
// app.use(express.json());
// app.use(cookieParser());

// // ✅ Single CORS configuration (remove from auth.js)
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'X-Requested-With'],
//   })
// );

// // Session configuration
// // app.use(session({
// //   secret: process.env.SESSION_SECRET,
// //   resave: false,
// //   saveUninitialized: false,
// //   store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
// //   cookie: {
// //     httpOnly: true,
// //     secure: false, // Set to true in production with HTTPS
// //     maxAge: 1000 * 60,
// //     sameSite: 'none', // Required for cross-origin
// //     name: 'sessionId',
// //   },
// // }));

// app.use(session({
//   secret: process.env.SESSION_SECRET || 'fallback-secret-key',
//   resave: false,
//   saveUninitialized: false,
//   store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
//   cookie: {
//     httpOnly: true,
//     secure: true, // Change to true in production
//     maxAge: 1000 * 60 * 60 * 24, // 1 day
//     sameSite: 'none', // Required for cross-origin apps
//     domain: 'localhost', // Optional – remove in dev if causing issues
//   },
//   name: 'sessionId',
// }));


// // Connect to the database
// connectDB();

// // Routes
// const authRoutes = require('./routes/auth1');
// const OAuth2Routes = require('./routes/auth');
// const cooperativeRoutes = require('./routes/CoopAuth');
// const loanRoutes = require('./routes/index');
// app.use('/CoopAuth', cooperativeRoutes);
// app.use('/auth1', authRoutes);
// app.use('/auth', OAuth2Routes);
// app.use('/index', loanRoutes);

// // Health check
// app.get('/health', (req, res) => {
//   res.json({ status: 'OK' });
// });

// // Database connection check
// let isConnected = false;
// mongoose.connection.once('open', () => {
//   isConnected = true;
//   console.log('MongoDB connected successfully');
// });

// mongoose.connection.on('error', (err) => {
//   console.error('MongoDB connection error:', err);
// });

// app.use((req, res, next) => {
//   if (!isConnected) {
//     return res.status(503).json({ message: 'Database connection failed' });
//   }
//   next();
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

require('dotenv').config();
const express = require('express');
const { mongoose, connectDB } = require('./config/db');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();
const router = express.Router();


// app.use(cors({
//   origin: "http://localhost:5173",
//   credentials: true,
//   exposedHeaders: ['set-cookie'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token']
// }));

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
router.use(express.json());
app.use(express.json());
app.use(cookieParser());

// CORS
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'X-Requested-With'],
//     exposedHeaders: ['Authorization']
//   })
// );

// Database
connectDB();

// Routes
const authRoutes = require('./routes/auth1');
const OAuth2Routes = require('./routes/auth');
const cooperativeRoutes = require('./routes/CoopAuth');
const loanRoutes = require('./routes/upLoanpayslip');
const verifyCoopRoutes = require('./routes/verifyCoop');
const payStackRoutes = require('./routes/PayStackInitialize');
const payStackVerifyRoutes = require('./routes/PayStackVerify');


app.use('/CoopAuth', cooperativeRoutes);
app.use('/auth1', authRoutes);
app.use('/auth', OAuth2Routes);
app.use('/upLoanpayslip', loanRoutes);
app.use('/verifyCoop', verifyCoopRoutes);
app.use('/PayStackInitialize', payStackRoutes);
app.use('/PayStackVerify', payStackVerifyRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK' }));

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));