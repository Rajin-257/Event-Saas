// models/index.js
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}  

// Import models
const User = require('./user')(sequelize);
const Role = require('./role')(sequelize);
const UserRole = require('./userRole')(sequelize);
const Department = require('./department')(sequelize);
const Guest = require('./guest')(sequelize);
const Venue = require('./venue')(sequelize);
const Event = require('./event')(sequelize);
const EventGuest = require('./eventGuest')(sequelize);
const TicketType = require('./ticketType')(sequelize);
const Ticket = require('./ticket')(sequelize);
const OTP = require('./otp')(sequelize);
const PaymentMethod = require('./paymentMethod')(sequelize);
const Payment = require('./payment')(sequelize);
const Referral = require('./referral')(sequelize);
const Commission = require('./commission')(sequelize);
const Transaction = require('./transaction')(sequelize);
const Session = require('./session')(sequelize);

// Define associations
// User associations
User.hasMany(Department, { foreignKey: 'created_by' });
User.hasMany(Guest, { foreignKey: 'created_by' });
User.hasMany(Venue, { foreignKey: 'created_by' });
User.hasMany(Event, { foreignKey: 'created_by' });
User.hasMany(Ticket, { foreignKey: 'user_id' });
User.hasMany(OTP, { foreignKey: 'user_id' });
User.hasMany(Payment, { foreignKey: 'user_id' });
User.hasMany(Referral, { 
  foreignKey: 'referrer_id', 
  as: 'ReferralsGiven' 
});
User.hasMany(Referral, { 
  foreignKey: 'referred_id', 
  as: 'ReferralsReceived' 
});
User.hasMany(Transaction, { foreignKey: 'user_id' });
User.hasMany(Session, { foreignKey: 'user_id' });

// Many-to-many User <-> Role relationship
User.belongsToMany(Role, { through: UserRole, foreignKey: 'user_id' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'role_id' });

// Department associations
Department.belongsTo(User, { foreignKey: 'created_by', as: 'Creator' });
Department.hasMany(Guest, { foreignKey: 'department_id' });

// Guest associations
Guest.belongsTo(User, { foreignKey: 'created_by', as: 'Creator' });
Guest.belongsTo(Department, { foreignKey: 'department_id' });
Guest.belongsToMany(Event, { through: EventGuest, foreignKey: 'guest_id' });

// Venue associations
Venue.belongsTo(User, { foreignKey: 'created_by', as: 'Creator' });
Venue.hasMany(Event, { foreignKey: 'venue_id' });

// Event associations
Event.belongsTo(User, { foreignKey: 'created_by', as: 'Creator' });
Event.belongsTo(Venue, { foreignKey: 'venue_id' });
Event.belongsToMany(Guest, { through: EventGuest, foreignKey: 'event_id' });
Event.hasMany(TicketType, { foreignKey: 'event_id' });
Event.hasMany(Ticket, { foreignKey: 'event_id' });
Event.hasMany(Referral, { foreignKey: 'event_id' });

// Ticket Type associations
TicketType.belongsTo(Event, { foreignKey: 'event_id' });
TicketType.hasMany(Ticket, { foreignKey: 'ticket_type_id' });

// Ticket associations
Ticket.belongsTo(Event, { foreignKey: 'event_id' });
Ticket.belongsTo(TicketType, { foreignKey: 'ticket_type_id' });
Ticket.belongsTo(User, { foreignKey: 'user_id' });
Ticket.hasMany(Payment, { foreignKey: 'ticket_id' });
Ticket.hasMany(OTP, { foreignKey: 'ticket_id' });
Ticket.hasMany(Commission, { foreignKey: 'ticket_id' });

// OTP associations
OTP.belongsTo(User, { foreignKey: 'user_id' });
OTP.belongsTo(Ticket, { foreignKey: 'ticket_id' });

// Payment Method associations
PaymentMethod.hasMany(Payment, { foreignKey: 'payment_method_id' });

// Payment associations
Payment.belongsTo(Ticket, { foreignKey: 'ticket_id' });
Payment.belongsTo(User, { foreignKey: 'user_id' });
Payment.belongsTo(PaymentMethod, { foreignKey: 'payment_method_id' });

// Referral associations
Referral.belongsTo(User, { 
  foreignKey: 'referrer_id', 
  as: 'Referrer' 
});
Referral.belongsTo(User, { 
  foreignKey: 'referred_id', 
  as: 'Referred' 
});
Referral.belongsTo(Event, { foreignKey: 'event_id' });
Referral.hasMany(Commission, { foreignKey: 'referral_id' });

// Commission associations
Commission.belongsTo(Referral, { foreignKey: 'referral_id' });
Commission.belongsTo(Ticket, { foreignKey: 'ticket_id' });

// Transaction associations
Transaction.belongsTo(User, { foreignKey: 'user_id' });

// Session associations
Session.belongsTo(User, { foreignKey: 'user_id' });

// Add models to db object
db.User = User;
db.Role = Role;
db.UserRole = UserRole;
db.Department = Department;
db.Guest = Guest;
db.Venue = Venue;
db.Event = Event;
db.EventGuest = EventGuest;
db.TicketType = TicketType;
db.Ticket = Ticket;
db.OTP = OTP;
db.PaymentMethod = PaymentMethod;
db.Payment = Payment;
db.Referral = Referral;
db.Commission = Commission;
db.Transaction = Transaction;
db.Session = Session;

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;