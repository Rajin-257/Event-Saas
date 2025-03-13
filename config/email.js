/**
 * Email configuration
 */

module.exports = {
    // SMTP settings
    smtp: {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    },
    
    // Default sender
    from: process.env.EMAIL_FROM || '"Event Management System" <noreply@yourdomain.com>',
    
    // Email templates
    templates: {
      // OTP templates
      verification_otp: {
        subject: 'Verify Your Email Address',
        text: 'Your verification code is: {{code}}. It will expire in 5 minutes.',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Email Verification</h2>
            <p>Please use the following code to verify your email address:</p>
            <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
              {{code}}
            </div>
            <a href="{{verificationUrl}}" 
               style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; 
                      font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 8px; 
                      text-align: center; margin: 20px auto; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
                      transition: background-color 0.3s, transform 0.2s;">
                      Verify Email
            </a>
            <p>This code will expire in 5 minutes.</p>
            <p>If you didn't request this verification, please ignore this email.</p>
          </div>
        `
      },
      
      reset_password_otp: {
        subject: 'Reset Your Password',
        text: 'Your password reset code is: {{code}}. It will expire in 5 minutes.',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Password Reset</h2>
            <p>Please use the following code to reset your password:</p>
            <a href="{{verificationUrl}}" 
               style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; 
                      font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 8px; 
                      text-align: center; margin: 20px auto; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
                      transition: background-color 0.3s, transform 0.2s;">
                      Verify Email
            </a>

            <p>This code will expire in 5 minutes.</p>
            <p>If you didn't request a password reset, please contact our support team immediately.</p>
          </div>
        `
      },
      
      login_otp: {
        subject: 'Login Verification Code',
        text: 'Your login verification code is: {{code}}. It will expire in 5 minutes.',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Login Verification</h2>
            <p>Please use the following code to complete your login:</p>
            <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
              {{code}}
            </div>
            <p>This code will expire in 5 minutes.</p>
            <p>If you didn't attempt to log in, please change your password immediately.</p>
          </div>
        `
      },
      
      ticket_otp: {
        subject: 'Ticket Verification Code',
        text: 'Your ticket verification code is: {{code}}. It will expire in 5 minutes.',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Ticket Verification</h2>
            <p>Please use the following code to access your ticket:</p>
            <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
              {{code}}
            </div>
            <p>This code will expire in 5 minutes.</p>
          </div>
        `
      },
      
      // Ticket templates
      ticket_confirmation: {
        subject: 'Your Ticket Confirmation',
        text: 'Your ticket has been confirmed. Ticket Code: {{ticketCode}}',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Ticket Confirmation</h2>
            <p>Dear {{name}},</p>
            <p>Your ticket for <strong>{{eventTitle}}</strong> has been confirmed.</p>
            <p><strong>Ticket Details:</strong></p>
            <ul>
              <li>Ticket Code: {{ticketCode}}</li>
              <li>Event: {{eventTitle}}</li>
              <li>Date: {{eventDate}}</li>
              <li>Time: {{eventTime}}</li>
              <li>Venue: {{venueName}}</li>
              <li>Ticket Type: {{ticketType}}</li>
            </ul>
            <p>You can view your ticket by clicking the button below or using the QR code attached.</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="{{ticketUrl}}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Ticket</a>
            </div>
            <p>We look forward to seeing you at the event!</p>
          </div>
        `
      },
      
      // Welcome email
      welcome: {
        subject: 'Welcome to Event Management System',
        text: 'Welcome to Event Management System. Please verify your email to get started.',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Welcome to Event Management System!</h2>
            <p>Dear {{name}},</p>
            <p>Thank you for registering with us. We're excited to have you on board!</p>
            <p>Please verify your email address to get started:</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="{{verificationUrl}}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
            </div>
            <p>If the button doesn't work, you can also use the verification code:</p>
            <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 18px; letter-spacing: 5px; font-weight: bold;">
              {{verificationCode}}
            </div>
            <p>Thank you!</p>
          </div>
        `
      }
    }
  };