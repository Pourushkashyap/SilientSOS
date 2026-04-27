const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendEmail(to, subject, message) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text: message
      });

      console.log("📧 Email sent to:", to);
    } catch (err) {
      console.log("❌ Email failed:", err.message);
    }
  }
}

module.exports = new EmailService();