const SibApiV3Sdk = require('sib-api-v3-sdk');
require('dotenv').config();

const sendEmail = async (to, subject, text) => {
  try {
    console.log('Environment variables:', {
      user: process.env.EMAIL_USER,
      apiKey: process.env.ELIJAY_TECH ? '****' : 'undefined',
    });
    console.log('Node.js version:', process.version);
    console.log('OpenSSL version:', process.versions.openssl);

    // Here is my Brevo API client configuration
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.ELIJAY_TECH;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    // I defined email details here to be sent out
    sendSmtpEmail.sender = { name: 'Auth System', email: process.env.EMAIL_USER };
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.textContent = text;

    // Send email
    console.log('Sending transactional email via Brevo API...');
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail); 
    console.log('Email sent successfully:', data.messageId);
    return data;
  } catch (error) {
    console.error('Full error details:', {
      message: error.message,
      status: error.status,
      response: error.response ? error.response.body : 'No response from Brevo API.',
    });
    throw new Error(`Email failed: ${error.message}`);
  }
};

module.exports = sendEmail;


//GMAIL SMTP Configuration for Node.js with Nodemailer
// const nodemailer = require('nodemailer');
// require('dotenv').config();

// const sendEmail = async (to, subject, text) => {
//   try {
//     console.log('Environment variables:', {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS ? '****' : 'undefined',
//     });

// const transporter = nodemailer.createTransport({
//   host: 'smtp.gmail.com',
//   port: 587,
//   secure: false, // REQUIRED for port 587
//   requireTLS: true, // Force TLS
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
//   tls: {
//     ciphers: 'SSLv3', // Bypass TLS compatibility issues
//     rejectUnauthorized: false // Temporary bypass
//   },
//   connectionTimeout: 30000,
//   debug: true // Enable detailed logging
// });

//     console.log('Verifying SMTP transporter...');
//     await transporter.verify();
//     console.log('SMTP transporter verified successfully.');

//     const info = await transporter.sendMail({
//       from: `"Auth System" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       text,
//     });

//     console.log('Email sent successfully:', info.messageId);
//     return info;
//   } catch (error) {
//     console.error('Full error details:', {
//       message: error.message,
//       stack: error.stack,
//       response: error.response || 'No response from SMTP server.',
//     });
//     throw new Error(`Email failed: ${error.message}`);
//   }
// };

// module.exports = sendEmail;