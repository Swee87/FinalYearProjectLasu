const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (to, subject, text) => {
        try {
                // Debug output
                console.log('Using email:', process.env.EMAIL_USER);

                // Create a transporter
                const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        host: 'smtp.gmail.com',
                        port: 587,
                        secure: false, // Use `true` for port 465, `false` for port 587
                        auth: {
                                user: process.env.EMAIL_USER,
                                pass: process.env.EMAIL_PASS,
                        },
                });

                // Verify the transporter connection
                await transporter.verify();
                console.log('SMTP transporter verified successfully.');

                // Send the email
                const info = await transporter.sendMail({
                        from: `"Auth System" <${process.env.EMAIL_USER}>`, // Sender address with a friendly name
                        to,
                        subject,
                        text,
                });

                console.log('Email sent successfully:', info.messageId);
                return info;
        } catch (error) {
                console.error('Full error details:', {
                        message: error.message,
                        stack: error.stack,
                        response: error.response || 'No response from SMTP server.',
                });
                throw new Error(`Email failed: ${error.message}`);
        }
};

module.exports = sendEmail;













// const nodemailer = require('nodemailer');
// require('dotenv').config();

// // Create a transporter
// const transporter = nodemailer.createTransport({
//         service: 'gmail', // Use 'gmail' for Gmail
//         auth: {
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASS,
//         },
// });

// // Function to send email
// const sendEmail = async (to, subject, text) => {
//         const mailOptions = {
//                 from: process.env.EMAIL_USER,
//                 to,
//                 subject,
//                 text,
//         };

//         try {
//                 await transporter.sendMail(mailOptions);
//                 console.log(`Email sent to ${to}`);
//         } catch (error) {
//                 console.error('Error sending email:', error); // Log the full error
//                 throw error; // Re-throw the error for the calling function
//         }
// };

// module.exports = sendEmail;




// const nodemailer = require('nodemailer');
// require('dotenv').config();

// const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASS,
//         },
// });

// const sendEmail = async (to, subject, text) => {
//         const mailOptions = { from: process.env.EMAIL_USER, to, subject, text };
//         try {
//                 await transporter.sendMail(mailOptions);
//         } catch (error) {
//                 console.error('Error sending email:', error);
//                 throw error;
//         }
// };

// module.exports = sendEmail;