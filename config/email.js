const nodemailer = require('nodemailer');

// Mailtrap configuration for development environment
// This will capture all sent emails in a Mailtrap inbox instead of sending them to real recipients
const createMailtrapTransport = () => {
  return nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.MAILTRAP_PORT) || 2525,
    auth: {
      user: process.env.MAILTRAP_USER || 'your_mailtrap_user',
      pass: process.env.MAILTRAP_PASS || 'your_mailtrap_password'
    }
  });
};

// Production email configuration (e.g., SendGrid, AWS SES, etc.)
const createProductionTransport = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Select transport based on environment
const getTransport = () => {
  if (process.env.NODE_ENV === 'production') {
    return createProductionTransport();
  }
  return createMailtrapTransport();
};

// Get email sender address
const getSender = () => {
  return process.env.EMAIL_FROM || 'Event Management <noreply@eventmanagement.com>';
};

// Email templates paths
const templates = {
  welcome: 'welcome',
  ticketConfirmation: 'ticket_confirmation',
  passwordReset: 'password_reset',
  eventReminder: 'event_reminder',
  paymentConfirmation: 'payment_confirmation',
  refundConfirmation: 'refund_confirmation',
  referralInvitation: 'referral_invitation'
};

module.exports = {
  getTransport,
  getSender,
  templates,
  
  // Send an email
  sendEmail: async (to, subject, htmlContent, attachments = []) => {
    try {
      const transport = getTransport();
      const sender = getSender();
      
      const mailOptions = {
        from: sender,
        to: Array.isArray(to) ? to.join(',') : to,
        subject,
        html: htmlContent,
        attachments
      };
      
      const info = await transport.sendMail(mailOptions);
      
      // Log email details in development environment
      if (process.env.NODE_ENV !== 'production') {
        console.log('========== EMAIL SENT ==========');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        console.log('================================');
      }
      
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }
};