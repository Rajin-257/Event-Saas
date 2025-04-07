// Authentication configuration

module.exports = {
    // Session configuration
    sessionConfig: {
      secret: process.env.SESSION_SECRET || 'default_session_secret',
      resave: false,
      saveUninitialized: true,
      cookie: { 
        secure: process.env.NODE_ENV === 'production',  // Use secure cookies in production
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      }
    },
  
    // Password requirements
    passwordRequirements: {
      minLength: 6,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false
    },
  
    // User roles and permissions
    roles: {
      SUPER_ADMIN: 'super_admin',
      ORGANIZER: 'organizer',
      ATTENDEE: 'attendee'
    },
  
    // Role-based permissions
    permissions: {
      super_admin: [
        'manage_users',
        'manage_events',
        'manage_tickets',
        'manage_payments',
        'manage_reports',
        'manage_settings',
        'create_events',
        'edit_own_events',
        'manage_own_tickets',
        'view_own_reports',
        'process_check_ins'
      ],
      organizer: [
        'create_events',
        'edit_own_events',
        'manage_own_tickets',
        'view_own_reports',
        'process_check_ins'
      ],
      attendee: [
        'book_tickets',
        'view_own_tickets',
        'manage_profile',
        'create_referrals'
      ]
    }
  };