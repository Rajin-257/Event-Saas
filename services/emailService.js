const emailConfig = require('../config/email');
const moment = require('moment');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');

// Templates directory
const templatesDir = path.join(__dirname, '../views/emails');

// Load email template and compile with EJS
const renderTemplate = async (templateName, data) => {
  try {
    const templatePath = path.join(templatesDir, `${templateName}.ejs`);
    const template = fs.readFileSync(templatePath, 'utf-8');
    return ejs.render(template, { ...data, moment });
  } catch (error) {
    console.error(`Error rendering email template ${templateName}:`, error);
    return null;
  }
};

const emailService = {
  // Send email with template
  sendEmailWithTemplate: async (to, subject, templateName, data, attachments = []) => {
    try {
      const html = await renderTemplate(templateName, data);
      
      if (!html) {
        throw new Error(`Failed to render template: ${templateName}`);
      }
      
      return await emailConfig.sendEmail(to, subject, html, attachments);
    } catch (error) {
      console.error('Error sending email with template:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Send welcome email
  sendWelcomeEmail: async (user) => {
    const subject = 'Welcome to Event Management System';
    return await emailService.sendEmailWithTemplate(
      user.email,
      subject,
      emailConfig.templates.welcome,
      { user }
    );
  },
  
  // Send ticket confirmation
  sendTicketConfirmation: async (user, ticket, event, ticketType) => {
    const subject = `Ticket Confirmation - ${event.title}`;
    
    // Prepare QR code attachment if available
    const attachments = [];
    if (ticket.qrCode) {
      attachments.push({
        filename: `ticket-${ticket.ticketNumber}.png`,
        content: ticket.qrCode.split('base64,')[1],
        encoding: 'base64',
        contentType: 'image/png',
        cid: 'qr-code' // This ID can be referenced in the email template
      });
    }
    
    return await emailService.sendEmailWithTemplate(
      user.email,
      subject,
      emailConfig.templates.ticketConfirmation,
      { user, ticket, event, ticketType },
      attachments
    );
  },
  
  // Send payment confirmation
  sendPaymentConfirmation: async (user, payment, ticket, event) => {
    const subject = `Payment Confirmation - ${event.title}`;
    
    return await emailService.sendEmailWithTemplate(
      user.email,
      subject,
      emailConfig.templates.paymentConfirmation,
      { user, payment, ticket, event }
    );
  },
  
  // Send password reset email
  sendPasswordResetEmail: async (user, resetToken, resetUrl) => {
    const subject = 'Reset Your Password';
    
    return await emailService.sendEmailWithTemplate(
      user.email,
      subject,
      emailConfig.templates.passwordReset,
      { user, resetToken, resetUrl }
    );
  },
  
  // Send event reminder
  sendEventReminder: async (user, event, ticket) => {
    const subject = `Reminder: ${event.title} is Tomorrow!`;
    
    return await emailService.sendEmailWithTemplate(
      user.email,
      subject,
      emailConfig.templates.eventReminder,
      { user, event, ticket }
    );
  },
  
  // Send refund confirmation
  sendRefundConfirmation: async (user, payment, ticket, event) => {
    const subject = `Refund Confirmation - ${event.title}`;
    
    return await emailService.sendEmailWithTemplate(
      user.email,
      subject,
      emailConfig.templates.refundConfirmation,
      { user, payment, ticket, event }
    );
  },
  
  // Send referral invitation
  sendReferralInvitation: async (user, recipientEmail, referralCode, referralUrl) => {
    const subject = `${user.name} invites you to join Event Management System`;
    
    return await emailService.sendEmailWithTemplate(
      recipientEmail,
      subject,
      emailConfig.templates.referralInvitation,
      { user, referralCode, referralUrl }
    );
  }
};

module.exports = emailService;