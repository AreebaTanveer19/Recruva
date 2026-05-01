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

// Send contact form email
const sendContactEmail = async (name, email, subject, message) => {
  try {
    // Email to Recruva support
    const supportMailOptions = {
      from: `"Recruva Contact Form" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to support email
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1E3A8A; margin: 0; font-size: 28px;">Recruva</h1>
            <div style="width: 60px; height: 3px; background: linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%); margin: 10px auto; border-radius: 2px;"></div>
          </div>
          
          <h2 style="color: #333; margin: 0 0 20px 0; font-size: 20px;">New Contact Form Submission</h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <p style="margin: 0 0 15px 0;"><strong>From:</strong> ${name}</p>
            <p style="margin: 0 0 15px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #1E3A8A;">${email}</a></p>
            <p style="margin: 0 0 15px 0;"><strong>Subject:</strong> ${subject}</p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 15px 0;">
            <p style="margin: 0; white-space: pre-wrap; color: #666;">${message}</p>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 12px;">
            <p style="margin: 0;">© 2024 Recruva. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    // Confirmation email to user
    const userMailOptions = {
      from: `"Recruva" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'We received your message',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1E3A8A; margin: 0; font-size: 28px;">Recruva</h1>
            <div style="width: 60px; height: 3px; background: linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%); margin: 10px auto; border-radius: 2px;"></div>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h2 style="color: #333; margin: 0 0 10px 0; font-size: 20px;">Thank You for Reaching Out</h2>
            <p style="color: #666; margin: 0; font-size: 16px;">We've received your message and will get back to you soon.</p>
          </div>
          
          <div style="background: #f0f4ff; padding: 20px; border-radius: 10px; border-left: 4px solid #1E3A8A; margin-bottom: 20px;">
            <p style="margin: 0 0 10px 0; color: #333;"><strong>Your Message Details:</strong></p>
            <p style="margin: 0; color: #666;">Subject: ${subject}</p>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 14px;">
            <p style="margin: 0 0 10px 0;">We typically respond within 24 hours.</p>
            <p style="margin: 0;">© 2024 Recruva. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    // Send both emails
    const supportResult = await transporter.sendMail(supportMailOptions);
    const userResult = await transporter.sendMail(userMailOptions);

    console.log('Contact email sent successfully');
    return {
      success: true,
      supportMessageId: supportResult.messageId,
      userMessageId: userResult.messageId,
    };
  } catch (error) {
    console.error('Error sending contact email:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset OTP email
const sendPasswordResetOtpEmail = async (email, otp, name) => {
  try {
    const mailOptions = {
      from: `"Recruva" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset OTP - Recruva',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1E3A8A; margin: 0; font-size: 28px;">Recruva</h1>
            <div style="width: 60px; height: 3px; background: linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%); margin: 10px auto; border-radius: 2px;"></div>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h2 style="color: #333; margin: 0 0 10px 0; font-size: 20px;">Reset Your Password</h2>
            <p style="color: #666; margin: 0 0 20px 0; font-size: 16px;">Hi ${name},</p>
            <p style="color: #666; margin: 0 0 20px 0; font-size: 14px;">We received a request to reset your password. Use the OTP below to proceed:</p>
            <div style="background: #fff; padding: 25px; border-radius: 8px; border: 2px dashed #1E3A8A; margin: 25px 0; display: inline-block;">
              <span style="font-size: 36px; font-weight: bold; color: #1E3A8A; letter-spacing: 12px;">${otp}</span>
            </div>
            <p style="color: #999; margin: 0; font-size: 12px;">This OTP will expire in 10 minutes.</p>
            <p style="color: #999; margin: 10px 0 0 0; font-size: 12px;">If you didn't request this, ignore this email.</p>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
            <p style="color: #92400e; margin: 0; font-size: 13px; font-weight: 500;">🔒 Security Tip: Never share your OTP with anyone. Recruva staff will never ask for it.</p>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 12px;">
            <p style="margin: 0;">© 2024 Recruva. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset OTP email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending password reset OTP email:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset confirmation email
const sendPasswordResetConfirmationEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: `"Recruva" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Changed Successfully - Recruva',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1E3A8A; margin: 0; font-size: 28px;">Recruva</h1>
            <div style="width: 60px; height: 3px; background: linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%); margin: 10px auto; border-radius: 2px;"></div>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <div style="margin-bottom: 20px;">
              <span style="font-size: 48px;">✓</span>
            </div>
            <h2 style="color: #333; margin: 0 0 10px 0; font-size: 20px;">Password Changed Successfully</h2>
            <p style="color: #666; margin: 0; font-size: 14px;">Hi ${name},</p>
            <p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">Your password has been reset successfully. You can now log in with your new password.</p>
          </div>
          
          <div style="background: #f0f4ff; padding: 20px; border-radius: 8px; border-left: 4px solid #1E3A8A; margin-bottom: 20px;">
            <p style="color: #1E3A8A; margin: 0; font-size: 13px; font-weight: 500;">💡 What's next?</p>
            <p style="color: #666; margin: 8px 0 0 0; font-size: 13px;">Sign in to your account with your new password to continue exploring opportunities on Recruva.</p>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
            <p style="color: #92400e; margin: 0; font-size: 13px; font-weight: 500;">🔒 Security Note: If you didn't make this change, please contact support immediately.</p>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 12px;">
            <p style="margin: 0;">© 2024 Recruva. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset confirmation email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending password reset confirmation email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  verifyEmailConfig,
  sendOtpEmail,
  sendContactEmail,
  sendPasswordResetOtpEmail,
  sendPasswordResetConfirmationEmail,
};
