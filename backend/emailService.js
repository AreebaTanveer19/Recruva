const nodemailer = require('nodemailer');
require('dotenv').config();

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify email configuration
const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};

// Send OTP email
const sendOtpEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"Recruva" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP for Recruva Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1E3A8A; margin: 0; font-size: 28px;">Recruva</h1>
            <div style="width: 60px; height: 3px; background: linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%); margin: 10px auto; border-radius: 2px;"></div>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h2 style="color: #333; margin: 0 0 10px 0; font-size: 20px;">Email Verification</h2>
            <p style="color: #666; margin: 0 0 20px 0; font-size: 16px;">Your One-Time Password (OTP) is:</p>
            <div style="background: #fff; padding: 20px; border-radius: 8px; border: 2px dashed #1E3A8A; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #1E3A8A; letter-spacing: 8px;">${otp}</span>
            </div>
            <p style="color: #666; margin: 0; font-size: 14px;">This OTP will expire in 10 minutes.</p>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 14px;">
            <p style="margin: 0 0 10px 0;">If you didn't request this OTP, please ignore this email.</p>
            <p style="margin: 0;">© 2024 Recruva. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  verifyEmailConfig,
  sendOtpEmail,
};
