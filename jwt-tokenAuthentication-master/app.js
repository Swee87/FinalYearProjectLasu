
require('dotenv').config();
const helmet = require('helmet');
const express = require('express');
const { mongoose, connectDB } = require('./config/db');
const cookieParser = require('cookie-parser');
const { Server } = require("socket.io");
const http = require('http');
const cors = require('cors');
const app = express();
const router = express.Router();


const server = http.createServer(app); // Create HTTP server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// Make io available throughout the app
app.set('io', io);

//  Socket events
io.on('connection', (socket) => {
  console.log(" User connected:", socket.id);

  socket.on('disconnect', () => {
    console.log(" User disconnected:", socket.id);
  });
});


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization','x-csrf-token', 'Cache-Control'],
  exposedHeaders: ['set-cookie'],
}));

// Middleware
router.use(express.json());
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"]
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true }
}));


connectDB();

// Routes
const authRoutes = require('./routes/auth1');
const OAuth2Routes = require('./routes/auth');
const cooperativeRoutes = require('./routes/CoopAuth');
const loanRoutes = require('./routes/upLoanpayslip');
const verifyCoopRoutes = require('./routes/verifyCoop');
const applyloan = require('./routes/getLoanRoutes');
const bankListRoutes = require('./routes/bankList');
const trackedLoans = require('./routes/loantrack')
const SavingsRoutes = require('./routes/Savings');
const payStackPaymentRoute = require('./routes/payStackPayment')
const Notification = require('./routes/Notification')
const salarySavings = require('./routes/SalarySavings')
const productRoutes = require('./routes/productEndpoint');
// const reportRoutes = require('./routes/report');
//const payStackRoutes = require('./routes/PayStackInitialize');
const reportRoutes = require('./routes/report');
app.use('/report', reportRoutes); 
app.use('/Notification', Notification)
app.use('/SalarySavings', salarySavings)
app.use('/productEndpoint', productRoutes);

// const payStackRoutes = require('./routes/PayStackInitialize');
// const payStackVerifyRoutes = require('./routes/PayStackVerify');


app.use('/CoopAuth', cooperativeRoutes);
app.use('/auth1', authRoutes);
app.use('/auth', OAuth2Routes);
app.use('/verifyCoop', verifyCoopRoutes);
// <<<<<<< HEAD
app.use('/upLoanpayslip', loanRoutes);
app.use('/getLoanRoutes', applyloan);
app.use('/bankList', bankListRoutes);
app.use('/loantrack', trackedLoans)
app.use('/payStackPayment',payStackPaymentRoute )
app.use('/Savings', SavingsRoutes);
// app.use('/report', reportRoutes);
// app.use('/PayStackInitialize', payStackRoutes);
// app.use('/PayStackVerify', payStackVerifyRoutes);
// =======
// app.use('/PayStackInitialize', payStackRoutes);
// app.use('/PayStackVerify', payStackVerifyRoutes);
// >>>>>>> 23dd0bca2b2e89b96a2a62e4292bcad43d0f4c45

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK' }));

// Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));