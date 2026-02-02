const nodemailer = require('nodemailer');

// Email configuration using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_PASSWORD,
  },
});

// Function to send OTP email
const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.GMAIL_EMAIL,
      to: email,
      subject: 'Email Verification - OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">LMS Verification</h1>
          </div>
          <div style="background: #f5f5f5; padding: 40px; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Hello,</p>
            <p style="font-size: 14px; color: #666; margin-bottom: 30px;">
              You requested to register an account. Please use the OTP below to verify your email address.
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
              <p style="margin: 0; font-size: 12px; color: #999; margin-bottom: 10px;">Your OTP Code:</p>
              <p style="margin: 0; font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 5px;">
                ${otp}
              </p>
            </div>
            <p style="font-size: 12px; color: #999; margin: 20px 0;">
              This OTP is valid for 5 minutes. Do not share this code with anyone.
            </p>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              If you didn't request this, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="font-size: 12px; color: #999; margin: 0;">
              © 2024 LMS Platform. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully:', result.response);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

module.exports = { sendOTPEmail };