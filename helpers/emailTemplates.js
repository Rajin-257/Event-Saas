const getEmailTemplate = (type, data) => {
    switch (type) {
      case 'booking_confirmation':
        return {
          subject: `Booking Confirmation - ${data.eventTitle}`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h2>Booking Confirmation</h2>
              </div>
              <div>
                <p>Dear ${data.userName},</p>
                <p>Thank you for your booking! Your tickets for <strong>${data.eventTitle}</strong> have been confirmed.</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
                  <h3 style="margin-top: 0;">Booking Details</h3>
                  <p><strong>Booking ID:</strong> ${data.bookingId}</p>
                  <p><strong>Event:</strong> ${data.eventTitle}</p>
                  <p><strong>Date:</strong> ${data.eventDate}</p>
                  <p><strong>Venue:</strong> ${data.venue}</p>
                  <p><strong>Ticket Type:</strong> ${data.ticketType}</p>
                  <p><strong>Quantity:</strong> ${data.quantity}</p>
                  <p><strong>Total Amount:</strong> ${data.currency} ${data.totalAmount}</p>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                  <img src="${data.qrCodeUrl}" alt="QR Code" style="max-width: 200px;">
                  <p style="margin-top: 10px;">Scan this QR code for entry</p>
                </div>
                <p>For any questions or assistance, please contact our support team.</p>
                <p>Best regards,<br>The Event Management Team</p>
              </div>
            </div>
          `
        };
      
      case 'otp_verification':
        return {
          subject: 'OTP Verification',
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h2>OTP Verification</h2>
              </div>
              <div>
                <p>Dear User,</p>
                <p>Your OTP for verification is:</p>
                <div style="text-align: center; margin: 20px 0;">
                  <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
                    ${data.otp}
                  </div>
                </div>
                <p>This code will expire in 10 minutes.</p>
                <p>If you did not request this code, please ignore this email.</p>
                <p>Best regards,<br>The Event Management Team</p>
              </div>
            </div>
          `
        };
        
      // Add more email templates as needed
      
      default:
        return {
          subject: 'Notification',
          html: `<p>${data.message || 'No message provided'}</p>`
        };
    }
  };
  
  module.exports = { getEmailTemplate };