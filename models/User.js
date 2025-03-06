// models/User.js
const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sequelize = require("../config/database");
const config = require("../config/config");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Name cannot be empty",
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: "Please provide a valid email",
        },
      },
      set(value) {
        this.setDataValue("email", value.toLowerCase());
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [6, 100],
          msg: "Password must be at least 6 characters long",
        },
      },
    },
    avatar: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    mobile: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    refresh_token: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    verify_email: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM("Active", "inactive", "suspended"),
      defaultValue: "Active",
    },
    last_login_data: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    forgot_pass_otp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    forgot_pass_expiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "user",
    },
    menupuletedby: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  },
);

// Instance methods

// Sign JWT and return
User.prototype.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this.id, email: this.email, role: this.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn },
  );
};

// Match user entered password to hashed password in database
User.prototype.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
User.prototype.generatePasswordResetOTP = async function () {
  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Set expiry time - 30 minutes
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + config.otp.expiryTimeMinutes);

  // Update user with new OTP and expiry
  this.forgot_pass_otp = otp;
  this.forgot_pass_expiry = expiry;
  await this.save();

  return otp;
};

// Generate refresh token
User.prototype.generateRefreshToken = function () {
  const refreshToken = crypto.randomBytes(40).toString("hex");
  this.refresh_token = refreshToken;
  return refreshToken;
};

module.exports = User;
