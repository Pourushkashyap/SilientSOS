const nodemailer = require('nodemailer');
const fs = require('fs');

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

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log("✅ Gmail connection verified");
      return true;
    } catch (err) {
      console.log("❌ Gmail connection FAILED:", err.message);
      console.log("👉 Check EMAIL_USER and EMAIL_PASS in .env");
      return false;
    }
  }

  async sendEmail(to, subject, message, audioPath = null) {
    console.log(`📧 Attempting email to: ${to}`);
    console.log(`📧 From: ${process.env.EMAIL_USER}`);
    console.log(`📎 Audio path: ${audioPath}`);

    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text: message,
        attachments: []
      };

      if (audioPath && fs.existsSync(audioPath)) {
        mailOptions.attachments.push({
          filename: 'emergency_audio.wav',
          path: audioPath,
          contentType: 'audio/wav'
        });
        console.log("📎 Audio file attached successfully");
      } else {
        console.log("⚠️ No audio file to attach (path missing or file not found)");
      }

      const info = await this.transporter.sendMail(mailOptions);
      console.log("✅ Email SENT successfully to:", to);
      console.log("📨 Message ID:", info.messageId);
      return true;

    } catch (err) {
      console.log("❌ Email FAILED to:", to);
      console.log("❌ Error:", err.message);
      throw err;
    }
  }
}

module.exports = new EmailService();