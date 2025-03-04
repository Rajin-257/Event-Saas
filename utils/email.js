const nodemailer = require('nodemailer');
const config = require('../config/config');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: process.env.EMAIL_PORT || 2525,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send verification email
exports.sendVerificationEmail = async (options) => {
  // HTML template for verification email
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #333; text-align: center;">Welcome to ${config.app.name}!</h2>
      <p style="color: #555;">Hello ${options.name},</p>
      <p style="color: #555;">Thank you for registering with us. Please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 25px 0;">
        <a href="${options.verificationURL}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
      </div>
      <p style="color: #555;">If you didn't create an account, you can safely ignore this email.</p>
      <p style="color: #555;">Thank you,<br>The ${config.app.name} Team</p>
    </div>
  `;

  // Email options
  const mailOptions = {
    from: `${config.email.from.name} <${config.email.from.address}>`,
    to: options.email,
    subject: `Verify your email for ${config.app.name}`,
    html
  };

  // Send email
  await transporter.sendMail(mailOptions);
};

// Send password reset email
exports.sendPasswordResetEmail = async (options) => {
  // HTML template for password reset email
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
      <p style="color: #555;">Hello ${options.name},</p>
      <p style="color: #555;">You requested a password reset. Use the OTP below to reset your password:</p>
      <div style="text-align: center; margin: 25px 0;">
        <div style="font-size: 24px; letter-spacing: 5px; background-color: #f5f5f5; padding: 15px; border-radius: 5px; display: inline-block; font-weight: bold;">${options.otp}</div>
      </div>
      <p style="color: #555;">This OTP is valid for 30 minutes. If you didn't request a password reset, you can safely ignore this email.</p>
      <p style="color: #555;">Thank you,<br>The ${config.app.name} Team</p>
    </div>
  `;

  // Email options
  const mailOptions = {
    from: `${config.email.from.name} <${config.email.from.address}>`,
    to: options.email,
    subject: `Password Reset OTP for ${config.app.name}`,
    html
  };

  // Send email
  await transporter.sendMail(mailOptions);
};