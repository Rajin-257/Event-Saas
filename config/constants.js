/**
 * Application constants
 */

module.exports = {
    // Roles
    ROLES: {
      ADMIN: 'admin',
      ORGANIZER: 'organizer',
      USER: 'user',
      GUEST: 'guest'
    },
  
    // Event statuses
    EVENT_STATUS: {
      DRAFT: 'draft',
      PUBLISHED: 'published',
      CANCELLED: 'cancelled',
      COMPLETED: 'completed'
    },
  
    // Ticket statuses
    TICKET_STATUS: {
      PENDING: 'pending',
      CONFIRMED: 'confirmed',
      CANCELLED: 'cancelled',
      USED: 'used'
    },
  
    // Payment statuses
    PAYMENT_STATUS: {
      PENDING: 'pending',
      COMPLETED: 'completed',
      FAILED: 'failed',
      REFUNDED: 'refunded'
    },
  
    // OTP purposes
    OTP_PURPOSE: {
      VERIFICATION: 'verification',
      RESET_PASSWORD: 'reset_password',
      LOGIN: 'login',
      TICKET_VIEW: 'ticket_view'
    },
  
    // User statuses
    USER_STATUS: {
      ACTIVE: 'active',
      INACTIVE: 'inactive',
      SUSPENDED: 'suspended'
    },
  
    // Referral statuses
    REFERRAL_STATUS: {
      ACTIVE: 'active',
      USED: 'used',
      EXPIRED: 'expired'
    },
  
    // Commission statuses
    COMMISSION_STATUS: {
      PENDING: 'pending',
      PAID: 'paid',
      CANCELLED: 'cancelled'
    },
  
    // File upload paths
    UPLOAD_PATHS: {
      PROFILE_IMAGES: 'public/uploads/profiles',
      EVENT_BANNERS: 'public/uploads/events',
      GUEST_PROFILES: 'public/uploads/guests',
      TICKET_PHOTOS: 'public/uploads/tickets'
    },
  
    // Pagination defaults
    PAGINATION: {
      DEFAULT_LIMIT: 10,
      MAX_LIMIT: 100
    }
  };