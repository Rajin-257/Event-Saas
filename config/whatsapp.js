/**
 * WhatsApp configuration
 */

module.exports = {
    // API credentials
    apiKey: process.env.WHATSAPP_API_KEY,
    phoneNumber: process.env.WHATSAPP_PHONE_NUMBER,
    
    // Message templates
    templates: {
      // OTP templates
      verification_otp: 'Your verification code is: {{code}}. It will expire in 5 minutes.',
      reset_password_otp: 'Your password reset code is: {{code}}. It will expire in 5 minutes.',
      login_otp: 'Your login verification code is: {{code}}. It will expire in 5 minutes.',
      ticket_otp: 'Your ticket verification code is: {{code}}. It will expire in 5 minutes.',
      
      // Ticket templates
      ticket_confirmation: 'Your ticket for {{eventTitle}} has been confirmed. Ticket Code: {{ticketCode}}. Date: {{eventDate}}, Time: {{eventTime}}, Venue: {{venueName}}. You can view your ticket at {{ticketUrl}}',
      
      // Welcome message
      welcome: 'Welcome to Event Management System, {{name}}! Thank you for registering with us.'
    }
  };