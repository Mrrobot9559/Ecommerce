const transporter = require("../config/mail.config");

const sendMail = async ({ to, subject, html }) => {
    try {
        const info = await transporter.sendMail({
            from: `"My Store" <${process.env.MAIL_USER}>`,
            to,
            subject,
            html,
        });

        return info;
    } catch (error) {
        console.error("Email sending failed:", error.message);
        throw error;
    }
};

module.exports = sendMail;