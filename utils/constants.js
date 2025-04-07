/**
 * Application constants for maintaining consistency
 */
module.exports = {
    // User related constants
    USER: {
      ROLES: {
        SUPER_ADMIN: 'super_admin',
        ORGANIZER: 'organizer',
        ATTENDEE: 'attendee'
      },
      STATUS: {
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        BLOCKED: 'blocked'
      }
    },
  
    // Event related constants
    EVENT: {
      CATEGORIES: {
        CONCERT: 'concert',
        SEMINAR: 'seminar',
        WORKSHOP: 'workshop',
        CONFERENCE: 'conference',
        EXHIBITION: 'exhibition',
        OTHER: 'other'
      },
      STATUS: {
        DRAFT: 'draft',
        UPCOMING: 'upcoming',
        ONGOING: 'ongoing',
        COMPLETED: 'completed',
        CANCELLED: 'cancelled'
      }
    },
  
    // Ticket related constants
    TICKET: {
      TYPES: {
        VIP: 'vip',
        GENERAL: 'general',
        PREMIUM: 'premium',
        EARLY_BIRD: 'early_bird',
        OTHER: 'other'
      },
      STATUS: {
        BOOKED: 'booked',
        CONFIRMED: 'confirmed',
        CANCELLED: 'cancelled',
        REFUNDED: 'refunded',
        USED: 'used'
      }
    },
  
    // Payment related constants
    PAYMENT: {
      METHODS: {
        BKASH: 'bkash',
        NAGAD: 'nagad',
        ROCKET: 'rocket',
        CARD: 'card',
        MANUAL: 'manual'
      },
      STATUS: {
        PENDING: 'pending',
        COMPLETED: 'completed',
        FAILED: 'failed',
        REFUNDED: 'refunded'
      }
    },
  
    // Speaker related constants
    SPEAKER: {
      TYPES: {
        KEYNOTE: 'keynote',
        GUEST: 'guest',
        REGULAR: 'regular',
        PANEL: 'panel'
      }
    },
  
    // Coupon related constants
    COUPON: {
      TYPES: {
        PERCENTAGE: 'percentage',
        FIXED: 'fixed'
      }
    },
  
    // Referral related constants
    REFERRAL: {
      STATUS: {
        PENDING: 'pending',
        COMPLETED: 'completed',
        CANCELLED: 'cancelled'
      },
      DEFAULT_COMMISSION_RATE: 5.00 // Default 5% commission
    },
  
    // Payout related constants
    PAYOUT: {
      STATUS: {
        PENDING: 'pending',
        PROCESSED: 'processed',
        FAILED: 'failed'
      },
      MINIMUM_AMOUNT: 10.00 // Minimum payout amount
    },
  
    // Time related constants
    TIME: {
      OTP_EXPIRY_MINUTES: 10,
      SESSION_EXPIRY_HOURS: 24,
      DEFAULT_TIMEZONE: 'UTC'
    },
  
    // File upload related constants
    UPLOADS: {
      MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
      ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
      PROFILE_PATH: 'uploads/profiles/',
      EVENT_PATH: 'uploads/events/',
      SPEAKER_PATH: 'uploads/speakers/',
      ATTENDEE_PATH: 'uploads/attendees/'
    },
  
    // Pagination related constants
    PAGINATION: {
      DEFAULT_PAGE_SIZE: 10,
      MAX_PAGE_SIZE: 100
    },
  
    // Email related constants
    EMAIL: {
      TEMPLATES: {
        WELCOME: 'welcome',
        TICKET_CONFIRMATION: 'ticket_confirmation',
        PASSWORD_RESET: 'password_reset',
        EVENT_REMINDER: 'event_reminder'
      }
    },
  
    // SMS related constants
    SMS: {
      TEMPLATES: {
        OTP: 'otp',
        TICKET_CONFIRMATION: 'ticket_confirmation',
        EVENT_REMINDER: 'event_reminder'
      }
    },
  
    // Error codes
    ERROR_CODES: {
      AUTHENTICATION_FAILED: 'AUTH_001',
      AUTHORIZATION_FAILED: 'AUTH_002',
      VALIDATION_FAILED: 'VAL_001',
      RESOURCE_NOT_FOUND: 'RES_001',
      DUPLICATE_ENTRY: 'DB_001',
      PAYMENT_FAILED: 'PAY_001',
      SERVER_ERROR: 'SRV_001'
    }
  };