const whatsappConfig = require('../config/whatsapp');
const moment = require('moment');

const smsService = {
  // Send OTP verification code
  sendOTP: async (phone, otp) => {
    try {
      if (!phone) {
        return { success: false, message: 'Phone number is required' };
      }
      
      return await whatsappConfig.sendOTP(phone, otp);
    } catch (error) {
      console.error('Error sending OTP:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Send ticket confirmation
  sendTicketConfirmationSMS: async (user, ticket, event) => {
    try {
      if (!user.phone) {
        return { success: false, message: 'User has no phone number' };
      }
      
      const name = user.name;
      const eventTitle = event.title;
      const ticketNumber = ticket.ticketNumber;
      const eventDate = moment(event.startDate).format('MMMM D, YYYY');
      const eventTime = moment(event.startDate).format('h:mm A');
      const venue = event.venue;
      
      return await whatsappConfig.sendTicketConfirmation(
        user.phone,
        name,
        eventTitle,
        ticketNumber,
        eventDate,
        eventTime,
        venue
      );
    } catch (error) {
      console.error('Error sending ticket confirmation:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Send event reminder
  sendEventReminderSMS: async (user, event) => {
    try {
      if (!user.phone) {
        return { success: false, message: 'User has no phone number' };
      }
      
      const name = user.name;
      const eventTitle = event.title;
      const eventDate = moment(event.startDate).format('MMMM D, YYYY');
      const eventTime = moment(event.startDate).format('h:mm A');
      const venue = event.venue;
      
      return await whatsappConfig.sendEventReminder(
        user.phone,
        name,
        eventTitle,
        eventDate,
        eventTime,
        venue
      );
    } catch (error) {
      console.error('Error sending event reminder:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Send payment confirmation
  sendPaymentConfirmationSMS: async (user, payment, ticket, event) => {
    try {
      if (!user.phone) {
        return { success: false, message: 'User has no phone number' };
      }
      
      // For simplicity, we'll use a text message for this one instead of a template
      const message = `Your payment of $${payment.amount} for ${event.title} has been confirmed. Ticket #: ${ticket.ticketNumber}. Thank you!`;
      
      return await whatsappConfig.sendTextMessage(user.phone, message);
    } catch (error) {
      console.error('Error sending payment confirmation:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Send check-in confirmation
  sendCheckInConfirmationSMS: async (user, event) => {
    try {
      if (!user.phone) {
        return { success: false, message: 'User has no phone number' };
      }
      
      // For simplicity, we'll use a text message for this one instead of a template
      const message = `You have successfully checked in to ${event.title}. Enjoy the event!`;
      
      return await whatsappConfig.sendTextMessage(user.phone, message);
    } catch (error) {
      console.error('Error sending check-in confirmation:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Generic method to send a simple text message
  sendTextMessage: async (phone, message) => {
    try {
      if (!phone) {
        return { success: false, message: 'Phone number is required' };
      }
      
      return await whatsappConfig.sendTextMessage(phone, message);
    } catch (error) {
      console.error('Error sending text message:', error);
      return { success: false, error: error.message };
    }
  }
};

module.exports = smsService;