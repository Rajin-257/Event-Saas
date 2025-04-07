// WhatsApp Business API configuration
// This uses the WhatsApp Business API through a third-party provider

const axios = require('axios');

// WhatsApp message templates
const templates = {
  ticketConfirmation: 'ticket_confirmation',
  eventReminder: 'event_reminder',
  otpVerification: 'otp_verification',
  paymentConfirmation: 'payment_confirmation',
  checkInConfirmation: 'check_in_confirmation'
};

// WhatsApp API configurations
const apiConfig = {
  baseUrl: process.env.WHATSAPP_API_URL || 'https://api.whatsappapi.provider.com/v1',
  apiKey: process.env.WHATSAPP_API_KEY || 'your_whatsapp_api_key',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || 'your_phone_number_id',
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || 'your_business_account_id'
};

// Send WhatsApp message using template
const sendTemplateMessage = async (to, templateName, parameters) => {
  try {
    // Make sure phone number has the correct format
    const formattedPhone = formatPhoneNumber(to);
    
    // In development, log the message instead of sending
    if (process.env.NODE_ENV !== 'production') {
      console.log('========== WHATSAPP MESSAGE ==========');
      console.log(`To: ${formattedPhone}`);
      console.log(`Template: ${templateName}`);
      console.log('Parameters:', parameters);
      console.log('======================================');
      return { success: true, message: 'WhatsApp message logged (development mode)' };
    }
    
    // In production, send the actual message
    const response = await axios.post(
      `${apiConfig.baseUrl}/messages`,
      {
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: 'en_US'
          },
          components: parameters
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiConfig.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return {
      success: true,
      whatsappMessageId: response.data.messages[0].id,
      message: 'WhatsApp message sent successfully'
    };
  } catch (error) {
    console.error('WhatsApp message sending failed:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

// Send a custom text message (not using a template)
const sendTextMessage = async (to, text) => {
  try {
    const formattedPhone = formatPhoneNumber(to);
    
    // In development, log the message instead of sending
    if (process.env.NODE_ENV !== 'production') {
      console.log('========== WHATSAPP TEXT MESSAGE ==========');
      console.log(`To: ${formattedPhone}`);
      console.log(`Message: ${text}`);
      console.log('==========================================');
      return { success: true, message: 'WhatsApp text message logged (development mode)' };
    }
    
    // In production, send the actual message
    const response = await axios.post(
      `${apiConfig.baseUrl}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedPhone,
        type: 'text',
        text: {
          body: text
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiConfig.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return {
      success: true,
      whatsappMessageId: response.data.messages[0].id,
      message: 'WhatsApp text message sent successfully'
    };
  } catch (error) {
    console.error('WhatsApp text message sending failed:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

// Format phone number to WhatsApp format (e.g., +1XXXXXXXXXX)
const formatPhoneNumber = (phone) => {
  // Remove any non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Make sure it has the plus sign prefix
  return digits.startsWith('1') ? `+${digits}` : `+1${digits}`;
};

// Send OTP verification code
const sendOTP = async (phone, otp) => {
  const parameters = [
    {
      type: 'body',
      parameters: [
        {
          type: 'text',
          text: otp
        },
        {
          type: 'text',
          text: '10' // expiration time in minutes
        }
      ]
    }
  ];
  
  return await sendTemplateMessage(phone, templates.otpVerification, parameters);
};

// Send ticket confirmation
const sendTicketConfirmation = async (phone, name, eventTitle, ticketNumber, eventDate, eventTime, venue) => {
  const parameters = [
    {
      type: 'body',
      parameters: [
        {
          type: 'text',
          text: name
        },
        {
          type: 'text',
          text: eventTitle
        },
        {
          type: 'text',
          text: ticketNumber
        },
        {
          type: 'text',
          text: eventDate
        },
        {
          type: 'text',
          text: eventTime
        },
        {
          type: 'text',
          text: venue
        }
      ]
    }
  ];
  
  return await sendTemplateMessage(phone, templates.ticketConfirmation, parameters);
};

// Send event reminder
const sendEventReminder = async (phone, name, eventTitle, eventDate, eventTime, venue) => {
  const parameters = [
    {
      type: 'body',
      parameters: [
        {
          type: 'text',
          text: name
        },
        {
          type: 'text',
          text: eventTitle
        },
        {
          type: 'text',
          text: eventDate
        },
        {
          type: 'text',
          text: eventTime
        },
        {
          type: 'text',
          text: venue
        }
      ]
    }
  ];
  
  return await sendTemplateMessage(phone, templates.eventReminder, parameters);
};

module.exports = {
  templates,
  sendTemplateMessage,
  sendTextMessage,
  sendOTP,
  sendTicketConfirmation,
  sendEventReminder
};