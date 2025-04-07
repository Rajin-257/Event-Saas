const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Event = require('./Event');
const User = require('./User');

// Ticket Type Model
const TicketType = sequelize.define('TicketType', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  eventId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Event,
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  availableQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('vip', 'general', 'premium', 'early_bird', 'other'),
    defaultValue: 'general'
  },
  saleStartDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  saleEndDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

// Ticket Model (purchased tickets)
const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  ticketTypeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: TicketType,
      key: 'id'
    }
  },
  eventId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Event,
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  referrerId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  purchaseDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  purchasePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  finalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('booked', 'confirmed', 'cancelled', 'refunded', 'used'),
    defaultValue: 'booked'
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    defaultValue: 'pending'
  },
  ticketNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  qrCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isCheckedIn: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  checkedInAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  attendeePhoto: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

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


module.exports = { Ticket, TicketType };