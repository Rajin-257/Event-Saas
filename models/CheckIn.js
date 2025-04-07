const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { Ticket } = require('./Ticket');
const User = require('./User');
const Event = require('./Event');

const CheckIn = sequelize.define('CheckIn', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  ticketId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Ticket,
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
  attendeeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  checkedInBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  checkInTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  checkInMethod: {
    type: DataTypes.ENUM('qr_code', 'manual'),
    allowNull: false,
    defaultValue: 'qr_code'
  },
  attendeePhoto: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  deviceInfo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  checkInLocation: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

// CheckIn Association
CheckIn.belongsTo(Ticket, { foreignKey: 'ticketId',onDelete:'CASCADE' });
Ticket.hasOne(CheckIn, { foreignKey: 'ticketId',onDelete:'CASCADE' });

CheckIn.belongsTo(Event, { foreignKey: 'eventId',onDelete:'CASCADE' });
Event.hasMany(CheckIn, { foreignKey: 'eventId',onDelete:'CASCADE' });

CheckIn.belongsTo(User, { as: 'attendee', foreignKey: 'attendeeId',onDelete:'CASCADE' });
CheckIn.belongsTo(User, { as: 'staff', foreignKey: 'checkedInBy',onDelete:'CASCADE' });


module.exports = CheckIn;