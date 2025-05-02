const postmark = require("postmark");
require("dotenv").config();

const sendEmail = async (to, subject, text, html = null) => {
        const client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN);

        try {
                const response = await client.sendEmail({
                        From: process.env.POSTMARK_FROM_EMAIL,
                        To: to,
                        Subject: subject,
                        TextBody: text,
                        HtmlBody: html || `<p>${text}</p>`,  // Fallback to text if no HTML
                        MessageStream: "outbound",  // Required for transactional emails
                });

                console.log("Postmark email sent:", response.MessageID);
                return response;
        } catch (error) {
                console.error("Postmark error:", error);
                throw new Error(`Email failed: ${error.message}`);
        }
};

module.exports = sendEmail;