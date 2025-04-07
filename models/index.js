// models/index.js
const User = require('./User');
const Event = require('./Event');
const { Ticket, TicketType } = require('./Ticket');
const CheckIn = require('./CheckIn');
const { Coupon, CouponUsage } = require('./Coupon');
const Payment = require('./Payment');
const { Referral, CommissionPayout } = require('./referral');
const Speaker = require('./Speaker');

// ...association code...
// CheckIn Association
CheckIn.belongsTo(Ticket, { foreignKey: 'ticketId' });
Ticket.hasOne(CheckIn, { foreignKey: 'ticketId' });

CheckIn.belongsTo(Event, { foreignKey: 'eventId' });
Event.hasMany(CheckIn, { foreignKey: 'eventId' });

CheckIn.belongsTo(User, { as: 'attendee', foreignKey: 'attendeeId' });
CheckIn.belongsTo(User, { as: 'staff', foreignKey: 'checkedInBy' });

// Cupon Associations
Coupon.belongsTo(Event, { foreignKey: 'eventId' });
Event.hasMany(Coupon, { foreignKey: 'eventId' });

Coupon.hasMany(CouponUsage, { foreignKey: 'couponId' });
CouponUsage.belongsTo(Coupon, { foreignKey: 'couponId' });

// Event Associations
Event.belongsTo(User, { as: 'organizer', foreignKey: 'organizerId' });

// Payment Associations
Payment.belongsTo(Ticket, { foreignKey: 'ticketId' });
Ticket.hasOne(Payment, { foreignKey: 'ticketId' });

Payment.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Payment, { foreignKey: 'userId' });

// Referral Associations
Referral.belongsTo(User, { as: 'referrer', foreignKey: 'referrerId' });
Referral.belongsTo(User, { as: 'referredUser', foreignKey: 'referredUserId' });
Referral.belongsTo(Ticket, { foreignKey: 'ticketId' });

CommissionPayout.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(CommissionPayout, { foreignKey: 'userId' });

// Speaker Associations
Speaker.belongsTo(Event, { foreignKey: 'eventId' });
Event.hasMany(Speaker, { foreignKey: 'eventId' });

// Tickets Associations
TicketType.belongsTo(Event, { foreignKey: 'eventId' });
Event.hasMany(TicketType, { foreignKey: 'eventId' });

Ticket.belongsTo(TicketType, { foreignKey: 'ticketTypeId' });
TicketType.hasMany(Ticket, { foreignKey: 'ticketTypeId' });

Ticket.belongsTo(Event, { foreignKey: 'eventId' });
Event.hasMany(Ticket, { foreignKey: 'eventId' });

Ticket.belongsTo(User, { as: 'attendee', foreignKey: 'userId' });
User.hasMany(Ticket, { foreignKey: 'userId' });

Ticket.belongsTo(User, { as: 'referrer', foreignKey: 'referrerId' });

module.exports = {
  User,
  Event,
  Ticket,
  TicketType,
  CheckIn,
  Coupon,
  CouponUsage,
  Payment,
  Referral,
  CommissionPayout,
  Speaker
};