# Event Management System

A professional Node.js and MySQL-based application for managing events, ticket sales, and attendee tracking.

## Features

- **User Management**: Registration, authentication, role-based access control
- **Event Management**: Create, edit, and manage events with detailed information
- **Ticket Management**: Create different ticket types, sales management, and QR code generation
- **Guest Management**: Manage event speakers and special guests
- **Venue Management**: Track and manage event venues
- **Check-in System**: QR code scanning for ticket verification and attendee check-in
- **Payment Processing**: Multiple payment methods support
- **Referral System**: Referral tracking and commission management
- **Reporting**: Event statistics and financial reports

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL, Sequelize ORM
- **Frontend**: EJS templates, Bootstrap 5, JavaScript
- **Authentication**: Passport.js, JWT
- **Email/SMS**: Nodemailer for emails, WhatsApp API integration
- **Security**: bcrypt for password hashing, helmet for HTTP headers

## Installation

### Prerequisites

- Node.js (v14+)
- MySQL (v8+)
- npm or yarn

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/event-management-system.git
   cd event-management-system
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory based on `.env.example`:
   ```
   cp .env.example .env
   ```

4. Edit the `.env` file with your configuration settings.

5. Create a MySQL database:
   ```sql
   CREATE DATABASE event_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

6. Initialize the database:
   ```
   node scripts/init-db.js
   ```

7. Start the server:
   ```
   npm start
   ```

   For development with auto-reload:
   ```
   npm run dev
   ```

8. Access the application at `http://localhost:3000`

## Default Admin User

After database initialization, you can log in with the following credentials:

- **Email**: admin@example.com
- **Password**: admin123

## Project Structure

```
event-management-system/
├── config/               # Configuration files
├── controllers/          # Request handlers
├── middlewares/          # Express middlewares
├── models/               # Sequelize models
├── public/               # Static assets
├── routes/               # Express routes
├── services/             # Business logic
├── utils/                # Utility functions
├── views/                # EJS templates
├── scripts/              # Utility scripts
├── app.js                # Express app setup
├── server.js             # Server entry point
└── README.md             # This file
```

## Key Features Implementation

### QR Code System

The system generates QR codes for tickets that contain encoded ticket information. These can be scanned using the built-in verification page or any QR code scanner.

### OTP Verification

One-time passwords are used for:
- Email verification
- Password reset
- Secure ticket views
- Two-factor authentication (optional)

### WhatsApp Integration

The system is prepared for WhatsApp message sending for:
- Ticket confirmations
- Event reminders
- OTP delivery

### Referral System

Users can generate referral codes to share with others. When a ticket is purchased using a referral code, the referrer earns a commission.

## License

[MIT License](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For support, please open an issue in the GitHub issue tracker or contact admin@yourdomain.com.